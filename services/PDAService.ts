import { HatClient, HatClientConfig } from '@dataswift/hat-js';
import * as SecureStore from 'expo-secure-store';

import * as Sentry from 'sentry-expo';
import { TOKEN_STORAGE_KEY } from '../Constants';
import locationService from './LocationService';
import { Linking } from 'expo';

interface ILocationData {
    coords: {
        accuracy: number;
        altitude: number;
        heading: number;
        latitude: number;
        longitude: number;
        speed: number;
    };
    timestamp: number;
}

export interface IPDAService {
    isAuthenticated(): boolean;
    authenticate(config: any): void;
    deleteAccount(): void;
    getLoginUrl(hatDomain: string): Promise<[string | null, string | null]>;
    writeLocationData(location: any): Promise<void>;
    writeHealthSurvey(healthSurvey: st.HealthStatus): Promise<void>;
    requestLocationData(): Promise<ILocationData[]>;
}

export class PDAService implements IPDAService {
    public static APPLICATION_ID: string = 'safe-trace-dev';
    private namespace: string = 'safetrace';
    private hat: HatClient;
    private lastLocationWrite: number | null = null;
    public static LOCATION_WRITE_DELAY: number = 15 * 60000; // 15 minutes

    constructor() {
        this.hat = new HatClient(PDAService.baseConfig) as HatClient;
    }

    private static baseConfig: HatClientConfig = {
        apiVersion: 'v2.6',
        secure: true,
        onTokenChange: async (newToken: string) => {
            SecureStore.setItemAsync(TOKEN_STORAGE_KEY, newToken);
        },
    };

    public async getLoginUrl(
        hatDomain: string
    ): Promise<[string | null, string | null]> {
        const isValidRegisteredHat = await this.hat
            .auth()
            .isDomainRegistered(hatDomain);
        if (!isValidRegisteredHat) {
            return ['The HAT url supplied is not valid', null];
        }
        const redirect = Linking.makeUrl('/login-success');
        const fallback = Linking.makeUrl('/login-failure');

        const url = this.hat
            .auth()
            .generateHatLoginUrl(
                hatDomain,
                PDAService.APPLICATION_ID,
                redirect,
                fallback
            );

        return [null, `https://${url}`];
    }

    public isAuthenticated() {
        try {
            this.hat.isAuthenticated();
            return true;
        } catch (e) {
            return false;
        }
    }
    public getHatDomain() {
        return this.hat.auth().getHatDomain();
    }

    public async authenticate(storageToken: string): Promise<void> {
        const config = {
            ...PDAService.baseConfig,
            token: storageToken,
        };

        this.hat = (await new HatClient(config)) as HatClient;
    }

    private reconcileLocationData(
        writtenData: ILocationData[],
        currentData: ILocationData[]
    ): ILocationData[] {
        return currentData.filter(
            (afterWriteItem: any) =>
                !writtenData.some(
                    (beforeWriteItem: any) =>
                        beforeWriteItem.timestamp === afterWriteItem.timestamp
                )
        );
    }

    public async throttleWriteLocationData() {
        this.lastLocationWrite = this.lastLocationWrite || Date.now();

        if (
            Date.now() - this.lastLocationWrite >=
            PDAService.LOCATION_WRITE_DELAY
        ) {
            await this.writeLocationData();
        } else {
            console.log('PDAService: Skipping write location data');
        }
    }

    public async writeLocationData() {
        if (!this.isAuthenticated()) {
            console.warn('Attempting to write to HAT when unauthorised');
            return;
        }

        this.lastLocationWrite = Date.now();

        const locationDataBeforeWrite = await locationService.getLocations();

        try {
            const result = await this.hat!.hatData().create(
                this.namespace,
                'locations',
                locationDataBeforeWrite
            );

            if (result.parsedBody) {
                console.log('Wrote data to HAT', result.parsedBody);
                try {
                    const locationDataAfterWrite = await locationService.getLocations();

                    const reconciledLocationsToWriteToStorage = this.reconcileLocationData(
                        locationDataBeforeWrite,
                        locationDataAfterWrite
                    );

                    locationService.overwriteExistingLocations(
                        reconciledLocationsToWriteToStorage
                    );
                } catch (error) {
                    console.error(error);
                }
            }
        } catch (error) {
            Sentry.captureException(error);
            console.error('Problem writing data to hat', error.message);
            // Failed to write data...
        }
    }

    public async writeHealthSurvey(healthSurvey: st.HealthStatus) {
        try {
            await this.hat!.hatData().create(
                this.namespace,
                'healthsurveys',
                healthSurvey
            );
        } catch (err) {
            Sentry.captureException(err);
            throw err;
        }
    }

    public async requestLocationData() {
        const data = await this.hat
            .hatData()
            .getAll<ILocationData>('sharetrace', 'locations', {
                orderBy: 'timestamp',
                ordering: 'descending',
            });
        return (
            (data.parsedBody &&
                data.parsedBody.map((dsObject) => dsObject.data)) ||
            []
        );
    }

    public async deleteAccount() {
        try {
            await locationService.stopLocationTracking();
        } catch (err) {
            console.log(err);
        }

        await locationService.deleteLocationStorage();
        await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY);
        await this.hat.auth().signOut();
    }
}

const pdaService = new PDAService();

export default pdaService;

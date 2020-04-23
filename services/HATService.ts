import { HatClient, HatClientConfig } from '@dataswift/hat-js';
import * as SecureStore from 'expo-secure-store';

// import * as TaskManager from 'expo-task-manager';
import * as Sentry from 'sentry-expo';
import { TOKEN_STORAGE_KEY } from '../Constants';
import locationService from './LocationService';

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

export interface IHATService {
    isAuthenticated(): boolean;
    authenticate(config: any): void;
    deleteAccount(): void;
    writeLocationData(location: any): Promise<void>;
    requestLocationData(): Promise<ILocationData[]>;
}

export class HATService implements IHATService {
    private namespace: string = 'safetrace';
    private hat: HatClient;
    private lastLocationWrite: number | null = null;
    public static LOCATION_WRITE_DELAY: number = 15 * 60000; // 15 minutes

    constructor() {
        this.hat = new HatClient(HATService.baseConfig) as HatClient;
    }

    private static baseConfig: HatClientConfig = {
        apiVersion: 'v2.6',
        secure: true,
        onTokenChange: async (newToken: string) => {
            SecureStore.setItemAsync(TOKEN_STORAGE_KEY, newToken);
        },
    };

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
            ...HATService.baseConfig,
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
            HATService.LOCATION_WRITE_DELAY
        ) {
            await this.writeLocationData();
        } else {
            console.log('HATService: Skipping write location data');
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

    public async requestLocationData() {
        const data = await this.hat
            .hatData()
            .getAllDefault<ILocationData>('safetrace', 'locations');
        return (
            (data.parsedBody &&
                data.parsedBody.map((dsObject) => dsObject.data)) ||
            []
        );
    }

    public async deleteAccount() {
        await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY);
        await locationService.stopLocationTracking();
        await this.hat.auth().signOut();
    }
}

const hatService = new HATService();

export default hatService;

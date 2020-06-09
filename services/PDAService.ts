import { HatClient, HatClientConfig } from '@dataswift/hat-js';
import { Linking } from 'expo';
import * as SecureStore from 'expo-secure-store';
import * as Sentry from 'sentry-expo';
import uuid from 'uuid-random';

import { TOKEN_STORAGE_KEY } from '../Constants';

export interface IPDAService {
    isAuthenticated(): boolean;
    authenticate(config: any): void;
    logout(): void;
    getLoginUrl(hatDomain: string): Promise<[string | null, string | null]>;
    writeHealthSurvey(healthSurvey: st.HealthSurvey): Promise<void>;
}

type Location = 'healthsurveys' | 'demographic';

export class PDAService implements IPDAService {
    public static APPLICATION_ID: string = 'sharetrace-dev';
    private namespace: string = 'sharetrace';
    private hat: HatClient;

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

    public async writeHealthSurvey(healthSurvey: st.HealthSurvey) {
        try {
            await this.hat!.hatData().create(this.namespace, 'healthsurveys', {
                id: uuid(),
                ...healthSurvey,
            });
        } catch (err) {
            Sentry.captureException(err);
            throw err;
        }
    }

    public async getHealthSurveys(): Promise<st.HealthSurvey[]> {
        try {
            const pdaResponse = await this.hat!.hatData().getAll<
                st.HealthSurvey
            >(this.namespace, 'healthsurveys', {
                take: '1',
            });
            if (!pdaResponse.parsedBody) {
                throw new Error('No response for getHealthSurveys');
            }

            return pdaResponse.parsedBody.map((record) => record.data);
        } catch (err) {
            Sentry.captureException(err);
            throw err;
        }
    }

    public async logout() {
        await this.hat.auth().signOut();
    }

    //Trying this
    public async writeToLocation<T>(
        location: Location,
        data: T
    ): Promise<void> {
        try {
            await this.hat!.hatData().create<T>(this.namespace, location, data);
        } catch (err) {
            Sentry.captureException(err);
            throw err;
        }
    }
}

const pdaService = new PDAService();

export default pdaService;

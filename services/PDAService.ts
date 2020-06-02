import { HatClient, HatClientConfig } from '@dataswift/hat-js';
import * as SecureStore from 'expo-secure-store';

import * as Sentry from 'sentry-expo';
import { TOKEN_STORAGE_KEY } from '../Constants';
import { Linking } from 'expo';

export interface IPDAService {
    isAuthenticated(): boolean;
    authenticate(config: any): void;
    logout(): void;
    getLoginUrl(hatDomain: string): Promise<[string | null, string | null]>;
    writeHealthSurvey(healthSurvey: st.HealthStatus): Promise<void>;
}

export class PDAService implements IPDAService {
    public static APPLICATION_ID: string = 'safe-trace-dev';
    private namespace: string = 'safetrace';
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

    public async logout() {
        await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY);
        await this.hat.auth().signOut();
    }
}

const pdaService = new PDAService();

export default pdaService;

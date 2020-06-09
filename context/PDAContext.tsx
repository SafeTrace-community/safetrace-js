import React, {
    createContext,
    FunctionComponent,
    useCallback,
    useState,
    useEffect,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import {
    TOKEN_STORAGE_KEY,
    DEMOGRAPHIC_STORAGE_KEY,
    DEMOGRAPHIC_SENT_FLAG,
} from '../Constants';
import pdaService from '../services/PDAService';
import { AsyncStorage } from 'react-native';
import demographicInformationService from '../services/DemographicInformationService';

export interface IPDAContext {
    isInitialized: boolean;
    isAuthenticated: boolean;
    pdaDomain: string;
    getLoginUrl(hatDomain: string): Promise<[string | null, string | null]>;
    healthSurveys: st.HealthSurvey[] | null;
    demographicInformation: st.Demographic | null;
    authenticateFromStoredToken: () => void;
    authenticateWithToken: (token: string) => void;
    logout: () => void;
    getLatestHealthSurveys: (options?: { refresh: boolean }) => Promise<void>;
    writeHealthSurvey: (healthSurvey: st.HealthSurvey) => Promise<void>;
}

export const PDAContext = createContext<IPDAContext>({} as any);

const PDAProvider: FunctionComponent = ({ children }) => {
    const [isInitialized, setIsInitialized] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(
        pdaService.isAuthenticated()
    );
    const [pdaDomain, setPdaDomain] = useState(pdaService.getHatDomain());
    const [healthSurveys, setHealthSurveys] = useState<
        st.HealthSurvey[] | null
    >(null);
    const [
        demographicInformation,
        setDemographicInformation,
    ] = useState<st.Demographic | null>(null);

    useEffect(() => {
        async function getInitialData() {
            const healthSurveysFromStorage = await AsyncStorage.getItem(
                '@PDA:HealthSurveys'
            );

            if (healthSurveysFromStorage) {
                setHealthSurveys(JSON.parse(healthSurveysFromStorage));
            }

            setDemographicInformation(
                await demographicInformationService.get()
            );

            setIsInitialized(true);
        }

        getInitialData();
    }, []);

    useEffect(() => {
        setPdaDomain(pdaService.getHatDomain());
    }, [isAuthenticated]);

    // lifecycle method called when user has logged in/created an account
    const onAuthenticationComplete = useCallback(async () => {
        demographicInformationService.pushToPDA();
    }, []);

    const authenticateFromStoredToken = useCallback(async () => {
        const token = await SecureStore.getItemAsync(TOKEN_STORAGE_KEY);
        if (token) {
            await pdaService.authenticate(token);
            setIsAuthenticated(pdaService.isAuthenticated());
        }
    }, []);

    const authenticateWithToken = useCallback(async (authToken) => {
        try {
            await SecureStore.setItemAsync(TOKEN_STORAGE_KEY, authToken);
        } catch (e) {
            console.error(e);
        }

        await authenticateFromStoredToken();
        await onAuthenticationComplete();
    }, []);

    const logout = useCallback(async () => {
        await pdaService.logout();
        await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY);
        await SecureStore.deleteItemAsync(DEMOGRAPHIC_STORAGE_KEY);
        await SecureStore.deleteItemAsync(DEMOGRAPHIC_SENT_FLAG);
        await AsyncStorage.clear();
        setHealthSurveys([]);
        setIsAuthenticated(pdaService.isAuthenticated());
    }, []);

    const getLoginUrl = useCallback((hatDomain: string) => {
        return pdaService.getLoginUrl(hatDomain);
    }, []);

    const getLatestHealthSurveys = useCallback(
        async (options?: { refresh: boolean }) => {
            if (healthSurveys === null || options?.refresh) {
                const latestHealthSurveys = await pdaService.getHealthSurveys();
                await AsyncStorage.setItem(
                    '@PDA:HealthSurveys',
                    JSON.stringify(latestHealthSurveys)
                );
                setHealthSurveys(latestHealthSurveys);
            }
        },
        [healthSurveys]
    );

    const writeHealthSurvey = useCallback(
        async (healthSurvey: st.HealthSurvey) => {
            await pdaService.writeHealthSurvey(healthSurvey);
            await getLatestHealthSurveys({ refresh: true });
        },
        [healthSurveys]
    );

    const value = {
        isInitialized,
        isAuthenticated,
        authenticateFromStoredToken,
        authenticateWithToken,
        pdaDomain,
        logout,
        getLoginUrl,
        getLatestHealthSurveys,
        healthSurveys,
        writeHealthSurvey,
        demographicInformation,
    };

    return <PDAContext.Provider value={value}>{children}</PDAContext.Provider>;
};

export default PDAProvider;

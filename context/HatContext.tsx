import React, {
    createContext,
    FunctionComponent,
    useCallback,
    useState,
    useEffect,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import { TOKEN_STORAGE_KEY } from '../Constants';
import pdaService from '../services/PDAService';

export interface IHatContext {
    isAuthenticated: boolean;
    authenticateFromStoredToken: () => void;
    logout: () => void;
    authenticateWithToken: (token: string) => void;
    hatDomain: string;
    getLoginUrl(hatDomain: string): Promise<[string | null, string | null]>;
    healthSurveys: st.HealthStatus[];
    getHealthSurveys: () => Promise<st.HealthStatus[]>;
}

export const HatContext = createContext<IHatContext>({} as any);

const HatProvider: FunctionComponent = ({ children }) => {
    const [isAuthenticated, setIsHatAuthenticated] = useState(
        pdaService.isAuthenticated()
    );

    const [hatDomain, setHatDomain] = useState(pdaService.getHatDomain());

    const [healthSurveys, setHealthSurveys] = useState<st.HealthStatus[]>([]);

    useEffect(() => {
        setHatDomain(pdaService.getHatDomain());
    }, [isAuthenticated]);

    const authenticateFromStoredToken = useCallback(async () => {
        const token = await SecureStore.getItemAsync(TOKEN_STORAGE_KEY);
        if (token) {
            await pdaService.authenticate(token);
            setIsHatAuthenticated(pdaService.isAuthenticated());
        }
    }, []);

    const authenticateWithToken = useCallback(async (authToken) => {
        try {
            await SecureStore.setItemAsync(TOKEN_STORAGE_KEY, authToken);
        } catch (e) {
            console.error(e);
        }

        authenticateFromStoredToken();
    }, []);

    const logout = useCallback(async () => {
        await pdaService.logout();
        setIsHatAuthenticated(pdaService.isAuthenticated());
    }, []);

    const getLoginUrl = useCallback((hatDomain: string) => {
        return pdaService.getLoginUrl(hatDomain);
    }, []);

    const getHealthSurveys = useCallback(async () => {
        const healthSurveys = await pdaService.getHealthSurveys();
        setHealthSurveys(healthSurveys);
    }, []);

    const value = {
        isAuthenticated,
        authenticateFromStoredToken,
        authenticateWithToken,
        hatDomain,
        logout,
        getLoginUrl,
        getHealthSurveys,
        healthSurveys,
    };

    return <HatContext.Provider value={value}>{children}</HatContext.Provider>;
};

export default HatProvider;

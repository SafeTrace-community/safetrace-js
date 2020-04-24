import React, {
    createContext,
    FunctionComponent,
    useCallback,
    useState,
    useEffect,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import { TOKEN_STORAGE_KEY } from '../Constants';
import hatService from '../services/HATService';

export interface IHatContext {
    isAuthenticated: boolean;
    authenticateFromStoredToken: () => void;
    deleteAccount: () => void;
    authenticateWithToken: (token: string) => void;
    hatDomain: string;
    getLoginUrl(hatDomain: string): Promise<[string | null, string | null]>;
}

export const HatContext = createContext<IHatContext>({} as any);

const HatProvider: FunctionComponent = ({ children }) => {
    const [isAuthenticated, setIsHatAuthenticated] = useState(
        hatService.isAuthenticated()
    );

    const [hatDomain, setHatDomain] = useState(hatService.getHatDomain());

    useEffect(() => {
        setHatDomain(hatService.getHatDomain());
    }, [isAuthenticated]);

    const authenticateFromStoredToken = useCallback(async () => {
        const token = await SecureStore.getItemAsync(TOKEN_STORAGE_KEY);
        if (token) {
            await hatService.authenticate(token);
            setIsHatAuthenticated(hatService.isAuthenticated());
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

    const deleteAccount = useCallback(async () => {
        await hatService.deleteAccount();
        setIsHatAuthenticated(hatService.isAuthenticated());
    }, []);

    const getLoginUrl = useCallback((hatDomain: string) => {
        return hatService.getLoginUrl(hatDomain);
    }, []);

    const value = {
        isAuthenticated,
        authenticateFromStoredToken,
        authenticateWithToken,
        hatDomain,
        deleteAccount,
        getLoginUrl,
    };

    return <HatContext.Provider value={value}>{children}</HatContext.Provider>;
};

export default HatProvider;

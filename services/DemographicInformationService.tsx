import * as SecureStore from 'expo-secure-store';

import { DEMOGRAPHIC_STORAGE_KEY } from '../Constants';

interface IDemographicInformationService {
    saveDemographicInformation(demographicInfo: st.Demographic): Promise<void>;
    getDemographicInformation(): Promise<st.Demographic | null>;
}

export class DemographicInformationService
    implements IDemographicInformationService {
    public async saveDemographicInformation(demographicInfo: st.Demographic) {
        await SecureStore.setItemAsync(
            DEMOGRAPHIC_STORAGE_KEY,
            JSON.stringify(demographicInfo)
        );
    }

    public async getDemographicInformation(): Promise<st.Demographic | null> {
        const jsonString = await SecureStore.getItemAsync(
            DEMOGRAPHIC_STORAGE_KEY
        );

        if (jsonString) {
            return JSON.parse(jsonString);
        }

        return null;
    }
}

export default new DemographicInformationService();

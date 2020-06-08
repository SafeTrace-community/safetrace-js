import * as SecureStore from 'expo-secure-store';
import { DEMOGRAPHIC_STORAGE_KEY, DEMOGRAPHIC_SENT_FLAG } from '../Constants';
import pdaService from './PDAService';
import { AsyncStorage } from 'react-native';

interface IDemographicInformationService {
    saveDemographicInformation(demographicInfo: st.Demographic): Promise<void>;
    getDemographicInformation(): Promise<st.Demographic | null>;
    pushToPDA(): Promise<void>;
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

    public async pushToPDA(): Promise<void> {
        const hasPushed = await AsyncStorage.getItem(DEMOGRAPHIC_SENT_FLAG);

        if (hasPushed) {
            return;
        }

        const demographicInfo = await this.getDemographicInformation();
        await pdaService.writeToLocation('demographic', demographicInfo);
        await AsyncStorage.setItem(DEMOGRAPHIC_SENT_FLAG, 'true');
    }
}

export default new DemographicInformationService();

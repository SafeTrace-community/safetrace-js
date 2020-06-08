import * as SecureStore from 'expo-secure-store';
import demographicInformationService from './DemographicInformationService';

import { DEMOGRAPHIC_STORAGE_KEY } from '../Constants';

jest.mock('expo-secure-store');

const mockSecureStore: jest.Mocked<typeof SecureStore> = SecureStore as any;

describe('DemographicInformationService', () => {
    test('saving demographic information in storage', async () => {
        const info: st.Demographic = {
            age: 55,
            sex: 'female',
        };

        await demographicInformationService.saveDemographicInformation(info);

        expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
            DEMOGRAPHIC_STORAGE_KEY,
            JSON.stringify(info)
        );
    });

    describe('getting demographic info', () => {
        test('returning null when no demographic information is in storage', async () => {
            const demographicInfo = await demographicInformationService.getDemographicInformation();

            expect(mockSecureStore.getItemAsync).toHaveBeenCalledWith(
                DEMOGRAPHIC_STORAGE_KEY
            );
            expect(demographicInfo).toEqual(null);
        });

        test('returning demographic information from storage', async () => {
            const savedInfo: st.Demographic = {
                age: 55,
                sex: 'female',
            };
            mockSecureStore.getItemAsync.mockResolvedValue(
                JSON.stringify(savedInfo)
            );
            const demographicInfo = await demographicInformationService.getDemographicInformation();

            expect(mockSecureStore.getItemAsync).toHaveBeenCalledWith(
                DEMOGRAPHIC_STORAGE_KEY
            );
            expect(demographicInfo).toEqual(savedInfo);
        });
    });
});

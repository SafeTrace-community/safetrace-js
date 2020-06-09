import * as SecureStore from 'expo-secure-store';
import { AsyncStorage } from 'react-native';
import demographicInformationService from './DemographicInformationService';

import { DEMOGRAPHIC_STORAGE_KEY, DEMOGRAPHIC_SENT_FLAG } from '../Constants';
import pdaService from './PDAService';
import { wait } from '@testing-library/react-native';

jest.mock('expo-secure-store');
jest.mock('./PDAService');

const mockSecureStore: jest.Mocked<typeof SecureStore> = SecureStore as any;
const mockPDAService: jest.Mocked<typeof pdaService> = pdaService as any;

describe('DemographicInformationService', () => {
    beforeEach(() => {
        mockPDAService.writeToLocation.mockReset();
    });

    test('saving demographic information in storage', async () => {
        const info: st.Demographic = {
            age: 55,
            sex: 'female',
        };

        await demographicInformationService.save(info);

        expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
            DEMOGRAPHIC_STORAGE_KEY,
            JSON.stringify(info)
        );
    });

    describe('getting demographic info', () => {
        test('returning null when no demographic information is in storage', async () => {
            const demographicInfo = await demographicInformationService.get();

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
            const demographicInfo = await demographicInformationService.get();

            expect(mockSecureStore.getItemAsync).toHaveBeenCalledWith(
                DEMOGRAPHIC_STORAGE_KEY
            );
            expect(demographicInfo).toEqual(savedInfo);
        });
    });

    describe('pushing demographic information to the PDA', () => {
        test('fetching from storage and saving', async () => {
            mockPDAService.writeToLocation.mockResolvedValue({} as any);
            const AsyncStorageSetSpy = jest.spyOn(AsyncStorage, 'setItem');
            const savedInfo: st.Demographic = {
                age: 55,
                sex: 'female',
            };
            mockSecureStore.getItemAsync.mockResolvedValue(
                JSON.stringify(savedInfo)
            );

            await demographicInformationService.pushToPDA();

            expect(mockPDAService.writeToLocation).toHaveBeenCalledWith(
                'demographic',
                savedInfo
            );

            await wait(() =>
                expect(AsyncStorageSetSpy).toHaveBeenCalledWith(
                    DEMOGRAPHIC_SENT_FLAG,
                    'true'
                )
            );
        });

        test('preventing a repeat push', async () => {
            const AsyncStorageSetSpy = jest
                .spyOn(AsyncStorage, 'getItem')
                .mockResolvedValue('true');

            await demographicInformationService.pushToPDA();

            expect(mockPDAService.writeToLocation).not.toHaveBeenCalled();
        });
    });
});

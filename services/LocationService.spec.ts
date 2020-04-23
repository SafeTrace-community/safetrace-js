import { AsyncStorage } from 'react-native';

import locationService, {
    ILocationData,
    LocationService,
} from './LocationService';

jest.mock('expo-location', () => ({}));

jest.mock('expo-task-manager', () => ({}));

jest.mock('react-native', () => ({
    AsyncStorage: {
        setItem: jest.fn().mockResolvedValue({}),
        getItem: jest.fn().mockResolvedValue({}),
    },
}));

const MockAsyncStorage = AsyncStorage as jest.Mocked<AsyncStorage>;

describe('Location Service', () => {
    beforeEach(() => {
        MockAsyncStorage.setItem.mockClear();
        MockAsyncStorage.getItem.mockClear();
    });
    describe('saving data', () => {
        test('saving new location data to AsyncStorage', async () => {
            const locationData = [
                {
                    coords: { longitude: 1, latitude: 3 },
                    timestamp: 32454,
                } as ILocationData,
            ];

            MockAsyncStorage.getItem.mockResolvedValueOnce('[]');
            await locationService.addLocations(locationData);

            expect(MockAsyncStorage.setItem).toBeCalledWith(
                LocationService.LOCATION_STORAGE_KEY,
                JSON.stringify(locationData)
            );
        });

        test('saving new data when some is already in the storage', async () => {
            const existingLocation = {
                coords: { longitude: 1, latitude: 3 },
                timestamp: 54354,
            } as ILocationData;

            const newLocation = {
                coords: { longitude: 1, latitude: 3 },
                timestamp: 324333,
            } as ILocationData;

            MockAsyncStorage.getItem.mockResolvedValueOnce(
                JSON.stringify([existingLocation])
            );
            await locationService.addLocations([newLocation]);

            expect(MockAsyncStorage.setItem).toBeCalledWith(
                LocationService.LOCATION_STORAGE_KEY,
                JSON.stringify([existingLocation, newLocation])
            );
        });

        test('not saving a location with exactly the same timestamp as one already saved', async () => {
            const newLocation = {
                coords: { longitude: 1, latitude: 3 },
                timestamp: 54354,
            } as ILocationData;

            MockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify([]));

            await locationService.addLocations([newLocation, newLocation]);

            expect(MockAsyncStorage.setItem).toBeCalledWith(
                LocationService.LOCATION_STORAGE_KEY,
                JSON.stringify([newLocation])
            );
        });

        test('resetting the cache data', async () => {
            const existingLocation = {
                coords: { longitude: 1, latitude: 3 },
                timestamp: 54354,
            } as ILocationData;

            MockAsyncStorage.getItem.mockResolvedValueOnce(
                JSON.stringify([existingLocation])
            );

            await locationService.overwriteExistingLocations([]);

            expect(MockAsyncStorage.setItem).toBeCalledWith(
                LocationService.LOCATION_STORAGE_KEY,
                JSON.stringify([])
            );
        });
    });
});

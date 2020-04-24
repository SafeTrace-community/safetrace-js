import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { TASK_BACKGROUND_LOCATION_NAME } from '../Constants';
import { AsyncStorage } from 'react-native';
import uniqBy from 'lodash.uniqby';
export interface ILocationData {
    coords: {
        accuracy: number;
        altitude: number;
        heading: number;
        latitude: number;
        longitude: number;
        speed: number;
    };
    timestamp: number;
}

export interface ILocationService {
    startLocationTracking(): Promise<void>;
    stopLocationTracking(): Promise<void>;

    addLocations(location: ILocationData[]): Promise<void>;
    getLocations(): Promise<ILocationData[]>;
    overwriteExistingLocations(locations: ILocationData[]): Promise<void>;
    deleteLocationStorage(): Promise<void>;
}

export class LocationService implements ILocationService {
    public static LOCATION_STORAGE_KEY = '@safetrace:locationData';

    public async startLocationTracking() {
        const isRegistered = await TaskManager.isTaskRegisteredAsync(
            TASK_BACKGROUND_LOCATION_NAME
        );

        if (!isRegistered) {
            await Location.startLocationUpdatesAsync(
                TASK_BACKGROUND_LOCATION_NAME,
                {
                    accuracy: Location.Accuracy.High,
                    activityType: Location.ActivityType.AutomotiveNavigation,
                    pausesUpdatesAutomatically: false,
                    timeInterval: 2 * 60000,
                    distanceInterval: 2,
                }
            );
        }
    }

    public async stopLocationTracking() {
        console.log('Unregistering the background tracking task');
        await Location.stopLocationUpdatesAsync(TASK_BACKGROUND_LOCATION_NAME);
    }

    public async getLocations() {
        try {
            const locationData = await AsyncStorage.getItem(
                LocationService.LOCATION_STORAGE_KEY
            );
            return (locationData && JSON.parse(locationData)) || [];
        } catch (error) {
            console.error(error);
        }
    }

    public async addLocations(newLocations: ILocationData[]) {
        try {
            let storedLocationData = await this.getLocations();
            const newLocationsWithUniqueTimestamps = uniqBy(
                newLocations,
                'timestamp'
            );
            const newLocationData = [
                ...storedLocationData,
                ...newLocationsWithUniqueTimestamps,
            ];

            try {
                await AsyncStorage.setItem(
                    LocationService.LOCATION_STORAGE_KEY,
                    JSON.stringify(newLocationData)
                );
            } catch (error) {
                console.error(error);
            }
        } catch (e) {
            console.error(e);
        }
    }

    public async overwriteExistingLocations(locations: ILocationData[]) {
        try {
            await AsyncStorage.setItem(
                LocationService.LOCATION_STORAGE_KEY,
                JSON.stringify([...locations])
            );
        } catch (error) {
            console.error(error);
        }
    }

    public async deleteLocationStorage(): Promise<void> {
        try {
            await AsyncStorage.removeItem(LocationService.LOCATION_STORAGE_KEY);
        } catch (error) {
            console.error(error);
        }
    }
}

export default new LocationService();

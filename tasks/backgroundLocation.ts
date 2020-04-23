import * as TaskManager from 'expo-task-manager';
import HATService from '../services/HATService';

import locationService from '../services/LocationService';
import { TASK_BACKGROUND_LOCATION_NAME } from '../Constants';
import hatService from '../services/HATService';

TaskManager.defineTask(
    TASK_BACKGROUND_LOCATION_NAME,
    //@ts-ignore
    async ({ data: { locations }, error }) => {
        if (error) {
            console.error('Background Location Error: ', error);
            // check `error.message` for more details.
            return;
        }

        console.log('Received new background locations', locations);

        if (HATService.isAuthenticated()) {
            await locationService.addLocations(locations);
            await hatService.throttleWriteLocationData();
        } else {
            console.warn('not logging to dataswift currently');
        }
    }
);

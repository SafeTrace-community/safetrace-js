import * as TaskManager from 'expo-task-manager';
import PDAService from '../services/PDAService';

import locationService from '../services/LocationService';
import { TASK_BACKGROUND_LOCATION_NAME } from '../Constants';
import pdaService from '../services/PDAService';

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

        if (PDAService.isAuthenticated()) {
            await locationService.addLocations(locations);
            await pdaService.throttleWriteLocationData();
        } else {
            console.warn('not logging to dataswift currently');
        }
    }
);

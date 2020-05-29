import * as TaskManager from 'expo-task-manager';
import pdaService, { PDAService } from '../services/PDAService';
import locationService, { LocationService } from '../services/LocationService';
import { TASK_BACKGROUND_LOCATION_NAME } from '../Constants';
import './backgroundLocation';

jest.mock('expo-task-manager');
jest.mock('../services/PDAService');
jest.mock('../services/LocationService');

const mockedPdaService = pdaService as jest.Mocked<PDAService>;
const mockLocationService = locationService as jest.Mocked<LocationService>;

describe('Background location task', () => {
    const defineTaskMock: jest.Mock = TaskManager.defineTask as jest.Mock;

    beforeEach(() => {
        mockLocationService.addLocations.mockReset();
        jest.useFakeTimers();
    });

    test('registering the background task with the task manager', () => {
        expect(defineTaskMock).toHaveBeenCalledWith(
            TASK_BACKGROUND_LOCATION_NAME,
            expect.any(Function)
        );
    });

    test('storing new location on the location service', async () => {
        const event = { data: { locations: [{}] }, error: null };
        const taskFn = defineTaskMock.mock.calls[0][1];

        mockedPdaService.isAuthenticated.mockReturnValue(true);
        taskFn(event);

        jest.runAllTimers();

        expect(mockLocationService.addLocations).toHaveBeenCalled();
    });

    test('requesting to write locations to HAT on a throttle', async () => {
        const event = { data: { locations: [{}] }, error: null };
        const taskFn = defineTaskMock.mock.calls[0][1];

        mockedPdaService.isAuthenticated.mockReturnValue(true);
        taskFn(event);

        expect(mockedPdaService.throttleWriteLocationData).toHaveBeenCalled();
    });
});

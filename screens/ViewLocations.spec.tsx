import React from 'react';
import { render, wait, act, within } from '@testing-library/react-native';
import ViewLocations from './ViewLocations';
import pdaService, { PDAService } from '../services/PDAService';
import { ILocationData } from '../services/LocationService';

jest.mock('../services/PDAService');

const mockedPdaService = pdaService as jest.Mocked<PDAService>;

describe('Location logs screen', () => {
    afterEach(() => {
        mockedPdaService.requestLocationData.mockReset();
    });

    test('Display a holding message when no locations are stored in the HAT', async () => {
        const locations: ILocationData[] = [];

        mockedPdaService.requestLocationData.mockResolvedValueOnce(locations);

        const { getByTestId } = render(
            <ViewLocations navigation={{} as any} />
        );

        await act(async () => {
            await wait(() => expect(getByTestId('noLogsNotice')).toBeTruthy());
        });
    });

    test('output the logs stored in your HAT', async () => {
        const locations = [
            {
                coords: {
                    speed: -1,
                    heading: -1,
                    accuracy: 65,
                    altitude: 19.153566360473633,
                    latitude: 51.5302747697369,
                    longitude: -0.09434700051002931,
                    altitudeAccuracy: 10,
                },
                timestamp: 1587588327022.461,
            },
        ];

        mockedPdaService.requestLocationData.mockResolvedValueOnce(locations);

        const { getAllByTestId } = render(
            <ViewLocations navigation={{} as any} />
        );

        await act(async () => {
            await wait(() => expect(getAllByTestId('log')).toHaveLength(1));

            const logListItem = getAllByTestId('log')[0];

            expect(
                within(logListItem).getByTestId('latitude').props.children
            ).toEqual(51.5302747697369);
            expect(
                within(logListItem).getByTestId('longitude').props.children
            ).toEqual(-0.09434700051002931);
            expect(
                within(logListItem).getByTestId('altitude').props.children
            ).toEqual(19.153566360473633);
        });
    });

    test('pulling to refresh', async () => {
        const locations: ILocationData[] = [];
        mockedPdaService.requestLocationData.mockResolvedValue(locations);

        const { getByTestId } = render(
            <ViewLocations navigation={{} as any} />
        );

        await act(async () => {
            await wait(() => expect(getByTestId('logList')).toBeTruthy());

            const logList = getByTestId('logList');
            const onRefresh = logList.props.onRefresh;

            expect(mockedPdaService.requestLocationData).toHaveBeenCalledTimes(
                1
            );

            onRefresh();

            expect(mockedPdaService.requestLocationData).toHaveBeenCalledTimes(
                2
            );
        });
    });

    test('handling malformed data from dataswift', async () => {
        const locations = [
            {
                banter: 'something definitely went wrong',
            },
        ];

        mockedPdaService.requestLocationData.mockResolvedValueOnce(
            locations as any
        );

        const { getByTestId } = render(
            <ViewLocations navigation={{} as any} />
        );

        await act(async () => {
            await wait(() =>
                expect(
                    within(getByTestId('logList')).getByTestId(
                        'malformedLocationPoint'
                    ).props.children
                ).toEqual('Malformed location point')
            );
        });
    });
});

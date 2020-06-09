import React, { useContext, FunctionComponent, useEffect } from 'react';
import {
    render,
    cleanup,
    act,
    wait,
    fireEvent,
} from '@testing-library/react-native';
import { Text, Button, AsyncStorage } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import PDAProvider, { PDAContext } from './PDAContext';
import pdaService, { PDAService } from '../services/PDAService';
import { TOKEN_STORAGE_KEY } from '../Constants';
import demographicInformationService from '../services/DemographicInformationService';

jest.mock('expo-secure-store');
jest.mock('sentry-expo', () => ({}));
jest.mock('../services/PDAService');
jest.mock('../services/DemographicInformationService');

const mockSecureStore: jest.Mocked<typeof SecureStore> = SecureStore as any;
const mockPdaService = pdaService as jest.Mocked<PDAService>;
const mockDemographicInformationService: jest.Mocked<typeof demographicInformationService> = demographicInformationService as any;

describe('PDAContext provider', () => {
    beforeEach(cleanup);

    function renderComponent(Component: FunctionComponent) {
        return render(
            <PDAProvider>
                <Component />
            </PDAProvider>
        );
    }

    test('determining if the data has been initialized', async () => {
        const AsyncStorageGetSpy = jest.spyOn(AsyncStorage, 'getItem');

        const demographicInfoPromise = Promise.resolve({} as any);
        const healthSurveyPromise = Promise.resolve('[]');

        AsyncStorageGetSpy.mockReturnValue(healthSurveyPromise);
        mockDemographicInformationService.get.mockReturnValue(
            demographicInfoPromise
        );

        const TestComponent: FunctionComponent = () => {
            const { isInitialized } = useContext(PDAContext);

            return (
                <Text testID="isInitialized">
                    {isInitialized ? 'true' : 'false'}
                </Text>
            );
        };

        const { getByTestId } = renderComponent(TestComponent);

        expect(getByTestId('isInitialized').children.join('')).toEqual('false');

        await act(async () => {
            await healthSurveyPromise;
            await demographicInfoPromise;
        });

        expect(getByTestId('isInitialized').children.join('')).toEqual('true');

        AsyncStorageGetSpy.mockRestore();
    });

    describe('is authenticated', () => {
        test('default value is whatever the PDAService.isAuthenticated returns (true)', () => {
            mockPdaService.isAuthenticated.mockReturnValue(true);

            const TestComponent: FunctionComponent = () => {
                const { isAuthenticated } = useContext(PDAContext);

                return (
                    <Text testID="isAuthenticated">
                        {isAuthenticated ? 'true' : 'false'}
                    </Text>
                );
            };

            const { getByTestId } = renderComponent(TestComponent);
            expect(getByTestId('isAuthenticated').children.join('')).toEqual(
                'true'
            );
        });

        test('default value is whatever the PDAService.isAuthenticated returns (false)', () => {
            mockPdaService.isAuthenticated.mockReturnValue(false);

            const TestComponent: FunctionComponent = () => {
                const { isAuthenticated } = useContext(PDAContext);

                return (
                    <Text testID="isAuthenticated">
                        {isAuthenticated ? 'true' : 'false'}
                    </Text>
                );
            };

            const { getByTestId } = renderComponent(TestComponent);
            expect(getByTestId('isAuthenticated').children.join('')).toEqual(
                'false'
            );
        });
    });

    describe('authenticateFromStoredToken', () => {
        test('calling authenticate on the PDA service from a stored token', async () => {
            const TOKEN = '12345';

            //@ts-ignore
            SecureStore.getItemAsync.mockResolvedValue(TOKEN);
            mockPdaService.authenticate.mockResolvedValue();

            const TestComponent: FunctionComponent = () => {
                const {
                    isAuthenticated,
                    authenticateFromStoredToken,
                } = useContext(PDAContext);

                useEffect(() => {
                    authenticateFromStoredToken();
                }, []);

                return (
                    <Text testID="isAuthenticated">
                        {isAuthenticated ? 'true' : 'false'}
                    </Text>
                );
            };

            const { getByTestId } = renderComponent(TestComponent);

            expect(getByTestId('isAuthenticated').children.join('')).toEqual(
                'false'
            );

            mockPdaService.isAuthenticated.mockReturnValue(true);

            await act(async () => {
                await wait(() =>
                    expect(pdaService.authenticate).toBeCalledWith(TOKEN)
                );

                await wait(() =>
                    expect(
                        getByTestId('isAuthenticated').children.join('')
                    ).toEqual('true')
                );
            });
        });
    });

    describe('log out of PDA', () => {
        test('calls logout PDAService and updates isAuthenticated from PDAservice', async () => {
            mockPdaService.isAuthenticated.mockReturnValue(false);

            const TestComponent: FunctionComponent = () => {
                const { isAuthenticated, logout } = useContext(PDAContext);

                return (
                    <>
                        <Text testID="isAuthenticated">
                            {isAuthenticated ? 'true' : 'false'}
                        </Text>
                        <Button
                            title="delete account"
                            testID="logoutButton"
                            onPress={() => logout()}
                        />
                    </>
                );
            };

            const { getByTestId } = renderComponent(TestComponent);
            expect(getByTestId('isAuthenticated').children.join('')).toEqual(
                'false'
            );
            const logoutButton = getByTestId('logoutButton');
            mockPdaService.isAuthenticated.mockReturnValue(true);

            fireEvent.press(logoutButton);

            await act(async () =>
                wait(() => {
                    expect(mockPdaService.logout).toBeCalled();

                    expect(SecureStore.deleteItemAsync).toBeCalledWith(
                        TOKEN_STORAGE_KEY
                    );

                    expect(
                        getByTestId('isAuthenticated').children.join('')
                    ).toEqual('true');
                })
            );
        });
    });

    describe('getting latest health surveys', () => {
        beforeEach(() => {
            mockPdaService.getHealthSurveys.mockReset();
        });

        test('retrieving latest health surveys from Async Storage on load', async () => {
            const AsyncStorageGetSpy = jest.spyOn(AsyncStorage, 'getItem');
            const healthSurveysFromStorage: st.HealthSurvey[] = [
                { symptoms: ['fatigue'], timestamp: Date.now() },
            ];

            AsyncStorageGetSpy.mockResolvedValue(
                JSON.stringify(healthSurveysFromStorage)
            );

            const TestComponent: FunctionComponent = () => {
                const { healthSurveys } = useContext(PDAContext);

                return (
                    <>
                        <Text testID="healthSurveys">
                            {JSON.stringify(healthSurveys)}
                        </Text>
                    </>
                );
            };

            const { getByTestId } = renderComponent(TestComponent);
            expect(AsyncStorageGetSpy).toBeCalledWith('@PDA:HealthSurveys');

            await act(async () =>
                wait(() => {
                    expect(
                        getByTestId('healthSurveys').children.join('')
                    ).toEqual(JSON.stringify(healthSurveysFromStorage));
                })
            );
            AsyncStorageGetSpy.mockRestore();
        });

        test("calling the PDA if we don't have a latest health surveys", async () => {
            const healthSurveysFromPDA: st.HealthSurvey[] = [
                { symptoms: ['fatigue'], timestamp: Date.now() },
            ];

            mockPdaService.getHealthSurveys.mockResolvedValue(
                healthSurveysFromPDA
            );

            const TestComponent: FunctionComponent = () => {
                const { getLatestHealthSurveys, healthSurveys } = useContext(
                    PDAContext
                );

                return (
                    <>
                        <Text testID="healthSurveys">
                            {JSON.stringify(healthSurveys)}
                        </Text>
                        <Button
                            title="getLatestHealthSurveys"
                            testID="getLatestHealthSurveys"
                            onPress={() => getLatestHealthSurveys()}
                        />
                    </>
                );
            };

            const { getByTestId } = renderComponent(TestComponent);
            expect(getByTestId('healthSurveys').children.join('')).toEqual(
                JSON.stringify(null)
            );

            fireEvent.press(getByTestId('getLatestHealthSurveys'));

            await act(async () =>
                wait(() => {
                    expect(mockPdaService.getHealthSurveys).toBeCalled();

                    expect(
                        getByTestId('healthSurveys').children.join('')
                    ).toEqual(JSON.stringify(healthSurveysFromPDA));
                })
            );
        });

        test('storing latest health surveys in async storage', async () => {
            const healthSurveysFromPDA: st.HealthSurvey[] = [
                { symptoms: ['fatigue'], timestamp: Date.now() },
            ];

            mockPdaService.getHealthSurveys.mockResolvedValue(
                healthSurveysFromPDA
            );

            const TestComponent: FunctionComponent = () => {
                const { getLatestHealthSurveys, healthSurveys } = useContext(
                    PDAContext
                );

                return (
                    <>
                        <Text testID="healthSurveys">
                            {JSON.stringify(healthSurveys)}
                        </Text>
                        <Button
                            title="getLatestHealthSurveys"
                            testID="getLatestHealthSurveys"
                            onPress={() => getLatestHealthSurveys()}
                        />
                    </>
                );
            };

            const { getByTestId } = renderComponent(TestComponent);
            expect(getByTestId('healthSurveys').children.join('')).toEqual(
                JSON.stringify(null)
            );

            fireEvent.press(getByTestId('getLatestHealthSurveys'));
            const AsyncStorageSetSpy = jest.spyOn(AsyncStorage, 'setItem');
            await act(async () =>
                wait(() => {
                    expect(AsyncStorageSetSpy).toBeCalledWith(
                        '@PDA:HealthSurveys',
                        JSON.stringify(healthSurveysFromPDA)
                    );
                })
            );
            AsyncStorageSetSpy.mockRestore();
        });

        test('not calling the PDA if we already have a (even empty) collection of latest health surveys', async () => {
            const healthSurveysFromPDA: st.HealthSurvey[] = [];

            mockPdaService.getHealthSurveys.mockResolvedValue(
                healthSurveysFromPDA
            );

            const TestComponent: FunctionComponent = () => {
                const { getLatestHealthSurveys, healthSurveys } = useContext(
                    PDAContext
                );

                return (
                    <>
                        <Text testID="healthSurveys">
                            {JSON.stringify(healthSurveys)}
                        </Text>
                        <Button
                            title="getLatestHealthSurveys"
                            testID="getLatestHealthSurveys"
                            onPress={() => getLatestHealthSurveys()}
                        />
                    </>
                );
            };

            const { getByTestId } = renderComponent(TestComponent);

            await act(async () =>
                wait(() => {
                    fireEvent.press(getByTestId('getLatestHealthSurveys'));
                })
            );

            await act(async () =>
                wait(() => {
                    fireEvent.press(getByTestId('getLatestHealthSurveys'));
                })
            );

            expect(mockPdaService.getHealthSurveys).toBeCalledTimes(1);
        });

        test('force calling the PDA with a refresh parameter', async () => {
            const healthSurveysFromPDA: st.HealthSurvey[] = [];

            mockPdaService.getHealthSurveys.mockResolvedValue(
                healthSurveysFromPDA
            );

            const TestComponent: FunctionComponent = () => {
                const { getLatestHealthSurveys, healthSurveys } = useContext(
                    PDAContext
                );

                return (
                    <>
                        <Text testID="healthSurveys">
                            {JSON.stringify(healthSurveys)}
                        </Text>
                        <Button
                            title="getLatestHealthSurveys"
                            testID="getLatestHealthSurveys"
                            onPress={() => getLatestHealthSurveys()}
                        />

                        <Button
                            title="getLatestHealthSurveysRefresh"
                            testID="getLatestHealthSurveysRefresh"
                            onPress={() =>
                                getLatestHealthSurveys({ refresh: true })
                            }
                        />
                    </>
                );
            };

            const { getByTestId } = renderComponent(TestComponent);

            await act(async () =>
                wait(() => {
                    fireEvent.press(getByTestId('getLatestHealthSurveys'));
                })
            );

            await act(async () =>
                wait(() => {
                    fireEvent.press(
                        getByTestId('getLatestHealthSurveysRefresh')
                    );
                })
            );

            expect(mockPdaService.getHealthSurveys).toBeCalledTimes(2);
        });
    });

    describe('getting demographic information', () => {
        beforeEach(() => {
            mockDemographicInformationService.get.mockReset();
        });

        test('retrieving the demographic information', async () => {
            const demographicInfo: st.Demographic = {
                age: 60,
                sex: 'female',
            };
            mockDemographicInformationService.get.mockResolvedValue(
                demographicInfo
            );

            const TestComponent: FunctionComponent = () => {
                const { demographicInformation } = useContext(PDAContext);

                return (
                    <>
                        <Text testID="demographicInformation">
                            {JSON.stringify(demographicInformation)}
                        </Text>
                    </>
                );
            };

            const { getByTestId } = renderComponent(TestComponent);

            await act(async () => {
                await wait(() =>
                    expect(
                        mockDemographicInformationService.get
                    ).toHaveBeenCalled()
                );
            });

            expect(
                getByTestId('demographicInformation').children.join('')
            ).toEqual(JSON.stringify(demographicInfo));
        });

        test('pushing to PDA after creating/logging into account', async () => {
            const TOKEN = '12345';
            mockSecureStore.getItemAsync.mockResolvedValue(TOKEN);
            mockPdaService.authenticate.mockResolvedValue();

            const TestComponent: FunctionComponent = () => {
                const { authenticateWithToken } = useContext(PDAContext);

                useEffect(() => {
                    authenticateWithToken(TOKEN);
                }, []);

                return <Text>Logging into PDA</Text>;
            };

            renderComponent(TestComponent);

            await act(async () => {
                await wait(() =>
                    expect(
                        mockDemographicInformationService.pushToPDA
                    ).toHaveBeenCalled()
                );
            });
        });
    });

    describe('writing a health survey', () => {
        beforeEach(() => {
            mockPdaService.getHealthSurveys.mockReset();
            mockPdaService.writeHealthSurvey.mockReset();
        });

        test('writing health survey to PDA Service', async () => {
            const healthSurveyToWrite: st.HealthSurvey = {
                symptoms: ['fatigue'],
                timestamp: Date.now(),
            };
            const TestComponent: FunctionComponent = () => {
                const { writeHealthSurvey, healthSurveys } = useContext(
                    PDAContext
                );

                return (
                    <>
                        <Text testID="healthSurveys">
                            {JSON.stringify(healthSurveys)}
                        </Text>
                        <Button
                            title="writeHealthSurvey"
                            testID="writeHealthSurvey"
                            onPress={() =>
                                writeHealthSurvey(healthSurveyToWrite)
                            }
                        />
                    </>
                );
            };

            const { getByTestId } = renderComponent(TestComponent);

            expect(getByTestId('healthSurveys').children.join('')).toEqual(
                JSON.stringify(null)
            );

            await act(async () =>
                wait(() => {
                    fireEvent.press(getByTestId('writeHealthSurvey'));

                    expect(mockPdaService.writeHealthSurvey).toBeCalledWith(
                        healthSurveyToWrite
                    );
                })
            );
        });

        test('getting the latest health surveys from the PDA after writing', async () => {
            const healthSurveyToWrite: st.HealthSurvey = {
                symptoms: ['fatigue'],
                timestamp: Date.now(),
            };

            const latestHealthSurveysFromPDA = [{ ...healthSurveyToWrite }];
            mockPdaService.getHealthSurveys.mockResolvedValue(
                latestHealthSurveysFromPDA
            );

            const TestComponent: FunctionComponent = () => {
                const { writeHealthSurvey, healthSurveys } = useContext(
                    PDAContext
                );

                return (
                    <>
                        <Text testID="healthSurveys">
                            {JSON.stringify(healthSurveys)}
                        </Text>
                        <Button
                            title="writeHealthSurvey"
                            testID="writeHealthSurvey"
                            onPress={() =>
                                writeHealthSurvey(healthSurveyToWrite)
                            }
                        />
                    </>
                );
            };

            const { getByTestId } = renderComponent(TestComponent);

            expect(getByTestId('healthSurveys').children.join('')).toEqual(
                JSON.stringify(null)
            );

            await act(async () =>
                wait(() => {
                    fireEvent.press(getByTestId('writeHealthSurvey'));

                    expect(mockPdaService.getHealthSurveys).toBeCalledWith();

                    expect(
                        getByTestId('healthSurveys').children.join('')
                    ).toEqual(JSON.stringify(latestHealthSurveysFromPDA));
                })
            );
        });

        test('getting the latest health surveys from the PDA after writing when we already have health surveys', async () => {
            const healthSurveyToWrite: st.HealthSurvey = {
                symptoms: ['fatigue'],
                timestamp: Date.now(),
            };

            const initialHealthSurveysFromPDA = [
                { symptoms: ['fever'], timestamp: Date.now() },
            ];

            const latestHealthSurveysFromPDA = [{ ...healthSurveyToWrite }];

            mockPdaService.getHealthSurveys.mockResolvedValueOnce(
                initialHealthSurveysFromPDA
            );

            const TestComponent: FunctionComponent = () => {
                const {
                    writeHealthSurvey,
                    getLatestHealthSurveys,
                    healthSurveys,
                } = useContext(PDAContext);

                return (
                    <>
                        <Text testID="healthSurveys">
                            {JSON.stringify(healthSurveys)}
                        </Text>
                        <Button
                            title="getLatestHealthSurveys"
                            testID="getLatestHealthSurveys"
                            onPress={() => getLatestHealthSurveys()}
                        />
                        <Button
                            title="writeHealthSurvey"
                            testID="writeHealthSurvey"
                            onPress={() =>
                                writeHealthSurvey(healthSurveyToWrite)
                            }
                        />
                    </>
                );
            };

            const { getByTestId } = renderComponent(TestComponent);

            fireEvent.press(getByTestId('getLatestHealthSurveys'));

            await act(async () => {
                await wait(() => {
                    expect(
                        getByTestId('healthSurveys').children.join('')
                    ).toEqual(JSON.stringify(initialHealthSurveysFromPDA));
                });
            });

            mockPdaService.getHealthSurveys.mockResolvedValue(
                latestHealthSurveysFromPDA
            );

            fireEvent.press(getByTestId('writeHealthSurvey'));

            await act(async () => {
                await wait(() => {
                    expect(
                        getByTestId('healthSurveys').children.join('')
                    ).toEqual(JSON.stringify(latestHealthSurveysFromPDA));
                });
            });
        });
    });
});

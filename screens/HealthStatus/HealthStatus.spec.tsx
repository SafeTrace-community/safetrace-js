import React from 'react';
import HealthStatusScreen from './HealthStatus';
import { render, fireEvent, act } from '@testing-library/react-native';
import { IPDAContext, PDAContext } from '../../context/PDAContext';
import MockedNavigator from '../testUtils/MockedNavigator';

describe('Health status screen', () => {
    test('not requesting data if not authorized', () => {
        const context: Partial<IPDAContext> = {
            isAuthenticated: false,
            getLatestHealthSurveys: jest.fn(),
            healthSurveys: [],
        };

        const { findByTestId } = renderHealthStatusScreen({
            context,
        });

        expect(context.getLatestHealthSurveys).not.toBeCalled();
    });

    test('showing loading indictor while it loads any health survey data', async () => {
        const context: Partial<IPDAContext> = {
            isAuthenticated: true,
            getLatestHealthSurveys: jest.fn().mockReturnValue(
                new Promise<any>(() => {})
            ),
            healthSurveys: [],
        };

        const { findByTestId } = renderHealthStatusScreen({
            context,
        });

        const screenLoading = await findByTestId('screenLoading');
        expect(screenLoading).toBeTruthy();
    });

    test('providing link to creating a hat', async () => {
        const navigationStub = {
            navigate: jest.fn(),
        };

        const { findByTestId } = renderHealthStatusScreen({
            props: { navigation: navigationStub },
        });

        await act(async () => {
            const createPDAAction = await findByTestId(
                'createPersonalDataAccount'
            );

            expect(createPDAAction).toBeTruthy();

            fireEvent.press(createPDAAction);

            expect(navigationStub.navigate).toBeCalledWith('GetStartedWithPDA');
        });
    });

    test('disabled link to providing preliminary health check if not signed into a HAT', async () => {
        const navigationStub = {
            navigate: jest.fn(),
        };

        const { findByTestId } = renderHealthStatusScreen({
            props: { navigation: navigationStub },
        });

        await act(async () => {
            const providePreliminaryHealthSurvey = await findByTestId(
                'providePreliminaryHealthSurvey'
            );

            expect(providePreliminaryHealthSurvey).toBeTruthy();

            fireEvent.press(providePreliminaryHealthSurvey);

            expect(navigationStub.navigate).not.toBeCalledWith('HealthSurvey');
        });
    });

    test('showing creating a PDA step complete once signed into a HAT', async () => {
        const context = { isAuthenticated: true } as IPDAContext;

        const { findByTestId } = renderHealthStatusScreen({
            context,
        });

        await act(async () => {
            const createPersonalDataAccountCompleted = await findByTestId(
                'createPersonalDataAccountCompleted'
            );

            expect(createPersonalDataAccountCompleted).toBeTruthy();
        });
    });

    test('enabling link to providing preliminary health check if signed into HAT', async () => {
        const props = {
            navigation: {
                navigate: jest.fn(),
            },
        };

        const context = { isAuthenticated: true } as IPDAContext;

        const { findByTestId } = renderHealthStatusScreen({
            props,
            context,
        });

        await act(async () => {
            const providePreliminaryHealthSurvey = await findByTestId(
                'providePreliminaryHealthSurvey'
            );
            await expect(providePreliminaryHealthSurvey).toBeTruthy();

            fireEvent.press(providePreliminaryHealthSurvey);

            expect(props.navigation.navigate).toBeCalledWith('HealthSurvey');
        });
    });

    describe('Preliminary health status survey completed', () => {
        test('checking if any health surveys have been completed on entering screen', () => {
            const context = {
                isAuthenticated: true,
                getLatestHealthSurveys: jest.fn(),
            };

            renderHealthStatusScreen({
                context,
            });

            expect(context.getLatestHealthSurveys).toBeCalledTimes(1);
        });

        test('showing the preliminary health status survey as incomplete if 0 health surveys are in the PDA', async () => {
            const context = {
                isAuthenticated: true,
                healthSurveys: [],
            };

            const { findByTestId } = renderHealthStatusScreen({
                context,
            });

            await act(async () => {
                const providePreliminaryHealthSurveyNotCompleted = await findByTestId(
                    'providePreliminaryHealthSurveyNotCompleted'
                );

                expect(providePreliminaryHealthSurveyNotCompleted).toBeTruthy();
            });
        });

        test('showing the preliminary health status survey as complete if health surveys are in the PDA', async () => {
            const context = {
                isAuthenticated: true,
                healthSurveys: [
                    { symptoms: ['fatigue'], timestamp: 1591105955 },
                ],
            };

            const { findByTestId } = renderHealthStatusScreen({
                context,
            });

            await act(async () => {
                const providePreliminaryHealthSurveyCompleted = await findByTestId(
                    'providePreliminaryHealthSurveyCompleted'
                );

                expect(providePreliminaryHealthSurveyCompleted).toBeTruthy();
            });
        });

        test('should show your health status', async () => {
            const context = {
                isAuthenticated: true,
                healthSurveys: [
                    { symptoms: ['fatigue'], timestamp: 1591105955 },
                ],
            };

            const { findByTestId, findByText } = renderHealthStatusScreen({
                context,
            });

            await act(async () => {
                const healthStatusIndicator = await findByTestId(
                    'HealthStatusIndicator'
                );

                expect(healthStatusIndicator).toBeTruthy();
            });
        });
    });
});

// Utils

function renderHealthStatusScreen({
    props = {},
    context = {},
}: {
    props?: any;
    context?: Partial<IPDAContext>;
}) {
    const mockContext = {
        getLatestHealthSurveys: jest.fn().mockResolvedValue([]) as any,
        healthSurveys: [],
        ...context,
    } as IPDAContext;
    return render(
        <PDAContext.Provider value={mockContext}>
            <MockedNavigator
                ComponentForScreen={HealthStatusScreen}
                propOverrides={props}
            />
        </PDAContext.Provider>
    );
}

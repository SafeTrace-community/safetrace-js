import React from 'react';
import HealthStatusScreen from './HealthStatus';
import { render, fireEvent, act } from '@testing-library/react-native';
import { IHatContext, HatContext } from '../../context/HatContext';
import MockedNavigator from '../testUtils/MockedNavigator';

describe('Health status screen', () => {
    test('showing loading indictor while it loads any health survey data', async () => {
        const context = {
            getHealthSurveys: new Promise<any>(() => {}) as any,
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
        const context = { isAuthenticated: true } as IHatContext;

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

        const context = { isAuthenticated: true } as IHatContext;

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
                getHealthSurveys: jest.fn(),
            };

            renderHealthStatusScreen({
                context,
            });

            expect(context.getHealthSurveys).toBeCalledTimes(1);
        });

        test('showing the preliminary health status survey as incomplete if 0 health surveys are in the PDA', async () => {
            const context = {
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
                healthSurveys: [
                    { symptoms: ['fatigue'], preExistingConditions: [] },
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

        test('not calling the PDA if we already have the health surveys (i.e returning to the view)', () => {
            const context = {
                healthSurveys: [
                    { symptoms: ['fatigue'], preExistingConditions: [] },
                ],
                getHealthSurveys: jest.fn(),
            };

            renderHealthStatusScreen({
                context,
            });

            expect(context.getHealthSurveys).not.toBeCalled();
        });
    });
});

// Utils

function renderHealthStatusScreen({
    props = {},
    context = {},
}: {
    props?: any;
    context?: Partial<IHatContext>;
}) {
    const mockContext = {
        getHealthSurveys: jest.fn().mockResolvedValue([]) as any,
        healthSurveys: [],
        ...context,
    } as IHatContext;
    return render(
        <HatContext.Provider value={mockContext}>
            <MockedNavigator
                ComponentForScreen={HealthStatusScreen}
                propOverrides={props}
            />
        </HatContext.Provider>
    );
}

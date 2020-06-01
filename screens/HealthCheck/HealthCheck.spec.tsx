import React from 'react';
import SymptomsScreen from './Symptoms';
import {
    render,
    fireEvent,
    act,
    wait,
    getByTestId,
    waitForElement,
    getByText,
} from '@testing-library/react-native';
import pdaService, { PDAService } from '../../services/PDAService';
import { StackNavigationProp } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import HealthCheckScreen from './HealthCheck';

jest.mock('../../services/PDAService');
jest.mock('react-native/Libraries/Animated/src/NativeAnimatedHelper');

const mockPdaService: jest.Mocked<PDAService> = pdaService as any;

describe('Health Check Symptoms', () => {
    beforeEach(() => {
        mockPdaService.writeHealthCheck.mockReset();
    });

    describe('submitting health check', () => {
        test('disabling the button on submission', () => {
            const { getByLabelText, getByTestId } = render(
                <NavigationContainer>
                    <HealthCheckScreen navigation={{} as any} />
                </NavigationContainer>
            );

            mockPdaService.writeHealthCheck.mockReturnValue(
                new Promise(() => {})
            );

            fireEvent.press(getByLabelText('Fatigue'));
            fireEvent.press(getByTestId('symptomsNext'));

            fireEvent.press(getByTestId('preExistingConditionsNext'));
            fireEvent.press(getByTestId('preExistingConditionsNext'));

            expect(pdaService.writeHealthCheck).toHaveBeenCalledTimes(1);
        });

        test('re-enabling the button on submission', async () => {
            let resolveHealthCheck: Function;
            const healthCheckPromise = new Promise<void>((resolve) => {
                resolveHealthCheck = resolve;
            });

            const { getByLabelText, getByTestId } = render(
                <NavigationContainer>
                    <HealthCheckScreen
                        navigation={{ navigate: jest.fn() } as any}
                    />
                </NavigationContainer>
            );

            mockPdaService.writeHealthCheck.mockReturnValue(healthCheckPromise);

            fireEvent.press(getByLabelText('Fatigue'));
            fireEvent.press(getByTestId('symptomsNext'));

            fireEvent.press(getByTestId('preExistingConditionsNext'));
            fireEvent.press(getByTestId('preExistingConditionsNext'));

            expect(pdaService.writeHealthCheck).toHaveBeenCalledTimes(1);

            await act(async () => {
                resolveHealthCheck();

                await healthCheckPromise;

                fireEvent.press(getByTestId('preExistingConditionsNext'));
                expect(pdaService.writeHealthCheck).toHaveBeenCalledTimes(2);
            });
        });

        test('re-enabling the button on submission with error', async () => {
            let rejectHealthCheck: Function;
            const healthCheckPromise = new Promise<void>((_, reject) => {
                rejectHealthCheck = reject;
            });

            const { getByLabelText, getByTestId } = render(
                <NavigationContainer>
                    <HealthCheckScreen navigation={{} as any} />
                </NavigationContainer>
            );

            mockPdaService.writeHealthCheck.mockReturnValue(healthCheckPromise);

            fireEvent.press(getByLabelText('Fatigue'));

            fireEvent.press(getByTestId('symptomsNext'));
            fireEvent.press(getByTestId('preExistingConditionsNext'));

            await act(async () => {
                try {
                    rejectHealthCheck();

                    await healthCheckPromise;
                } catch (err) {
                    fireEvent.press(getByTestId('preExistingConditionsNext'));
                    expect(pdaService.writeHealthCheck).toHaveBeenCalledTimes(
                        2
                    );
                }
            });
        });

        test('saving symptoms and pre-existing conditions to the PDA', () => {
            const { getByLabelText, getByTestId, findByText, debug } = render(
                <NavigationContainer>
                    <HealthCheckScreen
                        navigation={{ navigate: jest.fn() } as any}
                    />
                </NavigationContainer>
            );

            const selectedSymptoms = ['Loss of smell or taste', 'Fatigue'];
            const selectedPreExistingConditions = ['Pregnancy', 'Diabetes'];

            selectedSymptoms.forEach((symptom) =>
                fireEvent.press(getByLabelText(symptom))
            );
            fireEvent.press(getByTestId('symptomsNext'));

            selectedPreExistingConditions.forEach((condition) =>
                fireEvent.press(getByLabelText(condition))
            );

            fireEvent.press(getByTestId('preExistingConditionsNext'));

            expect(pdaService.writeHealthCheck).toHaveBeenCalledWith({
                symptoms: selectedSymptoms,
                preExistingConditions: selectedPreExistingConditions,
            });
        });

        test('navigating to the success route on successful response', async () => {
            const navigateStub = jest.fn();
            const { getByLabelText, getByTestId } = render(
                <NavigationContainer>
                    <HealthCheckScreen
                        navigation={{ navigate: navigateStub } as any}
                    />
                </NavigationContainer>
            );

            mockPdaService.writeHealthCheck.mockResolvedValue();

            fireEvent.press(getByLabelText('Loss of smell or taste'));
            fireEvent.press(getByLabelText('Fatigue'));

            fireEvent.press(getByTestId('symptomsNext'));
            fireEvent.press(getByTestId('preExistingConditionsNext'));

            await act(async () => {
                await wait(() =>
                    expect(navigateStub).toHaveBeenCalledWith(
                        'HealthCheckSuccess'
                    )
                );
            });
        });

        test('showing an error if the request to writeHealthCheck fails', async () => {
            const { getByLabelText, getByTestId, findByTestId } = render(
                <NavigationContainer>
                    <HealthCheckScreen
                        navigation={{ navigate: jest.fn() } as any}
                    />
                </NavigationContainer>
            );

            mockPdaService.writeHealthCheck.mockRejectedValue(
                'HTTP_RESPONSE_ERROR'
            );

            fireEvent.press(getByLabelText('Loss of smell or taste'));
            fireEvent.press(getByLabelText('Fatigue'));

            fireEvent.press(getByTestId('symptomsNext'));

            await act(async () => {
                fireEvent.press(getByTestId('preExistingConditionsNext'));

                const error = await findByTestId('error');

                expect(error.props.children).toContain(
                    'An error occurred saving your health check'
                );
            });
        });
    });
});

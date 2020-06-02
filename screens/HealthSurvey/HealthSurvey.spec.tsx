import React from 'react';

import {
    render,
    fireEvent,
    act,
    wait,
    getByTestId,
} from '@testing-library/react-native';
import pdaService, { PDAService } from '../../services/PDAService';
import { NavigationContainer } from '@react-navigation/native';
import HealthSurveyScreen from './HealthSurvey';

jest.mock('../../services/PDAService');
jest.mock('react-native/Libraries/Animated/src/NativeAnimatedHelper');

const mockPdaService: jest.Mocked<PDAService> = pdaService as any;

describe('Health Check Symptoms', () => {
    beforeEach(() => {
        const now = Date.now();
        Date.now = jest.fn().mockReturnValue(now);
        mockPdaService.writeHealthSurvey.mockReset();
    });

    afterEach(() => {
        //@ts-ignore
        Date.now.mockRestore();
    });

    test('view symptoms', () => {
        const { getByLabelText } = render(
            <NavigationContainer>
                <HealthSurveyScreen navigation={{} as any} />
            </NavigationContainer>
        );

        const symptoms = [
            'Loss of smell or taste',
            'Skipped meals',
            'Fatigue',
            'Fever',
            'Persistent cough',
        ];

        symptoms.forEach((symptom) =>
            expect(getByLabelText(symptom)).toBeTruthy()
        );
    });

    test('when a symptom is selected', () => {
        const selectedSymptom = 'Fatigue';

        const { getByLabelText } = render(
            <NavigationContainer>
                <HealthSurveyScreen navigation={{} as any} />
            </NavigationContainer>
        );

        const symptom = getByLabelText(selectedSymptom);

        fireEvent.press(symptom);

        expect(
            getByTestId(symptom, 'checkbox').props.style[1].borderColor
        ).toEqual('#167976');
    });

    describe('submitting health check', () => {
        test('disabling the button on submission', () => {
            const { getByLabelText, getByTestId } = render(
                <NavigationContainer>
                    <HealthSurveyScreen navigation={{} as any} />
                </NavigationContainer>
            );

            mockPdaService.writeHealthSurvey.mockReturnValue(
                new Promise(() => {})
            );

            fireEvent.press(getByLabelText('Fatigue'));
            fireEvent.press(getByTestId('symptomsNext'));
            fireEvent.press(getByTestId('symptomsNext'));

            expect(pdaService.writeHealthSurvey).toHaveBeenCalledTimes(1);
        });

        test('re-enabling the button on submission', async () => {
            let resolveHealthSurvey: Function;
            const healthSurveyPromise = new Promise<void>((resolve) => {
                resolveHealthSurvey = resolve;
            });

            const { getByLabelText, getByTestId } = render(
                <NavigationContainer>
                    <HealthSurveyScreen
                        navigation={{ navigate: jest.fn() } as any}
                    />
                </NavigationContainer>
            );

            mockPdaService.writeHealthSurvey.mockReturnValue(
                healthSurveyPromise
            );

            fireEvent.press(getByLabelText('Fatigue'));
            fireEvent.press(getByTestId('symptomsNext'));
            fireEvent.press(getByTestId('symptomsNext'));

            expect(pdaService.writeHealthSurvey).toHaveBeenCalledTimes(1);

            await act(async () => {
                resolveHealthSurvey();

                await healthSurveyPromise;

                fireEvent.press(getByTestId('symptomsNext'));
                expect(pdaService.writeHealthSurvey).toHaveBeenCalledTimes(2);
            });
        });

        test('re-enabling the button on submission with error', async () => {
            let rejectHealthSurvey: Function;
            const healthSurveyPromise = new Promise<void>((_, reject) => {
                rejectHealthSurvey = reject;
            });

            const { getByLabelText, getByTestId } = render(
                <NavigationContainer>
                    <HealthSurveyScreen navigation={{} as any} />
                </NavigationContainer>
            );

            mockPdaService.writeHealthSurvey.mockReturnValue(
                healthSurveyPromise
            );

            fireEvent.press(getByLabelText('Fatigue'));
            fireEvent.press(getByTestId('symptomsNext'));

            await act(async () => {
                try {
                    rejectHealthSurvey();

                    await healthSurveyPromise;
                } catch (err) {
                    fireEvent.press(getByTestId('symptomsNext'));
                    expect(pdaService.writeHealthSurvey).toHaveBeenCalledTimes(
                        2
                    );
                }
            });
        });

        test('saving symptoms to the PDA', () => {
            const { getByLabelText, getByTestId } = render(
                <NavigationContainer>
                    <HealthSurveyScreen
                        navigation={{ navigate: jest.fn() } as any}
                    />
                </NavigationContainer>
            );

            const selectedSymptoms = ['Loss of smell or taste', 'Fatigue'];

            selectedSymptoms.forEach((symptom) =>
                fireEvent.press(getByLabelText(symptom))
            );
            fireEvent.press(getByTestId('symptomsNext'));

            expect(pdaService.writeHealthSurvey).toHaveBeenCalledWith({
                symptoms: selectedSymptoms,
                timestamp: Date.now(),
            });
        });

        test('navigating to the success route on successful response', async () => {
            const navigateStub = jest.fn();
            const { getByLabelText, getByTestId } = render(
                <NavigationContainer>
                    <HealthSurveyScreen
                        navigation={{ navigate: navigateStub } as any}
                    />
                </NavigationContainer>
            );

            mockPdaService.writeHealthSurvey.mockResolvedValue();

            fireEvent.press(getByLabelText('Loss of smell or taste'));
            fireEvent.press(getByLabelText('Fatigue'));
            fireEvent.press(getByTestId('symptomsNext'));

            await act(async () => {
                await wait(() =>
                    expect(navigateStub).toHaveBeenCalledWith('HealthStatus')
                );
            });
        });

        test('showing an error if the request to writeHealthSurvey fails', async () => {
            const { getByLabelText, getByTestId, findByTestId } = render(
                <NavigationContainer>
                    <HealthSurveyScreen
                        navigation={{ navigate: jest.fn() } as any}
                    />
                </NavigationContainer>
            );

            mockPdaService.writeHealthSurvey.mockRejectedValue(
                'HTTP_RESPONSE_ERROR'
            );

            fireEvent.press(getByLabelText('Loss of smell or taste'));
            fireEvent.press(getByLabelText('Fatigue'));

            await act(async () => {
                fireEvent.press(getByTestId('symptomsNext'));

                const error = await findByTestId('error');

                expect(error.props.children).toContain(
                    'An error occurred saving your health check'
                );
            });
        });
    });
});

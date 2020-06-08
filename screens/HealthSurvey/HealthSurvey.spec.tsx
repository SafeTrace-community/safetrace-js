import { NavigationContainer } from '@react-navigation/native';
import {
    render,
    fireEvent,
    act,
    wait,
    getByTestId,
} from '@testing-library/react-native';
import React from 'react';

import { IPDAContext, PDAContext } from '../../context/PDAContext';
import pdaService, { PDAService } from '../../services/PDAService';
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
        const { getByLabelText } = renderComponent();

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

        const { getByLabelText } = renderComponent();

        const symptom = getByLabelText(selectedSymptom);

        fireEvent.press(symptom);

        expect(
            getByTestId(symptom, 'checkbox').props.style[1].borderColor
        ).toEqual('#167976');
    });

    describe('submitting health check', () => {
        test('disabling the button on submission', () => {
            const mockContext = {
                writeHealthSurvey: jest.fn().mockResolvedValue({}) as any,
            };

            const { getByLabelText, getByTestId } = renderComponent({
                context: mockContext,
            });

            mockPdaService.writeHealthSurvey.mockReturnValue(
                new Promise(() => {})
            );

            fireEvent.press(getByLabelText('Fatigue'));
            fireEvent.press(getByTestId('symptomsNext'));
            fireEvent.press(getByTestId('symptomsNext'));

            expect(mockContext.writeHealthSurvey).toHaveBeenCalledTimes(1);
        });

        test('re-enabling the button on submission', async () => {
            let resolveHealthSurvey: any;
            const healthSurveyPromise = new Promise<void>((resolve) => {
                resolveHealthSurvey = resolve;
            });

            const mockContext = {
                writeHealthSurvey: jest
                    .fn()
                    .mockReturnValue(healthSurveyPromise) as any,
            };

            const { getByLabelText, getByTestId } = renderComponent({
                context: mockContext,
            });

            fireEvent.press(getByLabelText('Fatigue'));
            fireEvent.press(getByTestId('symptomsNext'));
            fireEvent.press(getByTestId('symptomsNext'));

            expect(mockContext.writeHealthSurvey).toHaveBeenCalledTimes(1);

            await act(async () => {
                resolveHealthSurvey();

                await healthSurveyPromise;

                fireEvent.press(getByTestId('symptomsNext'));
                expect(mockContext.writeHealthSurvey).toHaveBeenCalledTimes(2);
            });
        });

        test('re-enabling the button on submission with error', async () => {
            let rejectHealthSurvey: any;
            const healthSurveyPromise = new Promise<void>((_, reject) => {
                rejectHealthSurvey = reject;
            });

            const mockContext = {
                writeHealthSurvey: jest
                    .fn()
                    .mockReturnValue(healthSurveyPromise) as any,
            };

            const { getByLabelText, getByTestId } = renderComponent({
                context: mockContext,
            });

            mockContext.writeHealthSurvey.mockReturnValue(healthSurveyPromise);

            fireEvent.press(getByLabelText('Fatigue'));
            fireEvent.press(getByTestId('symptomsNext'));

            await act(async () => {
                try {
                    rejectHealthSurvey();

                    await healthSurveyPromise;
                } catch (err) {
                    fireEvent.press(getByTestId('symptomsNext'));
                    expect(mockContext.writeHealthSurvey).toHaveBeenCalledTimes(
                        2
                    );
                }
            });
        });

        test('saving symptoms to the PDA', () => {
            const mockContext = {
                writeHealthSurvey: jest.fn().mockResolvedValue({}),
            };

            const { getByLabelText, getByTestId } = renderComponent({
                context: mockContext,
            });

            const selectedSymptoms = ['Loss of smell or taste', 'Fatigue'];

            selectedSymptoms.forEach((symptom) =>
                fireEvent.press(getByLabelText(symptom))
            );

            fireEvent.press(getByTestId('symptomsNext'));

            expect(mockContext.writeHealthSurvey).toHaveBeenCalledWith({
                symptoms: selectedSymptoms,
                timestamp: Date.now(),
            });
        });

        test('navigating to the success route on successful response', async () => {
            const navigateStub = jest.fn();

            const { getByLabelText, getByTestId } = renderComponent({
                props: { navigation: { navigate: navigateStub } },
            });

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
            const mockContext = {
                writeHealthSurvey: jest
                    .fn()
                    .mockRejectedValue('HTTP_RESPONSE_ERROR'),
            };

            const {
                getByLabelText,
                getByTestId,
                findByTestId,
            } = renderComponent({
                context: mockContext,
            });

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

function renderComponent({
    props = { navigation: { navigate: jest.fn() } },
    context = {},
}: {
    props?: any;
    context?: Partial<IPDAContext>;
} = {}) {
    const mockContext = {
        writeHealthSurvey: jest.fn().mockResolvedValue({}) as any,
        healthSurveys: [],
        ...context,
    } as IPDAContext;
    return render(
        <PDAContext.Provider value={mockContext}>
            <NavigationContainer>
                <HealthSurveyScreen {...props} />
            </NavigationContainer>
        </PDAContext.Provider>
    );
}

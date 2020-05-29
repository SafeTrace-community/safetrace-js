import React from 'react';
import HealthCheckScreen from './HealthCheck';
import { render, fireEvent, act, wait } from '@testing-library/react-native';
import pdaService, { PDAService } from '../../services/PDAService';

jest.mock('../../services/PDAService');
jest.mock('react-native/Libraries/Animated/src/NativeAnimatedHelper');

const mockPdaService: jest.Mocked<PDAService> = pdaService as any;

describe('Health Check Symptoms', () => {
    beforeEach(() => {
        mockPdaService.writeHealthCheck.mockReset();
    });

    test('view symptoms', () => {
        const { getByLabelText } = render(
            <HealthCheckScreen navigation={{} as any} />
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

    test('selecting a symptom', () => {
        const { getByLabelText } = render(
            <HealthCheckScreen navigation={{} as any} />
        );

        const symptom = getByLabelText('Loss of smell or taste');
        fireEvent.press(symptom);

        expect(symptom.props.style.borderColor).toEqual('#167976');
    });

    test('deselecting a symptom', () => {
        const { getByLabelText } = render(
            <HealthCheckScreen navigation={{} as any} />
        );

        const symptom = getByLabelText('Loss of smell or taste');
        fireEvent.press(symptom);
        expect(symptom.props.style.borderColor).toEqual('#167976');

        fireEvent.press(symptom);
        expect(symptom.props.style.borderColor).toEqual('transparent');
    });

    describe('submitting health check', () => {
        test('disabling the button on submission', () => {
            const { getByLabelText, getByTestId } = render(
                <HealthCheckScreen navigation={{} as any} />
            );

            mockPdaService.writeHealthCheck.mockReturnValue(
                new Promise(() => {})
            );

            fireEvent.press(getByLabelText('Fatigue'));

            fireEvent.press(getByTestId('nextButton'));
            fireEvent.press(getByTestId('nextButton'));

            expect(pdaService.writeHealthCheck).toHaveBeenCalledTimes(1);
        });

        test('re-enabling the button on submission', async () => {
            let resolveHealthCheck: Function;
            const healthCheckPromise = new Promise<void>((resolve) => {
                resolveHealthCheck = resolve;
            });

            const { getByLabelText, getByTestId } = render(
                <HealthCheckScreen navigation={{} as any} />
            );

            mockPdaService.writeHealthCheck.mockReturnValue(healthCheckPromise);

            fireEvent.press(getByLabelText('Fatigue'));

            fireEvent.press(getByTestId('nextButton'));
            fireEvent.press(getByTestId('nextButton'));

            expect(pdaService.writeHealthCheck).toHaveBeenCalledTimes(1);

            await act(async () => {
                resolveHealthCheck();

                await healthCheckPromise;

                fireEvent.press(getByTestId('nextButton'));
                expect(pdaService.writeHealthCheck).toHaveBeenCalledTimes(2);
            });
        });

        test('re-enabling the button on submission with error', async () => {
            let rejectHealthCheck: Function;
            const healthCheckPromise = new Promise<void>((_, reject) => {
                rejectHealthCheck = reject;
            });

            const { getByLabelText, getByTestId } = render(
                <HealthCheckScreen navigation={{} as any} />
            );

            mockPdaService.writeHealthCheck.mockReturnValue(healthCheckPromise);

            fireEvent.press(getByLabelText('Fatigue'));

            fireEvent.press(getByTestId('nextButton'));
            fireEvent.press(getByTestId('nextButton'));

            await act(async () => {
                try {
                    rejectHealthCheck();

                    await healthCheckPromise;
                } catch (err) {
                    fireEvent.press(getByTestId('nextButton'));
                    expect(pdaService.writeHealthCheck).toHaveBeenCalledTimes(
                        2
                    );
                }
            });
        });

        test('saving symptoms to the PDA', () => {
            const { getByLabelText, getByTestId } = render(
                <HealthCheckScreen navigation={{} as any} />
            );

            fireEvent.press(getByLabelText('Loss of smell or taste'));
            fireEvent.press(getByLabelText('Fatigue'));

            fireEvent.press(getByTestId('nextButton'));

            expect(pdaService.writeHealthCheck).toHaveBeenCalledWith({
                symptoms: ['Loss of smell or taste', 'Fatigue'],
            });
        });

        // TODO: Where do we navigate to when we've successfully saved the health check
        // test('navigating to the success route on successful response', () => {
        //     const navigateStub = jest.fn();
        //     const { getByLabelText, getByTestId } = render(
        //         <HealthCheckScreen
        //             navigation={{ navigate: navigateStub } as any}
        //         />
        //     );

        //     mockPdaService.writeHealthCheck.mockResolvedValue();

        //     fireEvent.press(getByLabelText('Loss of smell or taste'));
        //     fireEvent.press(getByLabelText('Fatigue'));

        //     fireEvent.press(getByTestId('nextButton'));

        //     expect(navigateStub).toHaveBeenCalledWith('HealthCheckSuccess');
        // });

        test('showing an error if the request to writeHealthCheck fails', async () => {
            const { getByLabelText, getByTestId } = render(
                <HealthCheckScreen navigation={{} as any} />
            );

            mockPdaService.writeHealthCheck.mockRejectedValue({});

            fireEvent.press(getByLabelText('Loss of smell or taste'));
            fireEvent.press(getByLabelText('Fatigue'));

            fireEvent.press(getByTestId('nextButton'));

            await act(async () => {
                await wait(() =>
                    expect(getByTestId('error').props.children).toEqual(
                        'An error occurred saving your health check'
                    )
                );
            });
        });
    });
});

import { NavigationContainer } from '@react-navigation/native';
import { render, fireEvent, wait, act } from '@testing-library/react-native';
import React from 'react';

import { PDAContext } from '../../context/PDAContext';
import DemographicSurveyScreen from './DemographicSurvey';

describe('DemographicSurvey', () => {
    describe('completing the survey', () => {
        describe('validating', () => {
            test('showing errors if no values have been submitted', () => {
                const { getByTestId } = render(
                    <NavigationContainer>
                        <DemographicSurveyScreen
                            navigation={{ navigate: jest.fn() } as any}
                        />
                    </NavigationContainer>
                );

                fireEvent.press(getByTestId('nextButton'));

                expect(getByTestId('ageError').props.children).toContain(
                    'Please enter your age'
                );
                expect(getByTestId('sexError').props.children).toContain(
                    'Please indicate if you are biologically male'
                );
            });

            test('showing an error if no age is provided', () => {
                const { getByTestId } = render(
                    <NavigationContainer>
                        <DemographicSurveyScreen
                            navigation={{ navigate: jest.fn() } as any}
                        />
                    </NavigationContainer>
                );

                const femaleRadio = getByTestId('femaleRadio');
                fireEvent.press(femaleRadio);

                fireEvent.press(getByTestId('nextButton'));

                expect(getByTestId('ageError').props.children).toContain(
                    'Please enter your age'
                );
            });

            test('showing an error if no sex is provided', () => {
                const { getByTestId, getByLabelText } = render(
                    <NavigationContainer>
                        <DemographicSurveyScreen
                            navigation={{ navigate: jest.fn() } as any}
                        />
                    </NavigationContainer>
                );

                const ageInput = getByLabelText('What is your age?');
                fireEvent.changeText(ageInput, 35);

                fireEvent.press(getByTestId('nextButton'));

                expect(getByTestId('sexError').props.children).toContain(
                    'Please indicate if you are biologically male'
                );
            });

            test('clearing error when after changing field value', () => {
                const { getByTestId, getByLabelText, queryByTestId } = render(
                    <NavigationContainer>
                        <DemographicSurveyScreen
                            navigation={{ navigate: jest.fn() } as any}
                        />
                    </NavigationContainer>
                );

                fireEvent.press(getByTestId('nextButton'));

                expect(getByTestId('ageError').props.children).toContain(
                    'Please enter your age'
                );
                expect(getByTestId('sexError').props.children).toContain(
                    'Please indicate if you are biologically male'
                );

                act(() => {
                    const ageInput = getByLabelText('What is your age?');
                    fireEvent.changeText(ageInput, 35);

                    const femaleRadio = getByTestId('femaleRadio');
                    fireEvent.press(femaleRadio);
                });

                expect(queryByTestId('ageError')).toBeFalsy();
                expect(queryByTestId('sexError')).toBeFalsy();
            });
        });

        test('saving the demographic information in secure storage', () => {
            const saveDemographicInformation = jest.fn();

            const { getByLabelText, getByTestId } = render(
                <NavigationContainer>
                    <PDAContext.Provider
                        value={{ saveDemographicInformation } as any}
                    >
                        <DemographicSurveyScreen
                            navigation={{ navigate: jest.fn() } as any}
                        />
                    </PDAContext.Provider>
                </NavigationContainer>
            );

            const ageInput = getByLabelText('What is your age?');
            fireEvent.changeText(ageInput, 35);

            const femaleRadio = getByTestId('femaleRadio');
            fireEvent.press(femaleRadio);

            fireEvent.press(getByTestId('nextButton'));

            expect(saveDemographicInformation).toHaveBeenCalledWith({
                age: 35,
                sex: 'female',
            });
        });

        test('set the button to submitting while the save is in progress', async () => {
            const savePromise = Promise.resolve();
            const saveDemographicInformation = jest
                .fn()
                .mockReturnValue(savePromise);

            const { getByLabelText, getByTestId } = render(
                <NavigationContainer>
                    <PDAContext.Provider
                        value={{ saveDemographicInformation } as any}
                    >
                        <DemographicSurveyScreen
                            navigation={{ navigate: jest.fn() } as any}
                        />
                    </PDAContext.Provider>
                </NavigationContainer>
            );

            const ageInput = getByLabelText('What is your age?');
            fireEvent.changeText(ageInput, 35);

            const femaleRadio = getByTestId('femaleRadio');
            fireEvent.press(femaleRadio);

            fireEvent.press(getByTestId('nextButton'));

            expect(
                getByTestId('nextButton').props.children[0][0].props.children
            ).toContain('Submitting');

            await act(async () => {
                await savePromise;
            });

            expect(
                getByTestId('nextButton').props.children[0][0].props.children
            ).toContain('Next');
        });

        test('navigating to HealthStatus on successful save', async () => {
            const navigateStub = jest.fn();
            const saveDemographicInformation = jest.fn().mockResolvedValue({});

            const { getByLabelText, getByTestId } = render(
                <NavigationContainer>
                    <PDAContext.Provider
                        value={{ saveDemographicInformation } as any}
                    >
                        <DemographicSurveyScreen
                            navigation={{ navigate: navigateStub } as any}
                        />
                    </PDAContext.Provider>
                </NavigationContainer>
            );

            const ageInput = getByLabelText('What is your age?');
            fireEvent.changeText(ageInput, 35);

            const femaleRadio = getByTestId('femaleRadio');
            fireEvent.press(femaleRadio);

            fireEvent.press(getByTestId('nextButton'));

            await act(async () => {
                await wait(() =>
                    expect(navigateStub).toHaveBeenCalledWith('HealthStatus')
                );
            });
        });
    });
});

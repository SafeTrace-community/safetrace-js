import { NavigationContainer } from '@react-navigation/native';
import { render, fireEvent, wait, act } from '@testing-library/react-native';
import React from 'react';

import demographicInformationService from '../../services/DemographicInformationService';
import DemographicSurveyScreen from './DemographicSurvey';

jest.mock('../../services/DemographicInformationService');

const mockDemographicInformationService: jest.Mocked<typeof demographicInformationService> = demographicInformationService as any;

describe('DemographicSurvey', () => {
    beforeEach(() => {
        mockDemographicInformationService.save.mockReset();
    });

    describe('completing the survey', () => {
        describe('validating', () => {
            test('showing an error if no age is provided', () => {
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
            });

            test('showing an error if no sex is provided', () => {
                const { getByTestId } = render(
                    <NavigationContainer>
                        <DemographicSurveyScreen
                            navigation={{ navigate: jest.fn() } as any}
                        />
                    </NavigationContainer>
                );

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
            const { getByLabelText, getByTestId } = render(
                <NavigationContainer>
                    <DemographicSurveyScreen
                        navigation={{ navigate: jest.fn() } as any}
                    />
                </NavigationContainer>
            );

            const ageInput = getByLabelText('What is your age?');
            fireEvent.changeText(ageInput, 35);

            const femaleRadio = getByTestId('femaleRadio');
            fireEvent.press(femaleRadio);

            fireEvent.press(getByTestId('nextButton'));

            expect(mockDemographicInformationService.save).toHaveBeenCalledWith(
                {
                    age: 35,
                    sex: 'female',
                }
            );
        });

        test('set the button to submitting while the save is in progress', async () => {
            const savePromise = Promise.resolve();
            mockDemographicInformationService.save.mockReturnValue(savePromise);

            const { getByLabelText, getByTestId } = render(
                <NavigationContainer>
                    <DemographicSurveyScreen
                        navigation={{ navigate: jest.fn() } as any}
                    />
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
            const { getByLabelText, getByTestId } = render(
                <NavigationContainer>
                    <DemographicSurveyScreen
                        navigation={{ navigate: navigateStub } as any}
                    />
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

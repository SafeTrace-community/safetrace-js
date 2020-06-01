import React from 'react';
import SymptomsScreen from './Symptoms';
import {
    render,
    fireEvent,
    act,
    wait,
    getByTestId,
} from '@testing-library/react-native';
import pdaService, { PDAService } from '../../services/PDAService';
import { StackNavigationProp } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import HealthSurveyScreen from './HealthSurvey';

jest.mock('../../services/PDAService');
jest.mock('react-native/Libraries/Animated/src/NativeAnimatedHelper');

const mockPdaService: jest.Mocked<PDAService> = pdaService as any;

describe('Health Check Symptoms', () => {
    test('view symptoms', () => {
        const { getByLabelText } = render(
            <NavigationContainer>
                <SymptomsScreen
                    navigation={{} as any}
                    submitting={false}
                    handleSelection={jest.fn()}
                    isSelected={jest.fn()}
                    error={null}
                    handleNext={jest.fn()}
                />
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
        const isSelected = jest.fn().mockImplementation((arg) => {
            return arg === selectedSymptom ? true : false;
        });
        const { getByLabelText } = render(
            <NavigationContainer>
                <SymptomsScreen
                    navigation={{} as any}
                    handleSelection={jest.fn()}
                    isSelected={isSelected}
                    submitting={false}
                    error={null}
                    handleNext={jest.fn()}
                />
            </NavigationContainer>
        );

        const symptom = getByLabelText(selectedSymptom);

        expect(
            getByTestId(symptom, 'checkbox').props.style[1].borderColor
        ).toEqual('#167976');
    });
});

import React from 'react';
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
import PreExistingConditionsScreen from './PreExistingConditions';

jest.mock('../../services/PDAService');
jest.mock('react-native/Libraries/Animated/src/NativeAnimatedHelper');

describe('Pre-existing conditions', () => {
    test('view pre-existing conditions', () => {
        const { getByLabelText } = render(
            <NavigationContainer>
                <PreExistingConditionsScreen
                    navigation={{} as any}
                    handleSelection={jest.fn()}
                    isSelected={jest.fn()}
                    submitting={false}
                    error={null}
                    handleNext={jest.fn()}
                />
            </NavigationContainer>
        );
        const preExistingConditions = [
            'Asthma or chronic lung conditions',
            'Pregnancy',
            'Diabetes',
            'Kidney failure',
            'Cirrhosis of the liver',
            'Weakened immune system',
            'Congestive heart failure',
            'Extreme obesity',
        ];

        preExistingConditions.forEach((condition) =>
            expect(getByLabelText(condition)).toBeTruthy()
        );
    });

    test('when a condition is selected', () => {
        const selectedCondition = 'Kidney failure';
        const isSelected = jest.fn().mockImplementation((arg) => {
            return arg === selectedCondition ? true : false;
        });
        const { getByLabelText } = render(
            <NavigationContainer>
                <PreExistingConditionsScreen
                    navigation={{} as any}
                    handleSelection={jest.fn()}
                    isSelected={isSelected}
                    submitting={false}
                    error={null}
                    handleNext={jest.fn()}
                />
            </NavigationContainer>
        );

        const symptom = getByLabelText(selectedCondition);

        expect(
            getByTestId(symptom, 'checkbox').props.style[1].borderColor
        ).toEqual('#167976');
    });
});

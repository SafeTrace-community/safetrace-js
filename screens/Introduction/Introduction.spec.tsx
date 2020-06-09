import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import Introduction from './Introduction';

jest.mock('@react-navigation/native');

describe('Introduction screen', () => {
    test('having button to continue to the landing page button', () => {
        const { getByTestId } = render(<Introduction navigation={{} as any} />);
        expect(getByTestId('continueButton')).toBeTruthy();
    });

    test('navigating to the landing page', () => {
        const navigateStub = jest.fn();
        const { getByTestId } = render(
            <Introduction
                navigation={
                    {
                        navigate: navigateStub,
                    } as any
                }
            />
        );

        fireEvent.press(getByTestId('continueButton'));

        expect(navigateStub).toHaveBeenCalledWith('DemographicSurvey');
    });

    test('having a button to skip intro', () => {
        const { getByTestId } = render(<Introduction navigation={{} as any} />);
        expect(getByTestId('skipIntroButton')).toBeTruthy();
    });
});

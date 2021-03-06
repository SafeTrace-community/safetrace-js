import React from 'react';
import {
    render,
    fireEvent,
    NativeTestEvent,
} from '@testing-library/react-native';
import Introduction from './Introduction';

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

        expect(navigateStub).toHaveBeenCalledWith('Landing');
    });

    test('having a button to skip intro', () => {
        const { getByTestId } = render(<Introduction navigation={{} as any} />);
        expect(getByTestId('skipIntroButton')).toBeTruthy();
    });
});

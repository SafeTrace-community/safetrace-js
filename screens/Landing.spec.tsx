import React from 'react';
import { render } from '@testing-library/react-native';
import Landing from './Landing';

describe('Landing screen', () => {
    test('having create account button', () => {
        const { getByTestId } = render(<Landing />);
        expect(getByTestId('createAccountButton')).toBeTruthy();
    });
});

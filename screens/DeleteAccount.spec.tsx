import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { HatContext, IHatContext } from '../context/HatContext';
import DeleteAccount from './DeleteAccount';

describe('Delete account', () => {
    test('calling the delete method on the hatContext when confirming to delete account', async () => {
        const mockContext = { deleteAccount: jest.fn() as any } as IHatContext;
        const { getByTestId } = render(
            <HatContext.Provider value={mockContext}>
                <DeleteAccount />
            </HatContext.Provider>
        );
        const deleteAccountButton = getByTestId('deleteAccount');

        fireEvent.press(deleteAccountButton);

        expect(mockContext.deleteAccount).toBeCalled();
    });
});

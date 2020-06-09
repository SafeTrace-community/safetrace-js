import { render, getByTestId } from '@testing-library/react-native';
import React from 'react';

import { RadioButton } from './RadioButton';

describe('RadioButton', () => {
    test('rendering a label', () => {
        const label = 'Label 1';
        const { container } = render(
            <RadioButton label={label} isSelected={false} />
        );

        expect(getByTestId(container, 'radioLabel').props.children).toContain(
            label
        );
    });

    test('rendering the radio icon as un-selected', () => {
        const label = 'Label 1';
        const { container } = render(
            <RadioButton label={label} isSelected={false} />
        );

        const [iconStyles] = getByTestId(container, 'radioIcon').props.style;
        expect(iconStyles.opacity).toEqual(0);
    });

    test('rendering the radio icon as selected', () => {
        const label = 'Label 1';
        const { getByLabelText, getByTestId } = render(
            <RadioButton label={label} isSelected />
        );

        const [iconStyles] = getByTestId('radioIcon').props.style;
        expect(iconStyles.opacity).toEqual(1);
        expect(getByLabelText(label).props.style.borderColor).toEqual(
            '#167976'
        );
    });
});

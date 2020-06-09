import React, { FunctionComponent } from 'react';
import { TouchableOpacityProps } from 'react-native';
import styled from 'styled-components/native';

import { Colors } from '../../styles/shared';

const Radio = styled.TouchableOpacity<{ isSelected: boolean }>`
    border-width: 1px;
    border-color: ${({ isSelected }) =>
        isSelected ? Colors.primary : 'transparent'};
    border-radius: 3px;
    padding: 20px;
    background-color: white;
    align-items: center;
    flex-direction: row;
`;

const RadioIcon = styled.View`
    width: 21px;
    height: 21px;
    border-width: 1px;
    border-color: ${Colors.primary};
    border-radius: 11px;
    margin-right: 18px;
    justify-content: center;
    align-items: center;
    position: relative;
`;

const RadioIconInner = styled.View<{ isSelected: boolean }>`
    width: 15px;
    height: 15px;
    position: absolute;
    background-color: ${Colors.primary};
    border-radius: 8px;
    opacity: ${({ isSelected }) => (isSelected ? '1' : '0')};
`;

const RadioLabel = styled.Text`
    font-family: 'AvenirNext';
`;

interface Props extends TouchableOpacityProps {
    label: string;
    isSelected: boolean;
}

export const RadioButton: FunctionComponent<Props> = ({
    label,
    isSelected,
    ...props
}) => (
    <Radio {...props} accessibilityLabel={label} isSelected={isSelected}>
        <RadioIcon>
            <RadioIconInner testID="radioIcon" isSelected={isSelected} />
        </RadioIcon>
        <RadioLabel testID="radioLabel">{label}</RadioLabel>
    </Radio>
);

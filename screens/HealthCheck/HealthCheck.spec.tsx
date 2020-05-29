import React from 'react';
import HealthCheckScreen from './HealthCheck';
import { render } from '@testing-library/react-native';

describe('Health Check Symptoms', () => {
    test('view symptoms', () => {
        const { getByLabelText } = render(
            <HealthCheckScreen navigation={{} as any} />
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
});

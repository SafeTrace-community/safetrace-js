import { differenceInCalendarDays } from 'date-fns';
import React, { FunctionComponent } from 'react';
import { View, Text } from 'react-native';

import { HealthIndicator } from '../../../components/HealthIndicator';
import { ProgressNav, ProgressNavItem } from '../../../components/ProgressNav';
import { SecondaryButton } from '../../../components/SecondaryButton';
import sharedStyles from '../../../styles/shared';
import { styles } from '../HealthStatus';

const getEngagementMessage = (latestHealthSurvey: st.HealthSurvey) => {
    const daysSinceLastHealthSurvey = differenceInCalendarDays(
        new Date(),
        new Date(latestHealthSurvey.timestamp)
    );

    switch (daysSinceLastHealthSurvey) {
        case 0:
            return 'You have completed a health survey today.';
        case 1:
            return `You last completed a health survey yesterday. Please consider taking the survey again.`;
        default:
            return `You last completed a health survey ${daysSinceLastHealthSurvey} days ago. Please consider taking the survey again.`;
    }
};

type Props = {
    latestHeathSurvey: st.HealthSurvey;
    handleRetakeSurvey: () => void;
};

const CompletedHealthStatusView: FunctionComponent<Props> = ({
    latestHeathSurvey,
    handleRetakeSurvey,
}) => {
    return (
        <>
            <View style={styles.panel} testID="HealthStatusIndicator">
                <Text style={styles.panelHeading}>Health Status</Text>
                <HealthIndicator status="pending" />
            </View>

            <View style={styles.panel}>
                <Text
                    style={[sharedStyles.text, styles.engagementMessage]}
                    testID="healthSurveyEngagementMessage"
                >
                    {getEngagementMessage(latestHeathSurvey)}
                </Text>

                <SecondaryButton
                    testID="retakeHealthSurvey"
                    text="Retake health survey"
                    onPress={handleRetakeSurvey}
                />
            </View>

            <View style={styles.panel}>
                <Text style={styles.panelHeading}>Complete profile</Text>

                <ProgressNav>
                    <ProgressNavItem
                        onPress={() => {}}
                        testID="createPersonalDataAccount"
                        isCompleted
                        isEnabled={false}
                        text="Create a personal data account"
                    />

                    <ProgressNavItem
                        onPress={() => {}}
                        testID="providePreliminaryHealthSurvey"
                        isCompleted
                        isEnabled={false}
                        text="Provide preliminary health
                        survey"
                    />
                </ProgressNav>
            </View>
        </>
    );
};

export default CompletedHealthStatusView;

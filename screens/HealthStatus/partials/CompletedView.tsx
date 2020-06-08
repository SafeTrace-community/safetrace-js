import React from 'react';
import { FunctionComponent } from 'react';
import { differenceInDays } from 'date-fns';
import { View, Text } from 'react-native';
import { styles } from '../HealthStatus';
import { HealthIndicator } from '../../../components/HealthIndicator';
import sharedStyles from '../../../styles/shared';
import { SecondaryButton } from '../../../components/SecondaryButton';
import { ProgressNav, ProgressNavItem } from '../../../components/ProgressNav';

const getEngagementMessage = (latestHealthSurvey: st.HealthSurvey) => {
    const daysSinceLastHealthSurvey = differenceInDays(
        new Date(),
        new Date(latestHealthSurvey.timestamp)
    );

    return daysSinceLastHealthSurvey === 0
        ? `You have completed a health survey today.`
        : `You last completed a health survey ${daysSinceLastHealthSurvey} days ago. Please consider taking the survey again.`;
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
                        testID={'createPersonalDataAccount'}
                        isCompleted={true}
                        isEnabled={false}
                        text="Create a personal data account"
                    />

                    <ProgressNavItem
                        onPress={() => {}}
                        testID={'providePreliminaryHealthSurvey'}
                        isCompleted={true}
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

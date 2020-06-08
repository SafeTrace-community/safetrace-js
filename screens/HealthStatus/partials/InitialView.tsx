import React, { FunctionComponent } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { View, Image, Text } from 'react-native';
import { RootStackParamList } from '../../../Main';
import { styles } from '../HealthStatus';
import healthSurveyIcon from '../../../assets/icons/health-check-icon.png';
import sharedStyles from '../../../styles/shared';
import { ProgressNav, ProgressNavItem } from '../../../components/ProgressNav';

type Props = {
    isAuthenticated: boolean;
    navigation: StackNavigationProp<RootStackParamList>;
};

const InitialView: FunctionComponent<Props> = ({
    isAuthenticated,
    navigation,
}) => {
    return (
        <View style={styles.panel}>
            <Image
                source={healthSurveyIcon}
                resizeMode="cover"
                style={styles.icon}
            />

            <Text style={[sharedStyles.text, styles.intro]}>
                In order to provide an assessment of your health status, we will
                need you to complete the 2 steps below.
            </Text>

            <ProgressNav>
                <ProgressNavItem
                    onPress={() => navigation.navigate('GetStartedWithPDA')}
                    testID={'createPersonalDataAccount'}
                    isCompleted={isAuthenticated}
                    isEnabled={!isAuthenticated}
                    text="Create a personal data account"
                />

                <ProgressNavItem
                    onPress={() => navigation.navigate('HealthSurvey')}
                    testID={'providePreliminaryHealthSurvey'}
                    isCompleted={false}
                    isEnabled={isAuthenticated}
                    text="Provide preliminary health
                        survey"
                />
            </ProgressNav>
        </View>
    );
};

export default InitialView;

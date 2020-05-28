import { View, SafeAreaView, Text } from 'react-native';
import sharedStyles from '../../styles/shared';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../Main';
import { RouteProp } from '@react-navigation/native';

type Props = {
    navigation: StackNavigationProp<RootStackParamList>;
    route?: RouteProp<RootStackParamList, 'HealthStatus'>;
};

const HealthCheckScreen: React.FunctionComponent<Props> = ({ navigation }) => {
    return (
        <SafeAreaView style={sharedStyles.safeArea}>
            <View style={[sharedStyles.container]}>
                <Text>Todo</Text>
            </View>
        </SafeAreaView>
    );
};

export default HealthCheckScreen;

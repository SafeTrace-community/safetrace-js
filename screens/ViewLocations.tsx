import React, { FunctionComponent, useEffect, useState } from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { View, Text, SafeAreaView } from 'react-native';
import sharedStyles from '../styles/shared';
import hatService from '../services/HATService';
import { ILocationData } from '../services/LocationService';
import { RootStackParamList } from '../Main';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { format } from 'date-fns';

const styles = StyleSheet.create({
    notice: {
        padding: 20,
        fontSize: 16,
    },
    item: {
        flexGrow: 1,
        backgroundColor: '#eee',
        borderRadius: 5,
        padding: 10,
        marginVertical: 5,
        marginHorizontal: 15,
    },
    itemInfo: {
        flexWrap: 'wrap',
        flexDirection: 'row',
    },
    label: {
        fontWeight: '500',
        fontSize: 14,
        marginRight: 10,
        flex: 1,
    },
    value: {
        fontSize: 14,
        flex: 3,
    },
    title: {
        fontSize: 16,
        marginBottom: 5,
        fontWeight: '500',
    },
});

const Item: FunctionComponent<{ location: ILocationData }> = ({
    location: { coords, timestamp },
}: {
    location: ILocationData;
}) => (
    <View style={styles.item} testID="log">
        <Text style={styles.title}>
            {format(new Date(timestamp), 'd/MM/yy hh:mm:ss')}
        </Text>

        <View style={styles.itemInfo}>
            <Text style={styles.label}>Latitude:</Text>
            <Text style={styles.value} testID="latitude">
                {coords.latitude}
            </Text>
        </View>

        <View style={styles.itemInfo}>
            <Text style={styles.label}>Longitude:</Text>
            <Text style={styles.value} testID="longitude">
                {coords.longitude}
            </Text>
        </View>
        <View style={styles.itemInfo}>
            <Text style={styles.label}>Altitude:</Text>
            <Text style={styles.value} testID="altitude">
                {coords.altitude}
            </Text>
        </View>
    </View>
);

type Props = {
    navigation: StackNavigationProp<RootStackParamList>;
    route?: RouteProp<RootStackParamList, 'ViewLocations'>;
};

const ViewLocations: FunctionComponent<Props> = () => {
    const [locations, setLocations] = useState<ILocationData[]>();
    const [refreshing, setRefreshing] = useState<boolean>(false);

    const getLocations = async () => {
        try {
            const locations = await hatService.requestLocationData();
            const reOrderedLocations = locations.sort(
                (a, b) => b.timestamp - a.timestamp
            );
            setLocations(reOrderedLocations);
        } catch (e) {
            console.error('Error fetching locations', e.message);
        }
    };

    useEffect(() => {
        getLocations();
    }, []);
    return (
        <SafeAreaView style={sharedStyles.safeArea}>
            <View>
                {locations && locations.length === 0 && (
                    <Text style={styles.notice} testID="noLogsNotice">
                        No locations have been synced to your Personal Data
                        Account yet. Your locations are synced every 15 minutes
                        so check back shortly.
                    </Text>
                )}

                {locations && (
                    <FlatList
                        data={locations}
                        keyExtractor={(location, index) =>
                            (location &&
                                location.timestamp &&
                                location.timestamp.toString()) ||
                            index.toString()
                        }
                        renderItem={(location) =>
                            (location.item &&
                                location.item.coords &&
                                location.item.timestamp && (
                                    <Item location={location.item} />
                                )) || (
                                <Text testID="malformedLocationPoint">
                                    Malformed location point
                                </Text>
                            )
                        }
                        onRefresh={async () => {
                            setRefreshing(true);
                            await getLocations();
                            setRefreshing(false);
                        }}
                        refreshing={refreshing}
                        style={{ paddingVertical: 10 }}
                        testID="logList"
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

export default ViewLocations;

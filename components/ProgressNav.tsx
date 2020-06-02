import React, { FunctionComponent } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import ProgressNavigationCheckedIcon from '../assets/progress-navigation-checked.svg';
import ProgressNavigationUncheckedIcon from '../assets/progress-navigation-unchecked.svg';
import NavigationCaretIcon from '../assets/navigation-caret.svg';

const styles = StyleSheet.create({
    progressNav: {
        borderTopColor: '#CFCFCF',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#CFCFCF',
        borderBottomWidth: StyleSheet.hairlineWidth,
    },

    progressNavItem: {
        borderBottomColor: '#CFCFCF',
        borderBottomWidth: StyleSheet.hairlineWidth,
    },

    progressNavItemLast: {
        borderBottomWidth: 0,
    },

    progressNavItemLink: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 15,
        paddingBottom: 15,
        paddingLeft: 5,
        paddingRight: 5,
    },

    progressNavItemLinkContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    progressNavItemLinkContentIcon: {
        marginRight: 10,
    },

    progressNavItemLinkText: {
        fontFamily: 'AvenirNext-DemiBold',
        color: '#1F5992',
    },

    progressNavItemDisabled: {
        opacity: 0.5,
    },
});

type ProgressNavProps = {};

type ProgressNavItemProps = {
    isCompleted: boolean;
    isEnabled: boolean;
    onPress: () => void;
    text: string;
    testID?: string;
    lastItem?: boolean;
};

export const ProgressNav: FunctionComponent = ({ children }) => {
    // should probably check children here
    return <View style={styles.progressNav}>{children}</View>;
};

export const ProgressNavItem: FunctionComponent<ProgressNavItemProps> = ({
    onPress,
    isEnabled,
    isCompleted,
    text,
    testID,
    lastItem,
}) => {
    return (
        <View
            style={[
                styles.progressNavItem,
                !isEnabled && !isCompleted && styles.progressNavItemDisabled,
                lastItem && styles.progressNavItemLast,
            ]}
        >
            <TouchableOpacity
                onPress={onPress}
                testID={testID}
                disabled={!isEnabled}
                style={[styles.progressNavItemLink]}
            >
                <View style={styles.progressNavItemLinkContent}>
                    {!isCompleted && (
                        <ProgressNavigationUncheckedIcon
                            height={28}
                            width={28}
                            style={styles.progressNavItemLinkContentIcon}
                            testID={`${testID}NotCompleted`}
                        />
                    )}

                    {isCompleted && (
                        <ProgressNavigationCheckedIcon
                            height={28}
                            width={28}
                            style={styles.progressNavItemLinkContentIcon}
                            testID={`${testID}Completed`}
                        />
                    )}
                    <Text style={styles.progressNavItemLinkText}>{text}</Text>
                </View>
                {isEnabled && <NavigationCaretIcon height={10} width={5} />}
            </TouchableOpacity>
        </View>
    );
};

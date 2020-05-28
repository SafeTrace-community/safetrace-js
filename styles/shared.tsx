import { StyleSheet } from 'react-native';

export const Colors = {
    red: '#DA1F1F',
    amber: '#FFBE0D',
    green: '#00BD47',
};

const sharedStyles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: 'white',
    },
    container: {
        padding: 30,
    },
});

export default sharedStyles;

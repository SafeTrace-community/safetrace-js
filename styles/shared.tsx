import { StyleSheet } from 'react-native';

export const Colors = {
    red: '#DA1F1F',
    amber: '#FFBE0D',
    green: '#00BD47',

    dark: '#272935',
    primary: '#167976',
};

const sharedStyles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F6F7F9',
    },
    container: {
        padding: 30,
    },
    text: {
        fontSize: 14,
        lineHeight: 20,
        fontFamily: 'AvenirNext',
        color: Colors.dark,
    },
});

export default sharedStyles;

import { StyleSheet } from 'react-native';

const sharedStyles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: 'white',
    },
    container: {
        padding: 30,
    },
    text: {
        fontSize: 14,
        lineHeight: 18,
        fontFamily: 'AvenirNext',
        color: '#272935',
    },
});

export default sharedStyles;

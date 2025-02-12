import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from './Icon';
import { icon } from './Image';
import { color } from '../constant';

interface CustomHeaderProps {
    navigation: StackNavigationProp<any, any>;
    title: string;
    showSkip?: boolean; // Default is false
    onSkipPress?: () => void;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({ navigation, title, showSkip = false, onSkipPress }) => {
    return (
        <View style={styles.container}>
            {/* Back Button */}
            <TouchableOpacity
            
            onPress={() => navigation.goBack()} style={styles.backButton}>
                <Icon source={icon.back} size={30} />
            </TouchableOpacity>

            {/* Title */}
            <Text style={styles.title}>{title}</Text>

            {/* Skip Button (conditionally displayed) */}
            {showSkip? (
                <TouchableOpacity onPress={onSkipPress} style={styles.skipButton}>
                    <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>
            ):
            (
                <View style={styles.skipButton}>
                    <Text style={styles.skipText}></Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical:0,
        backgroundColor: color.baground, // Adjust based on your theme
    },
    backButton: {
        padding: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    skipButton: {
        padding: 10,
    },
    skipText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '500',
    },
});

export default CustomHeader;

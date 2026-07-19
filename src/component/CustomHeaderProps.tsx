import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from './Icon';
import { icon } from './Image';
import { color } from '../constant';
import { useBookingFlowNav } from '../hooks/useBookingFlowNav';

interface CustomHeaderProps {
    navigation: NativeStackNavigationProp<any, any>;
    title: string;
    showSkip?: boolean; // Default is false
    onSkipPress?: () => void;
    showHome?: boolean; // Shows a Home icon top-right. Default is false
    isBookingComplete?: boolean; // Home tap resets to Home without confirmation. Default is false
    onBackPress?: () => void; // Overrides the default navigation.goBack() for the back button
    onHomePress?: () => void; // Overrides the default useBookingFlowNav home handler
}

const CustomHeader: React.FC<CustomHeaderProps> = ({
    navigation,
    title,
    showSkip = false,
    onSkipPress,
    showHome = false,
    isBookingComplete = false,
    onBackPress,
    onHomePress,
}) => {
    const { handleHomePress } = useBookingFlowNav(navigation, isBookingComplete);
    const resolvedHomePress = onHomePress ?? handleHomePress;

    return (
        <View style={styles.container}>
            {/* Back Button */}
            <TouchableOpacity

            onPress={onBackPress ?? (() => navigation.goBack())} style={styles.backButton}>
                <Icon source={icon.back} size={30} />
            </TouchableOpacity>

            {/* Title */}
            <Text style={styles.title}>{title}</Text>

            <View style={styles.rightRow}>
                {/* Skip Button (conditionally displayed) */}
                {showSkip && (
                    <TouchableOpacity onPress={onSkipPress} style={styles.skipButton}>
                        <Text style={styles.skipText}>Skip</Text>
                    </TouchableOpacity>
                )}

                {/* Home Button (conditionally displayed) */}
                {showHome ? (
                    <TouchableOpacity
                        onPress={resolvedHomePress}
                        style={styles.homeButton}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Icon source={icon.home1} size={24} />
                    </TouchableOpacity>
                ) : (
                    !showSkip && <View style={styles.skipButton} />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingTop: Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight ?? 24) + 8,
        paddingBottom: 8,
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
    rightRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    skipButton: {
        padding: 10,
    },
    skipText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '500',
    },
    homeButton: {
        padding: 10,
    },
});

export default CustomHeader;

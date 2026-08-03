import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { color } from '../constant';
import { useBookingFlowNav } from '../hooks/useBookingFlowNav';

interface CustomHeaderProps {
    navigation: NativeStackNavigationProp<any, any>;
    title: string;
    subtitle?: string; // Optional line rendered under the title. Omit to keep the header unchanged.
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
    subtitle,
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
                onPress={onBackPress ?? (() => navigation.goBack())}
                style={styles.iconButton}
                activeOpacity={0.75}
                hitSlop={{top: 6, bottom: 6, left: 6, right: 6}}
                accessibilityRole="button"
                accessibilityLabel="Go back">
                <MaterialCommunityIcons name="chevron-left" size={28} color={color.white} />
            </TouchableOpacity>

            {/* Title */}
            <View style={styles.titleCol}>
                <Text style={styles.title}>{title}</Text>
                {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>

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
                        style={[styles.iconButton, styles.homeButton]}
                        activeOpacity={0.75}
                        hitSlop={{top: 6, bottom: 6, left: 6, right: 6}}
                        accessibilityRole="button"
                        accessibilityLabel="Go to home">
                        <MaterialCommunityIcons name="home-outline" size={23} color={color.buttonColor} />
                    </TouchableOpacity>
                ) : (
                    !showSkip && <View style={styles.iconPlaceholder} />
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
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight ?? 24) + 8,
        paddingBottom: 12,
        backgroundColor: color.baground,
    },
    iconButton: {
        width: 42,
        height: 42,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.22)',
    },
    titleCol: {
        flex: 1,
        flexShrink: 1,
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    title: {
        fontSize: 18,
        lineHeight: 23,
        fontWeight: '800',
        color: color.white,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 12.5,
        color: color.textMuted,
        marginTop: 2,
        fontWeight: '500',
    },
    rightRow: {
        minWidth: 42,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
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
        backgroundColor: 'rgba(254,212,40,0.12)',
        borderColor: 'rgba(254,212,40,0.48)',
    },
    iconPlaceholder: {width: 42, height: 42},
});

export default CustomHeader;

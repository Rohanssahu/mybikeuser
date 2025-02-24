import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { icon } from './Image';
import { color } from '../constant';


interface HomeHeaderProps {
    navigation: StackNavigationProp<any, any>;
    location: string;
    hasNotifications?: boolean;
    onLocationPress?: () => void;
    onNotificationPress?: () => void;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({ 
    navigation, 
    location, 
    hasNotifications = false, 
    onLocationPress, 
    onNotificationPress 
}) => {
    return (
        <View style={styles.container}>
            {/* Location Section */}
            <TouchableOpacity onPress={onLocationPress} style={styles.locationContainer}>
                <Image source={icon.pin} style={styles.locationIcon} />
                <Text style={styles.locationText}>{location}</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={{flexDirection:'row',alignItems:'center'}}>
            <View style={styles.divider} />

            {/* Notification Icon */}
            <TouchableOpacity onPress={onNotificationPress} style={styles.notificationContainer}>
                <Image source={icon.notification} style={styles.notificationIcon} />
                {hasNotifications && <View style={styles.badge} />}
            </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: color.baground,
    },
    locationContainer: {
        flexDirection: 'row',
        
    },
    locationIcon: {
        width: 16,
        height: 16,
        tintColor: '#FFC107',
        marginRight: 5,
    },
    locationText: {
        fontSize: 10,
        color: '#fff',
        fontWeight: '500',
        width:'70%'
    },
    divider: {
        height: 15,
        width: 15,
      borderRadius:7.5,
        borderWidth:1,borderColor:color.borderColor,
        marginHorizontal: 15,
    },
    notificationContainer: {
        position: 'relative',
    },
    notificationIcon: {
        width: 30,
        height: 30,
        tintColor: '#fff',
    },
    badge: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 8,
        height: 8,
        backgroundColor: 'red',
        borderRadius: 4,
    },
});

export default HomeHeader;

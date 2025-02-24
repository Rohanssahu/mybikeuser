import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Dimensions,
    ViewToken,
} from 'react-native';

import { StackNavigationProp } from '@react-navigation/stack';
import { color } from '../constant';
import { wp } from './utils/Constant';
import { image_url } from '../redux/Api';

const { width } = Dimensions.get('window');

interface Banner {
    id: string;
    name: string;
    description: string;
    banner_image: string;
}

interface BannerSliderProps {
    navigation: StackNavigationProp<any, any>;
    data: any[];  // Expecting the data passed as a prop
}

const BannerSlider: React.FC<BannerSliderProps> = ({ navigation, data }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList<Banner>>(null);

    const handleViewableItemsChanged = ({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index || 0);
        }
    };

    const renderItem = ({ item }: { item: Banner }) => (
        <View style={styles.bannerContainer}>
            <Image
                source={{ uri: `${image_url}${item.banner_image}` }}
                resizeMode='cover'
                style={styles.bannerImage}
            />
            <View style={styles.overlay} />
            <View style={styles.textContainer}>
                <Text style={styles.title}>{item.name}</Text>
                <Text style={styles.description}>{item.description}</Text>
                <View>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => navigation.navigate('ServiceDetails', { id: item.id })}
                    >
                        <Text style={styles.buttonText}>BOOK</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    // Mapping the data to match the expected structure
    const updatedData = data.map(item => ({
        id: item._id, // Map _id to id
        name: item.name,
        description: item.description || '', // Default to empty string if description is missing
        banner_image: item.banner_image,
    }));

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={updatedData}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                onViewableItemsChanged={handleViewableItemsChanged}
                viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
            />
            {/* Pagination Dots */}
            <View style={styles.pagination}>
                {updatedData.map((_, index) => (
                    <View
                        key={index}
                        style={[styles.dot, currentIndex === index && styles.activeDot]}
                    />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginTop: 20,
    },
    bannerContainer: {
        width: width * 0.9,
        height: 180,
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: color.baground,
        position: 'relative',
        marginHorizontal: 20,
    },
    bannerImage: {
        width: wp(100),
        height: '100%',
        borderRadius: 20,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    textContainer: {
        position: 'absolute',
        left: 15,
        bottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    description: {
        fontSize: 14,
        color: '#ddd',
        marginVertical: 5,
    },
    button: {
        backgroundColor: '#FFC107',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        width: wp(30),
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    pagination: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 10,
        right: 40,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#888',
        marginHorizontal: 2,
    },
    activeDot: {
        backgroundColor: '#fff',
        width: 15,
    },
});

export default BannerSlider;

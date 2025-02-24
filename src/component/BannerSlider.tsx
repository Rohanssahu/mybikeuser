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
import images from './Image';
import { color } from '../constant';
import { wp } from './utils/Constant';
import { image_url } from '../redux/Api';

const { width } = Dimensions.get('window');

interface Banner {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
}

interface BannerSliderProps {
    navigation: StackNavigationProp<any, any>;
}

// Demo Data (Replace API Call)
const demoBanners: Banner[] = [
    {
        id: '1',
        title: 'Car Service',
        description: 'Reliable care for your vehicle',
        imageUrl: images.bannerimg,
    },
    {
        id: '2',
        title: 'Home Cleaning',
        description: 'Professional cleaning at your doorstep',
        imageUrl: images.bannerimg,
    },
    {
        id: '3',
        title: 'Fitness Training',
        description: 'Stay fit with expert guidance',
        imageUrl: images.bannerimg,
    },
];

const BannerSlider: React.FC<BannerSliderProps> = ({ navigation,data }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList<Banner>>(null);

    const handleViewableItemsChanged = ({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index || 0);
        }
    };

    const renderItem = ({ item }: { item: Banner }) => (
        <View style={styles.bannerContainer}>
            <Image source={{uri:`${image_url}${item?.banner_image}`}}
                resizeMode='cover'
                style={styles.bannerImage} />
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

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={data}
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
                {demoBanners.map((_, index) => (
                    <View key={index} style={[styles.dot, currentIndex === index && styles.activeDot]} />
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
        width:wp(30),
        alignItems:'center',
        justifyContent:'center'
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    pagination: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 10,
        right:40
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#888',
        marginHorizontal:2,
    },
    activeDot: {
        backgroundColor: '#fff',
        width:15,
    },
});

export default BannerSlider;

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import CustomHeader from '../../component/CustomHeaderProps';
import { color } from '../../constant';
import VerticalshopList from '../../component/VerticalshopList';
import images from '../../component/Image';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRoute } from '@react-navigation/native';
import { get_FilterBydeler } from '../../redux/Api/apiRequests';

// Define navigation type
type RootStackParamList = {
    NearByShops: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'NearByShops'>;

// Define Shop Item type
interface ShopItem {
    name: string;
    description: string;
    distance: string;
    rating: string;
    images: any;
}

interface Dealer {
    id: string;
    name: string;
    location: string;
    distance: string;
    logo: string;
}
const NearByShops: React.FC<Props> = ({ navigation }) => {
    const [dealerList, setDealerList] = useState<Dealer[]>([]);
    const route = useRoute()
    const { item } = route.params
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchServiceData();
    }, []);


    const fetchServiceData = async () => {
        setLoading(true);
        try {
            const [dealer] = await Promise.all([

                get_FilterBydeler('22.7028609', '75.8715857', item?.variant_id),
            ]);

            if (dealer.data) setDealerList(dealer.data);

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <CustomHeader navigation={navigation} title="Near By Shops" onSkipPress={() => { }} showSkip={false} />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

            {dealerList.length > 0 ? (
              <VerticalshopList data={dealerList} navigation={navigation} bike={item}/>
            ) : (
              <Text style={{ textAlign: 'center', marginVertical: 10 ,color:'#fff'}}>No Dealers Found This Location</Text>
            )}
                
            </ScrollView>
        </View>
    );
};

export default NearByShops;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: color.baground,
    },
    scrollContent: {
        marginTop: 30,
    },
});

// Sample shop list data
const shopList: ShopItem[] = [
    {
        name: 'GearUp Garage',
        description: 'Lorem ipsum dolor sit amet',
        distance: '2.5 km',
        images: images.shop,
        rating: '4.3',
    },
    {
        name: 'MotoFix Center',
        description: 'Lorem ipsum dolor sit amet',
        distance: '3.8 km',
        images: images.shop,
        rating: '4.3',
    },
];

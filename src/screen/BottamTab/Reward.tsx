
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, Image } from 'react-native';
import CustomHeader from '../../component/CustomHeaderProps';
import { color } from '../../constant';
import VerticalshopList from '../../component/VerticalshopList';
import images, { icon } from '../../component/Image';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import BookingList from '../../component/BookingList';
import SearchBar from '../../component/SearchBar';
import Icon from '../../component/Icon';
import ScratchCardList from '../../component/ScratchCardList';

// Define navigation type
type RootStackParamList = {
    NearByShops: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'NearByShops'>;

// Define Shop Item type
interface ShopItem {


    amount: any;
    id: number;
}

const Reward: React.FC<Props> = ({ navigation }) => {
    const [searchQuery, setSearchQuery] = useState('');
    return (
        <View style={styles.container}>
            <Text style={{ fontWeight: '600', fontSize: 18, color: "#fff", paddingHorizontal: 20, marginTop: 20 }}>Reward</Text>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={{ marginHorizontal: 15 }}>
                    <Text style={{ fontWeight: '400', fontSize: 12, color: "#fff", paddingHorizontal: 20, }}>Total Rewards Earned</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Icon source={icon.coins} size={25} />
                            <Text style={{ fontWeight: '600', marginLeft: 10, fontSize: 26, color: '#fff' }}>10.00</Text>
                        </View>

                        <Image
                            source={images.reward}
                            resizeMode='contain'
                            style={{ height: 80, width: 80 }}

                        />
                    </View>
                    <Text style={{ fontWeight: '400', fontSize: 14, color: "#fff", paddingHorizontal: 20, }}>Avaiable Coins</Text>
                </View>
                <Text style={{ fontWeight: '600', fontSize: 18, color: "#fff", marginVertical: 15, paddingHorizontal: 20, marginTop: 20 }}>Today</Text>
                <ScratchCardList data={shopList} navigation={navigation} />
            </ScrollView>
        </View>
    );
};

export default Reward;

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


        amount: null,

        id: 3

    }
    ,
    {

        amount: 100,

        id: 2
    },
    {

        amount: null,

        id: 1
    },

];

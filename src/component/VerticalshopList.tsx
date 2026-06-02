import React, {useState} from 'react';
import {
  View,
  FlatList,
  Image,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {icon} from './Image';
import ScreenNameEnum from '../routes/screenName.enum';
import {image_url} from '../redux/Api';

interface ListItem {
  _id: string;
  shopName: string;
  shopDescription?: string;
  address?: string;
  rating?: string | number;
  shopImages?: any[];
}

interface VerticalListProps {
  data: ListItem[];
  navigation: any;
  bike: any;
  serviceId?: string;
}

const SCREEN_WIDTH = Dimensions.get('window').width;

const ShopCard = ({
  item,
  navigation,
  bike,
  serviceId,
}: {
  item: ListItem;
  navigation: any;
  bike: any;
  serviceId?: string;
}) => {
  const [imgError, setImgError] = useState(false);

  const imgSrc =
    !imgError && item.shopImages && item.shopImages.length > 0
      ? {uri: `${image_url}${item.shopImages[0]}`}
      : require('../assets/images/gragd.png');

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate(ScreenNameEnum.GARAGE_DETAILS, {
          bike,
          id: item._id,
          serviceId,
        })
      }
      style={styles.card}
      activeOpacity={0.82}>
      <Image
        source={imgSrc}
        style={styles.image}
        resizeMode="cover"
        onError={() => setImgError(true)}
      />
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {item.shopName}
        </Text>
        {item.shopDescription ? (
          <Text style={styles.desc} numberOfLines={2}>
            {item.shopDescription}
          </Text>
        ) : null}
        <View style={styles.meta}>
          {item.address ? (
            <View style={styles.metaItem}>
              <Image source={icon.pin} style={styles.metaIcon} />
              <Text style={styles.metaText} numberOfLines={1}>
                {item.address}
              </Text>
            </View>
          ) : null}
          {item.rating ? (
            <View style={styles.metaItem}>
              <Image
                source={icon.star}
                style={[styles.metaIcon, {tintColor: '#FED428'}]}
              />
              <Text style={[styles.metaText, {color: '#FED428'}]}>
                {item.rating}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const VerticalshopList: React.FC<VerticalListProps> = ({
  data,
  navigation,
  bike,
  serviceId,
}) => {
  return (
    <FlatList
      data={data}
      keyExtractor={item => item._id}
      contentContainerStyle={styles.listContainer}
      scrollEnabled={false}
      renderItem={({item}) => (
        <ShopCard item={item} navigation={navigation} bike={bike} serviceId={serviceId} />
      )}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#0F1D3A',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    marginBottom: 14,
    width: SCREEN_WIDTH - 32,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: {width: 0, height: 3},
    shadowRadius: 8,
    elevation: 6,
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#1B2A4A',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  desc: {
    fontSize: 12,
    color: '#A0A3BD',
    lineHeight: 17,
    marginBottom: 6,
  },
  meta: {
    gap: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    width: 12,
    height: 12,
    tintColor: '#FED428',
    marginRight: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#A0A3BD',
    flex: 1,
  },
});

export default VerticalshopList;

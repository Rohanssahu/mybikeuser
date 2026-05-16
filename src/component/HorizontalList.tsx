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
import {hp} from './utils/Constant';
import {image_url} from '../redux/Api';
import {useNavigation} from '@react-navigation/native';
import ScreenNameEnum from '../routes/screenName.enum';

interface ServiceItem {
  _id?: string;
  id?: string;
  name: string;
  image?: string;
}

interface HorizontalListProps {
  data: ServiceItem[];
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = SCREEN_WIDTH * 0.28;

const ServiceCard = ({item}: {item: ServiceItem}) => {
  const navigation = useNavigation();
  const [imgError, setImgError] = useState(false);

  const imageSource =
    !imgError && item.image
      ? {uri: `${image_url}${item.image}`}
      : require('../assets/images/LOGO2x.png');

  return (
    <TouchableOpacity
      onPress={() => {
        (navigation as any).navigate(ScreenNameEnum.MY_BIKES, {profile: false});
      }}
      style={styles.card}
      activeOpacity={0.75}>
      <View style={styles.iconWrapper}>
        <Image
          source={imageSource}
          style={styles.image}
          resizeMode="contain"
          onError={() => setImgError(true)}
        />
      </View>
      <Text style={styles.text} numberOfLines={2}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );
};

const HorizontalList: React.FC<HorizontalListProps> = ({data}) => {
  return (
    <FlatList
      data={data}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={item => item._id || item.id || item.name}
      contentContainerStyle={styles.listContainer}
      renderItem={({item}) => <ServiceCard item={item} />}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 14,
    paddingBottom: 4,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#1B2A4A',
    borderRadius: 16,
    marginTop: 14,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: {width: 0, height: 3},
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(254,212,40,0.12)',
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(254,212,40,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  image: {
    width: 36,
    height: 36,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    color: '#E8E8E8',
    textAlign: 'center',
    lineHeight: 15,
  },
});

export default HorizontalList;

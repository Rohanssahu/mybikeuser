import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  StatusBar,
} from 'react-native';
import {icon, default as images} from '../../component/Image';
import CustomHeader from '../../component/CustomHeaderProps';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {color} from '../../constant';
import {
  get_mybikes,
  remove_bike,
  get_BikeCompany,
  get_BikeModel,
  get_BikeVariant,
} from '../../redux/Api/apiRequests';
import {useIsFocused, useRoute} from '@react-navigation/native';
import ScreenNameEnum from '../../routes/screenName.enum';
import CustomButton from '../../component/CustomButton';
import Loading from '../../configs/Loader';

type RootStackParamList = {AllServices: undefined};
type Props = NativeStackScreenProps<RootStackParamList, 'AllServices'>;

const SCREEN_WIDTH = Dimensions.get('window').width;

const MyBikes: React.FC<Props> = ({navigation}) => {
  const route = useRoute();
  const {profile, Grageid, serviceId} = route.params as {
    profile: boolean;
    Grageid?: string;
    serviceId?: string;
  };

  const [bikes, setBikes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isFocus = useIsFocused();

  useEffect(() => {
    if (isFocus) {fetchBikes();}
  }, [isFocus]);

  const isObjectId = (value: any) =>
    typeof value === 'string' && /^[0-9a-fA-F]{24}$/.test(value);

  const resolveText = (raw: any, map: Record<string, string>) => {
    if (raw && map[raw]) {return map[raw];}
    if (raw && !isObjectId(raw)) {return raw;}
    return '-';
  };

  const withFallback = (rawBikes: any[]) =>
    rawBikes.map((b: any) => ({
      ...b,
      companyName: isObjectId(b?.name) || !b?.name ? '-' : b.name,
      modelName: isObjectId(b?.model) || !b?.model ? '-' : b.model,
      variantName: '-',
      ccDisplay: b?.bike_cc || '-',
    }));

  const enrichBikes = async (rawBikes: any[]) => {
    const companyIds = Array.from(
      new Set(rawBikes.map((b: any) => b?.name).filter(Boolean)),
    );
    const modelIds = Array.from(
      new Set(rawBikes.map((b: any) => b?.model).filter(Boolean)),
    );

    const companyMap: Record<string, string> = {};
    const companyRes = await get_BikeCompany();
    (companyRes?.data || []).forEach((c: any) => {
      if (c?._id) {companyMap[c._id] = c.name;}
    });

    const modelMap: Record<string, string> = {};
    await Promise.all(
      companyIds.map(async (companyId: any) => {
        const res = await get_BikeModel(companyId);
        (res?.data || []).forEach((m: any) => {
          if (m?._id) {modelMap[m._id] = m.model_name;}
        });
      }),
    );

    const variantMap: Record<string, any> = {};
    await Promise.all(
      modelIds.map(async (modelId: any) => {
        const res = await get_BikeVariant(modelId);
        (res?.data || []).forEach((v: any) => {
          if (v?._id) {variantMap[v._id] = v;}
        });
      }),
    );

    return rawBikes.map((b: any) => {
      const variant = variantMap[b?.variant_id];
      return {
        ...b,
        companyName: resolveText(b?.name, companyMap),
        modelName: resolveText(b?.model, modelMap),
        variantName: variant?.variant_name || '-',
        ccDisplay: b?.bike_cc || variant?.engine_cc || '-',
      };
    });
  };

  const fetchBikes = async () => {
    setLoading(true);
    try {
      const res = await get_mybikes();
      const rawBikes = res?.data || [];
      if (!rawBikes.length) {
        setBikes([]);
      } else {
        try {
          setBikes(await enrichBikes(rawBikes));
        } catch {
          setBikes(withFallback(rawBikes));
        }
      }
    } catch {
      setBikes([]);
    } finally {
      setLoading(false);
    }
  };

  const confirmRemove = (id: string) => {
    Alert.alert(
      'Remove Bike',
      'Are you sure you want to remove this bike?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            const res = await remove_bike(id);
            if (res?.success) {fetchBikes();}
            setLoading(false);
          },
        },
      ],
    );
  };

  const handleSelect = (item: any) => {
    if (Grageid) {
      (navigation as any).navigate(ScreenNameEnum.GARAGE_DETAILS, {
        bike: item,
        id: Grageid,
        serviceId,
      });
    } else {
      (navigation as any).navigate(ScreenNameEnum.NEARBY_SHOPS, {item, serviceId});
    }
  };

  const renderBike = ({item}: {item: any}) => (
    <View style={styles.card}>
      <Image source={images.bikes} style={styles.bikeImg} resizeMode="contain" />

      <View style={styles.cardBody}>
        <Text style={styles.plateTxt}>
          {item.plate_number?.toUpperCase() || '-'}
        </Text>
        <Text style={styles.companyTxt}>{item.companyName || '-'}</Text>
        <Text style={styles.modelTxt}>{item.modelName || '-'}</Text>
        <Text style={styles.variantTxt}>{item.variantName || '-'}</Text>
        <View style={styles.tagRow}>
          <View style={[styles.tag, styles.tagCC]}>
            <Text style={[styles.tagText, styles.tagCCText]}>
              {item.ccDisplay && item.ccDisplay !== '-'
                ? `${item.ccDisplay} CC`
                : '-'}
            </Text>
          </View>
        </View>

        {!profile && (
          <TouchableOpacity
            onPress={() => handleSelect(item)}
            style={styles.selectBtn}
            activeOpacity={0.8}>
            <Text style={styles.selectBtnText}>
              {Grageid ? 'Book Service' : 'Find Garages'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        onPress={() => confirmRemove(item._id)}
        style={styles.deleteBtn}
        hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
        <Image source={icon.delete} style={styles.deleteIcon} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={color.baground} barStyle="light-content" />
      {loading && <Loading />}

      <CustomHeader
        navigation={navigation}
        title="My Bikes"
        onSkipPress={() => {}}
        showSkip={false}
        showHome
      />

      {bikes.length > 0 ? (
        <FlatList
          data={bikes}
          keyExtractor={item => item._id || item.plate_number}
          contentContainerStyle={styles.list}
          renderItem={renderBike}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <View style={styles.addBtnWrapper}>
              <CustomButton
                title="Add New Bike"
                onPress={() => (navigation as any).navigate(ScreenNameEnum.BIKE_DETAILS)}
              />
            </View>
          }
        />
      ) : (
        !loading && (
          <View style={styles.emptyState}>
            <Image source={images.bikes} style={styles.emptyImg} resizeMode="contain" />
            <Text style={styles.emptyTitle}>No bikes added yet</Text>
            <Text style={styles.emptySubtitle}>
              Add your bike to get service recommendations
            </Text>
            <View style={styles.addBtnWrapper}>
              <CustomButton
                title="Add Bike"
                onPress={() => (navigation as any).navigate(ScreenNameEnum.BIKE_DETAILS)}
              />
            </View>
          </View>
        )
      )}
    </View>
  );
};

export default MyBikes;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: color.baground},
  list: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 30,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#0F1D3A',
    borderRadius: 16,
    padding: 14,
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
  bikeImg: {
    width: 72,
    height: 72,
    marginRight: 12,
    alignSelf: 'center',
  },
  cardBody: {flex: 1},
  plateTxt: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
  },
  companyTxt: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginTop: 6,
  },
  modelTxt: {
    fontSize: 13,
    color: '#A0A3BD',
    marginTop: 3,
  },
  variantTxt: {
    fontSize: 12,
    color: '#797E95',
    marginTop: 2,
  },
  tagRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 6,
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  tagText: {fontSize: 11, color: '#ccc', fontWeight: '500'},
  tagCC: {backgroundColor: 'rgba(254,212,40,0.12)'},
  tagCCText: {color: '#FED428'},
  selectBtn: {
    marginTop: 10,
    backgroundColor: color.buttonColor,
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 18,
    alignSelf: 'flex-start',
  },
  selectBtnText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 13,
  },
  deleteBtn: {
    padding: 4,
    alignSelf: 'flex-start',
  },
  deleteIcon: {width: 22, height: 22},
  addBtnWrapper: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyImg: {
    width: 120,
    height: 100,
    opacity: 0.25,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#606880',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});

import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import CustomHeader from '../../component/CustomHeaderProps';
import {color} from '../../constant';
import {get_featured_categories} from '../../redux/Api/apiRequests';
import {getCurrentLocation} from '../../component/helperFunction';
import ScreenNameEnum from '../../routes/screenName.enum';

type RootStackParamList = {AllServices: undefined};
type Props = NativeStackScreenProps<RootStackParamList, 'AllServices'>;

interface FeaturedCategory {
  _id: string;
  categoryName: string;
  categoryImage: string;
  serviceId?: {_id: string; name: string};
}

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const NUM_COLUMNS = 3;
const GRID_PADDING = 16;
const CARD_GAP = 10;
const CARD_WIDTH =
  (SCREEN_WIDTH - GRID_PADDING * 2 - CARD_GAP * (NUM_COLUMNS - 1)) /
  NUM_COLUMNS;
const CARD_IMAGE_HEIGHT = CARD_WIDTH;

type SortKey = 'default' | 'az' | 'za';

const SORT_OPTIONS: {label: string; value: SortKey}[] = [
  {label: 'All', value: 'default'},
  {label: 'A → Z', value: 'az'},
  {label: 'Z → A', value: 'za'},
];

const CategoryCard = ({
  item,
  onPress,
}: {
  item: FeaturedCategory;
  onPress: () => void;
}) => {
  const [imgError, setImgError] = useState(false);
  const imgSrc =
    !imgError && item.categoryImage
      ? {uri: item.categoryImage}
      : require('../../assets/images/LOGO2x.png');

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={onPress}>
      <View style={styles.cardInner}>
        <Image
          source={imgSrc}
          style={styles.cardImg}
          resizeMode="cover"
          onError={() => setImgError(true)}
        />
        <View style={styles.cardNameWrapper}>
          <Text
            style={styles.cardName}
            numberOfLines={2}
            ellipsizeMode="tail">
            {item.categoryName}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const AllServices: React.FC<Props> = ({navigation}) => {
  const [categories, setCategories] = useState<FeaturedCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('default');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const {latitude, longitude} = await getCurrentLocation();
      const res = await get_featured_categories(latitude, longitude);
      setCategories(res?.data ?? []);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let list = [...categories];
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(c => c.categoryName.toLowerCase().includes(q));
    }
    if (sort === 'az') {
      list.sort((a, b) => a.categoryName.localeCompare(b.categoryName));
    } else if (sort === 'za') {
      list.sort((a, b) => b.categoryName.localeCompare(a.categoryName));
    }
    return list;
  }, [categories, search, sort]);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={color.baground} barStyle="light-content" />
      <CustomHeader
        navigation={navigation}
        title="Our Services"
        onSkipPress={() => {}}
        showSkip={false}
        showHome
      />

      {/* Search bar */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search services..."
            placeholderTextColor="#666"
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            autoCorrect={false}
          />
          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch('')}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Sort filter chips */}
      <View style={styles.filterRow}>
        {SORT_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt.value}
            style={[
              styles.filterChip,
              sort === opt.value && styles.filterChipActive,
            ]}
            onPress={() => setSort(opt.value)}
            activeOpacity={0.8}>
            <Text
              style={[
                styles.filterChipText,
                sort === opt.value && styles.filterChipTextActive,
              ]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
        {(search.length > 0 || sort !== 'default') && (
          <TouchableOpacity
            style={styles.resetBtn}
            onPress={() => {
              setSearch('');
              setSort('default');
            }}
            activeOpacity={0.8}>
            <Text style={styles.resetBtnText}>Reset</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={color.buttonColor} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item._id}
          numColumns={NUM_COLUMNS}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            filtered.length > 0 ? (
              <Text style={styles.resultCount}>
                {filtered.length} service{filtered.length !== 1 ? 's' : ''}
                {search ? ` for "${search}"` : ''}
              </Text>
            ) : null
          }
          renderItem={({item}) => (
            <CategoryCard
              item={item}
              onPress={() =>
                (navigation as any).navigate(ScreenNameEnum.MY_BIKES, {
                  profile: false,
                  serviceId: item.serviceId?._id,
                })
              }
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyTitle}>
                {search ? `No results for "${search}"` : 'No services available'}
              </Text>
              {search.length > 0 && (
                <TouchableOpacity
                  style={styles.clearBtn}
                  onPress={() => setSearch('')}>
                  <Text style={styles.clearBtnText}>Clear Search</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: color.baground},
  searchWrapper: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    gap: 8,
  },
  searchIcon: {fontSize: 14},
  searchInput: {flex: 1, fontSize: 14, color: '#fff'},
  clearIcon: {fontSize: 13, color: '#888'},
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: color.buttonColor,
    borderColor: color.buttonColor,
  },
  filterChipText: {fontSize: 13, color: '#aaa', fontWeight: '600'},
  filterChipTextActive: {color: '#000'},
  resetBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,80,80,0.4)',
  },
  resetBtnText: {fontSize: 12, color: '#ff6b6b', fontWeight: '600'},
  resultCount: {
    fontSize: 13,
    color: '#8a90a8',
    marginBottom: 14,
    paddingHorizontal: 2,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: GRID_PADDING,
    paddingBottom: 30,
    paddingTop: 4,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: CARD_GAP,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 16,
    backgroundColor: '#101B3D',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 5,
  },
  cardInner: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardImg: {
    width: '100%',
    height: CARD_IMAGE_HEIGHT,
  },
  cardNameWrapper: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  cardName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    textAlign: 'center',
  },
  loader: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  emptyBox: {
    paddingTop: 80,
    alignItems: 'center',
    gap: 10,
  },
  emptyEmoji: {fontSize: 36},
  emptyTitle: {fontSize: 14, color: '#666', textAlign: 'center'},
  clearBtn: {
    marginTop: 6,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(254,212,40,0.12)',
    borderWidth: 1,
    borderColor: color.buttonColor,
  },
  clearBtnText: {fontSize: 13, color: color.buttonColor, fontWeight: '700'},
});

export default AllServices;

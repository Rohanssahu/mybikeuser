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
import {
  get_featured_categories,
  get_services_by_category,
  get_mybikes,
} from '../../redux/Api/apiRequests';
import {getCurrentLocation} from '../../component/helperFunction';
import ScreenNameEnum from '../../routes/screenName.enum';

type RootStackParamList = {
  AllServices: {categoryId?: string; categoryName?: string} | undefined;
};
type Props = NativeStackScreenProps<RootStackParamList, 'AllServices'>;

interface FeaturedCategory {
  _id: string;
  categoryName: string;
  categoryImage: string;
  serviceId?: {_id: string; name: string};
}

interface CategoryServiceItem {
  serviceId: string;
  name: string;
  image?: string;
}

// Normalized shape both the "nearby featured categories" grid and the
// "services within a tapped category" grid render through, so the
// search/sort/list UI below doesn't need to branch on which mode it's in.
interface DisplayItem {
  id: string;
  name: string;
  image?: string;
  serviceId?: string;
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
  item: DisplayItem;
  onPress: () => void;
}) => {
  const [imgError, setImgError] = useState(false);
  const imgSrc =
    !imgError && item.image
      ? {uri: item.image}
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
            {item.name}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const AllServices: React.FC<Props> = ({navigation, route}) => {
  const categoryId = route.params?.categoryId;
  const categoryName = route.params?.categoryName;
  const isCategoryMode = !!categoryId;

  const [items, setItems] = useState<DisplayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('default');

  useEffect(() => {
    if (isCategoryMode) {
      loadCategoryServices(categoryId as string);
    } else {
      loadFeaturedCategories();
    }
  }, [categoryId]);

  const loadFeaturedCategories = async () => {
    setLoading(true);
    try {
      const {latitude, longitude} = await getCurrentLocation();
      const res = await get_featured_categories(latitude, longitude);
      const data: FeaturedCategory[] = res?.data ?? [];
      setItems(
        data.map(c => ({
          id: c._id,
          name: c.categoryName,
          image: c.categoryImage,
          serviceId: c.serviceId?._id,
        })),
      );
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Bike-aware, same pattern Home uses for quick/recommended services:
  // filter to services compatible with the active bike, but fall back to
  // the full category list when there's no bike, or the bike has zero
  // compatible services in this category.
  const loadCategoryServices = async (catId: string) => {
    setLoading(true);
    try {
      let bikeId: string | undefined;
      try {
        const myBikes = await get_mybikes();
        bikeId = myBikes?.data?.[0]?._id;
      } catch {
        bikeId = undefined;
      }

      let services: CategoryServiceItem[] = [];
      if (bikeId) {
        const bikeFiltered = await get_services_by_category(catId, bikeId);
        services = bikeFiltered?.data ?? [];
      }
      if (!services.length) {
        const fullList = await get_services_by_category(catId);
        services = fullList?.data ?? [];
      }

      setItems(
        services.map(s => ({
          id: s.serviceId,
          name: s.name,
          image: s.image,
          serviceId: s.serviceId,
        })),
      );
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let list = [...items];
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(c => c.name.toLowerCase().includes(q));
    }
    if (sort === 'az') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'za') {
      list.sort((a, b) => b.name.localeCompare(a.name));
    }
    return list;
  }, [items, search, sort]);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={color.baground} barStyle="light-content" />
      <CustomHeader
        navigation={navigation}
        title={isCategoryMode ? categoryName || 'Services' : 'Our Services'}
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
          keyExtractor={item => item.id}
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
                  serviceId: item.serviceId,
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

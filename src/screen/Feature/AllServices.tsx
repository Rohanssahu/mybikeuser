import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import CustomHeader from '../../component/CustomHeaderProps';
import {color, radius, spacing} from '../../constant';
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

type SortKey = 'default' | 'az' | 'za';

const SORT_OPTIONS: {label: string; value: SortKey}[] = [
  {label: 'Recommended order', value: 'default'},
  {label: 'Name: A to Z', value: 'az'},
  {label: 'Name: Z to A', value: 'za'},
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
      <View style={styles.imageWrap}>
        <Image
          source={imgSrc}
          style={styles.cardImg}
          resizeMode="cover"
          onError={() => setImgError(true)}
        />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardEyebrow}>SERVICE</Text>
        <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
        <View style={styles.cardHintRow}>
          <MaterialCommunityIcons name="map-marker-radius-outline" size={14} color={color.textMuted} />
          <Text style={styles.cardHint}>View nearby garages</Text>
        </View>
      </View>
      <View style={styles.cardArrow}>
        <MaterialCommunityIcons name="chevron-right" size={22} color={color.buttonColor} />
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
  const [filterVisible, setFilterVisible] = useState(false);

  useEffect(() => {
    if (categoryId) {
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
          <MaterialCommunityIcons name="magnify" size={21} color={color.buttonColor} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search services..."
            placeholderTextColor={color.textMuted}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            autoCorrect={false}
          />
          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch('')}
              hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
              <MaterialCommunityIcons name="close-circle" size={19} color={color.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.listToolbar}>
        <View>
          <Text style={styles.resultCount}>{filtered.length} service{filtered.length !== 1 ? 's' : ''}</Text>
          {search.length > 0 && <Text style={styles.resultSubtitle}>Results for “{search}”</Text>}
        </View>
        <View style={styles.toolbarActions}>
          {(search.length > 0 || sort !== 'default') && (
          <TouchableOpacity
            style={styles.resetBtn}
            onPress={() => {
              setSearch('');
              setSort('default');
            }}
            activeOpacity={0.8}>
            <MaterialCommunityIcons name="refresh" size={16} color={color.danger} />
            <Text style={styles.resetBtnText}>Reset</Text>
          </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.filterButton} onPress={() => setFilterVisible(true)} activeOpacity={0.75}>
            <MaterialCommunityIcons name="tune-variant" size={17} color={color.buttonColor} />
            <Text style={styles.filterButtonText}>Filter</Text>
            {sort !== 'default' && <View style={styles.activeFilterDot} />}
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={color.buttonColor} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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

      <Modal visible={filterVisible} transparent animationType="fade" onRequestClose={() => setFilterVisible(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setFilterVisible(false)} />
        <View style={styles.filterSheet}>
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>Sort services</Text>
              <Text style={styles.sheetSubtitle}>Choose how the list is arranged</Text>
            </View>
            <TouchableOpacity style={styles.sheetClose} onPress={() => setFilterVisible(false)}>
              <MaterialCommunityIcons name="close" size={20} color={color.textPrimary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionLabel}>SORT BY</Text>
          {SORT_OPTIONS.map(option => (
            <TouchableOpacity key={option.value} style={styles.sortRow} onPress={() => setSort(option.value)}>
              <View style={styles.sortLabelRow}>
                <MaterialCommunityIcons
                  name={option.value === 'default' ? 'format-list-bulleted' : option.value === 'az' ? 'sort-alphabetical-ascending' : 'sort-alphabetical-descending'}
                  size={19}
                  color={sort === option.value ? color.buttonColor : color.textMuted}
                />
                <Text style={[styles.sortText, sort === option.value && styles.sortTextActive]}>{option.label}</Text>
              </View>
              <MaterialCommunityIcons name={sort === option.value ? 'radiobox-marked' : 'radiobox-blank'} size={20} color={sort === option.value ? color.buttonColor : color.textMuted} />
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.applyButton} onPress={() => setFilterVisible(false)}>
            <Text style={styles.applyButtonText}>Show {filtered.length} service{filtered.length !== 1 ? 's' : ''}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
    backgroundColor: color.cardSurface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    paddingHorizontal: 14,
    minHeight: 52,
    gap: 8,
  },
  searchInput: {flex: 1, fontSize: 14, color: color.textPrimary, paddingVertical: 0},
  listToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  toolbarActions: {flexDirection: 'row', alignItems: 'center', gap: 8},
  filterButton: {flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: 'rgba(254,212,40,0.45)', backgroundColor: 'rgba(254,212,40,0.09)', borderRadius: radius.pill, paddingHorizontal: 11, paddingVertical: 8},
  filterButtonText: {fontSize: 12, fontWeight: '700', color: color.buttonColor},
  activeFilterDot: {width: 7, height: 7, borderRadius: 4, backgroundColor: color.success},
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.4)',
  },
  resetBtnText: {fontSize: 11, color: color.danger, fontWeight: '700'},
  resultCount: {
    fontSize: 14,
    color: color.textPrimary,
    fontWeight: '800',
  },
  resultSubtitle: {fontSize: 10.5, color: color.textMuted, marginTop: 2, maxWidth: 170},
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 30,
    paddingTop: spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    backgroundColor: color.cardSurface,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  imageWrap: {width: 72, height: 72, borderRadius: radius.md, overflow: 'hidden', backgroundColor: color.cardSurfaceElevated},
  cardImg: {
    width: '100%',
    height: '100%',
  },
  cardContent: {flex: 1, paddingHorizontal: spacing.md},
  cardEyebrow: {fontSize: 9, letterSpacing: 0.7, fontWeight: '800', color: color.buttonColor},
  cardName: {
    color: color.textPrimary,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
    marginTop: 3,
  },
  cardHintRow: {flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 7},
  cardHint: {fontSize: 11, color: color.textMuted, fontWeight: '600'},
  cardArrow: {width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(254,212,40,0.1)', alignItems: 'center', justifyContent: 'center'},
  loader: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  emptyBox: {
    paddingTop: 80,
    alignItems: 'center',
    gap: 10,
  },
  emptyEmoji: {fontSize: 36},
  emptyTitle: {fontSize: 14, color: color.textMuted, textAlign: 'center'},
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
  modalBackdrop: {flex: 1, backgroundColor: 'rgba(0,0,0,0.5)'},
  filterSheet: {backgroundColor: color.cardSurface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xxl},
  sheetHeader: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg},
  sheetTitle: {fontSize: 18, fontWeight: '800', color: color.textPrimary},
  sheetSubtitle: {fontSize: 11.5, color: color.textMuted, marginTop: 3},
  sheetClose: {width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center'},
  sectionLabel: {fontSize: 10, fontWeight: '800', letterSpacing: 0.8, color: color.textMuted, marginBottom: 5},
  sortRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderTopWidth: 1, borderTopColor: color.borderSubtle},
  sortLabelRow: {flexDirection: 'row', alignItems: 'center', gap: 10},
  sortText: {fontSize: 14, fontWeight: '600', color: color.textMuted},
  sortTextActive: {color: color.buttonColor},
  applyButton: {backgroundColor: color.buttonColor, borderRadius: radius.sm, alignItems: 'center', paddingVertical: 13, marginTop: spacing.lg},
  applyButtonText: {fontSize: 14, fontWeight: '800', color: color.baground},
});

export default AllServices;

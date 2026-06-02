import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
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
      <Image
        source={imgSrc}
        style={styles.cardImg}
        resizeMode="cover"
        onError={() => setImgError(true)}
      />
      <View style={styles.cardOverlay}>
        <Text style={styles.cardName} numberOfLines={2}>
          {item.categoryName}
        </Text>
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
          numColumns={2}
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
    paddingTop: 14,
    paddingBottom: 8,
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
    paddingBottom: 12,
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
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  list: {paddingHorizontal: 14, paddingBottom: 30, paddingTop: 4},
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  card: {
    width: 100,
    height: 100,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1B2A4A',
  },
  cardImg: {width: '100%', height: '100%', position: 'absolute'},
  cardOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  cardName: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 17,
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

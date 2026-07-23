import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
  Image,
} from 'react-native';
import {color} from '../../constant';
import Icon from '../Icon';
import {icon, default as images} from '../Image';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.78;

export interface SheetItem {
  [key: string]: any;
}

interface SearchableSheetProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  data: SheetItem[];
  keyField?: string;
  labelField: string;
  searchFields?: string[];
  getSubtitle?: (item: SheetItem) => string | null | undefined;
  onSelect: (item: SheetItem) => void;
  loading?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
  onRetry?: () => void;
}

const SkeletonRow: React.FC<{delay: number}> = ({delay}) => {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 800,
          delay,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [shimmer, delay]);

  const opacity = shimmer.interpolate({inputRange: [0, 1], outputRange: [0.35, 0.85]});

  return (
    <View style={styles.row}>
      <Animated.View style={[styles.skeletonAvatar, {opacity}]} />
      <View style={{flex: 1}}>
        <Animated.View style={[styles.skeletonLine, {opacity, width: '55%'}]} />
        <Animated.View
          style={[styles.skeletonLine, {opacity, width: '35%', marginTop: 8}]}
        />
      </View>
    </View>
  );
};

const SearchableSheet: React.FC<SearchableSheetProps> = ({
  visible,
  title,
  onClose,
  data,
  keyField = '_id',
  labelField,
  searchFields,
  getSubtitle,
  onSelect,
  loading = false,
  emptyTitle = 'Nothing here yet',
  emptyMessage = 'No options available right now.',
  onRetry,
}) => {
  const [query, setQuery] = useState('');
  const [mounted, setMounted] = useState(visible);
  const translateY = useRef(new Animated.Value(SHEET_MAX_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      setQuery('');
      requestAnimationFrame(() => {
        Animated.parallel([
          Animated.timing(backdropOpacity, {
            toValue: 1,
            duration: 220,
            useNativeDriver: true,
          }),
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            friction: 9,
            tension: 65,
          }),
        ]).start();
      });
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: SHEET_MAX_HEIGHT,
          duration: 220,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => setMounted(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const fields = useMemo(
    () => searchFields && searchFields.length ? searchFields : [labelField],
    [searchFields, labelField],
  );

  const filtered = useMemo(() => {
    if (!query.trim()) {return data;}
    const q = query.trim().toLowerCase();
    return data.filter(item =>
      fields.some(f => String(item?.[f] ?? '').toLowerCase().includes(q)),
    );
  }, [data, query, fields]);

  if (!mounted) {return null;}

  const showEmpty = !loading && filtered.length === 0;

  return (
    <Modal visible transparent statusBarTranslucent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={[styles.backdrop, {opacity: backdropOpacity}]} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[styles.sheet, {transform: [{translateY}]}]}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
              style={styles.closeBtn}>
              <Icon source={icon.close} size={16} tintColor="#C7CCE6" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchBar}>
            <Icon source={icon.search} size={16} tintColor="#7C86B8" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={`Search ${title.toLowerCase()}`}
              placeholderTextColor="#7C86B8"
              style={styles.searchInput}
              autoCorrect={false}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')} hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                <Icon source={icon.close} size={13} tintColor="#7C86B8" />
              </TouchableOpacity>
            )}
          </View>

          {loading ? (
            <View style={styles.listPad}>
              {[0, 90, 180, 270, 360].map((d, i) => (
                <SkeletonRow key={i} delay={d} />
              ))}
            </View>
          ) : showEmpty ? (
            <View style={styles.emptyState}>
              <Image source={images.bikes} style={styles.emptyImg} resizeMode="contain" />
              <Text style={styles.emptyTitle}>
                {query ? 'No matches found' : emptyTitle}
              </Text>
              <Text style={styles.emptyMessage}>
                {query
                  ? `We couldn't find anything for "${query}".`
                  : emptyMessage}
              </Text>
              {onRetry && !query ? (
                <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
                  <Text style={styles.retryText}>Try again</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item, index) => String(item?.[keyField] ?? index)}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.listPad}
              showsVerticalScrollIndicator={false}
              renderItem={({item}) => {
                const subtitle = getSubtitle ? getSubtitle(item) : null;
                return (
                  <TouchableOpacity
                    style={styles.row}
                    activeOpacity={0.7}
                    onPress={() => onSelect(item)}>
                    <View style={styles.rowAvatar}>
                      <Text style={styles.rowAvatarLetter}>
                        {String(item?.[labelField] ?? '?').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{flex: 1}}>
                      <Text style={styles.rowLabel} numberOfLines={1}>
                        {item?.[labelField]}
                      </Text>
                      {subtitle ? (
                        <Text style={styles.rowSubtitle} numberOfLines={1}>
                          {subtitle}
                        </Text>
                      ) : null}
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {flex: 1, justifyContent: 'flex-end'},
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  sheet: {
    maxHeight: SHEET_MAX_HEIGHT,
    minHeight: SHEET_MAX_HEIGHT * 0.55,
    backgroundColor: '#0D1530',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  title: {fontSize: 17, fontWeight: '700', color: '#fff'},
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    backgroundColor: color.cardSurface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 14,
    height: 46,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14.5,
    color: '#fff',
    marginLeft: 10,
  },
  listPad: {paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  rowAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(254,212,40,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  rowAvatarLetter: {color: color.buttonColor, fontSize: 15, fontWeight: '700'},
  rowLabel: {fontSize: 15, fontWeight: '600', color: '#fff'},
  rowSubtitle: {fontSize: 12.5, color: '#8892C0', marginTop: 3, fontWeight: '500'},
  skeletonAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginRight: 14,
  },
  skeletonLine: {
    height: 11,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 20,
    paddingBottom: 40,
  },
  emptyImg: {width: 96, height: 80, opacity: 0.25, marginBottom: 16},
  emptyTitle: {fontSize: 16, fontWeight: '700', color: '#fff', textAlign: 'center'},
  emptyMessage: {
    fontSize: 13,
    color: '#8892C0',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19,
  },
  retryBtn: {
    marginTop: 18,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(254,212,40,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(254,212,40,0.35)',
  },
  retryText: {color: color.buttonColor, fontSize: 13.5, fontWeight: '700'},
});

export default SearchableSheet;

import React, {useMemo, useRef, useState} from 'react';
import {
  Animated,
  Image,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {color, radius} from '../../constant';
import {SearchResult, searchIndex} from './homeData';

const TYPE_ICON: Record<SearchResult['type'], string> = {
  service: 'wrench-outline',
  category: 'shape-outline',
  garage: 'store-outline',
  bike: 'motorbike',
};

const TYPE_LABEL: Record<SearchResult['type'], string> = {
  service: 'Service',
  category: 'Category',
  garage: 'Garage',
  bike: 'Your Bike',
};

const HomeSearchBar: React.FC<{
  index: SearchResult[];
  placeholder?: string;
  onSelectResult: (result: SearchResult) => void;
}> = ({index, placeholder = 'What service does your bike need?', onSelectResult}) => {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  const results = useMemo(() => searchIndex(index, query, 8), [index, query]);
  const showDropdown = focused && query.trim().length > 0;

  const animateFocus = (toValue: number) => {
    Animated.timing(borderAnim, {toValue, duration: 180, useNativeDriver: false}).start();
  };

  const borderColorAnim = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [color.borderSubtle, 'rgba(254,212,40,0.55)'],
  });

  const handleSelect = (result: SearchResult) => {
    Keyboard.dismiss();
    setFocused(false);
    setQuery('');
    onSelectResult(result);
  };

  return (
    <View style={styles.wrapper}>
      <Animated.View style={[styles.container, {borderColor: borderColorAnim}]}>
        <MaterialCommunityIcons name="magnify" size={20} color="#6B7DBE" />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#6B7DBE"
          value={query}
          onChangeText={setQuery}
          onFocus={() => {
            setFocused(true);
            animateFocus(1);
          }}
          onBlur={() => animateFocus(0)}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <MaterialCommunityIcons name="close-circle" size={18} color="#4A5680" />
          </TouchableOpacity>
        )}
      </Animated.View>

      {showDropdown && (
        <>
          <Pressable style={styles.backdrop} onPress={() => setFocused(false)} />
          <View style={styles.dropdown}>
            {results.length === 0 ? (
              <View style={styles.emptyWrap}>
                <MaterialCommunityIcons name="text-search" size={22} color={color.textFaint} />
                <Text style={styles.emptyText}>No matches for "{query}"</Text>
              </View>
            ) : (
              <ScrollView keyboardShouldPersistTaps="handled" style={{maxHeight: 320}}>
                {results.map(item => (
                  <TouchableOpacity
                    key={`${item.type}-${item.id}`}
                    style={styles.resultRow}
                    activeOpacity={0.7}
                    onPress={() => handleSelect(item)}>
                    <View style={styles.resultIconWrap}>
                      {item.image ? (
                        <Image source={{uri: item.image}} style={styles.resultImg} />
                      ) : (
                        <MaterialCommunityIcons name={TYPE_ICON[item.type]} size={18} color={color.buttonColor} />
                      )}
                    </View>
                    <View style={{flex: 1}}>
                      <Text style={styles.resultTitle} numberOfLines={1}>{item.title}</Text>
                      <Text style={styles.resultSubtitle} numberOfLines={1}>
                        {TYPE_LABEL[item.type]}{item.subtitle ? ` · ${item.subtitle}` : ''}
                      </Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={18} color={color.textFaint} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 20,
    marginTop: 16,
    zIndex: 20,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.cardSurface,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: color.textPrimary,
    marginLeft: 10,
    fontWeight: '500',
  },
  backdrop: {
    position: 'absolute',
    top: 58,
    left: -1000,
    right: -1000,
    height: 2000,
    zIndex: 5,
  },
  dropdown: {
    position: 'absolute',
    top: 58,
    left: 0,
    right: 0,
    backgroundColor: color.cardSurfaceElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.borderSubtle,
    paddingVertical: 6,
    zIndex: 10,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowOffset: {width: 0, height: 10},
    shadowRadius: 16,
    elevation: 12,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  resultIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(254,212,40,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  resultImg: {width: 34, height: 34},
  resultTitle: {fontSize: 13.5, fontWeight: '700', color: color.textPrimary},
  resultSubtitle: {fontSize: 11.5, color: color.textMuted, marginTop: 2},
  emptyWrap: {alignItems: 'center', paddingVertical: 24, gap: 8},
  emptyText: {fontSize: 12.5, color: color.textMuted},
});

export default HomeSearchBar;

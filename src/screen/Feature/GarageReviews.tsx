import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import {base_url} from '../../redux/Api';
import {color} from '../../constant';

const labels: Record<string, string> = {
  serviceQuality: 'Service Quality',
  mechanicBehaviour: 'Mechanic Behaviour',
  pickupExperience: 'Pickup Experience',
  deliveryExperience: 'Delivery Experience',
  timeManagement: 'Time Management',
  communication: 'Communication',
};
export default function GarageReviews({navigation, route}: any) {
  const {dealerId, garageName} = route.params || {};
  const [reviews, setReviews] = useState<any[]>([]),
    [summary, setSummary] = useState<any>(null),
    [page, setPage] = useState(1),
    [pages, setPages] = useState(1),
    [loading, setLoading] = useState(true),
    [more, setMore] = useState(false);
  const load = useCallback(
    async (next = 1) => {
      next === 1 ? setLoading(true) : setMore(true);
      try {
        const r = await axios.get(
          `${base_url}/bikedoctor/rating/dealer/${dealerId}/public`,
          {params: {page: next, limit: 10}},
        );
        setReviews(x => (next === 1 ? r.data.data : [...x, ...r.data.data]));
        setSummary(r.data.summary);
        setPage(next);
        setPages(r.data.pagination?.pages || 1);
      } finally {
        setLoading(false);
        setMore(false);
      }
    },
    [dealerId],
  );
  useEffect(() => {
    load(1);
  }, [load]);
  const distribution = summary?.distribution || {};
  const total = summary?.reviewCount || 0;
  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={navigation.goBack}>
          <MaterialCommunityIcons name="arrow-left" size={25} color="#fff" />
        </TouchableOpacity>
        <View style={s.headerText}>
          <Text style={s.headerTitle}>Ratings & Reviews</Text>
          <Text style={s.headerSub} numberOfLines={1}>
            {garageName}
          </Text>
        </View>
      </View>
      {loading ? (
        <View style={s.center}>
          <ActivityIndicator color={color.buttonColor} />
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={x => x._id}
          contentContainerStyle={s.content}
          ListHeaderComponent={
            <>
              <View style={s.overall}>
                <View>
                  <Text style={s.big}>
                    {Number(summary?.averageRating || 0).toFixed(1)}
                  </Text>
                  <Text style={s.bigStars}>★★★★★</Text>
                  <Text style={s.muted}>{total} verified reviews</Text>
                </View>
                <View style={s.dist}>
                  {[5, 4, 3, 2, 1].map(n => (
                    <View key={n} style={s.distRow}>
                      <Text style={s.distLabel}>{n}★</Text>
                      <View style={s.track}>
                        <View
                          style={[
                            s.fill,
                            {
                              width: `${
                                total
                                  ? ((distribution[n] || 0) / total) * 100
                                  : 0
                              }%`,
                            },
                          ]}
                        />
                      </View>
                      <Text style={s.distCount}>{distribution[n] || 0}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <Text style={s.section}>Category ratings</Text>
              <View style={s.categories}>
                {Object.entries(labels).map(([key, label]) => (
                  <View key={key} style={s.category}>
                    <Text style={s.categoryLabel}>{label}</Text>
                    <Text style={s.categoryScore}>
                      ★ {Number(summary?.categoryScores?.[key] || 0).toFixed(1)}
                    </Text>
                  </View>
                ))}
              </View>
              <Text style={s.section}>Recent reviews</Text>
            </>
          }
          ListEmptyComponent={
            <Text style={s.empty}>No published reviews yet.</Text>
          }
          renderItem={({item}) => (
            <View style={s.card}>
              <View style={s.reviewTop}>
                <View>
                  <Text style={s.name}>
                    {item.customer?.first_name || 'Anonymous'}{' '}
                    {item.customer?.last_name || ''}
                  </Text>
                  <View style={s.verified}>
                    <MaterialCommunityIcons
                      name="check-decagram"
                      size={12}
                      color="#38D996"
                    />
                    <Text style={s.verifiedText}>Verified Review</Text>
                  </View>
                </View>
                <View>
                  <Text style={s.reviewStars}>{'★'.repeat(item.rating)}</Text>
                  <Text style={s.date}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              {item.comment ? (
                <Text style={s.comment}>{item.comment}</Text>
              ) : null}
              {item.images?.length > 0 && (
                <View style={s.photos}>
                  {item.images.map((x: any) => (
                    <Image key={x._id} source={{uri: x.url}} style={s.photo} />
                  ))}
                </View>
              )}
              {item.replies?.[0] && (
                <View style={s.reply}>
                  <Text style={s.replyLabel}>
                    Response from {garageName || 'garage'}
                  </Text>
                  <Text style={s.replyBody}>{item.replies[0].body}</Text>
                </View>
              )}
              <TouchableOpacity style={s.helpful}>
                <MaterialCommunityIcons
                  name="thumb-up-outline"
                  size={14}
                  color={color.textMuted}
                />
                <Text style={s.helpfulText}>Helpful</Text>
              </TouchableOpacity>
            </View>
          )}
          ListFooterComponent={
            page < pages ? (
              <TouchableOpacity
                disabled={more}
                style={s.load}
                onPress={() => load(page + 1)}>
                <Text style={s.loadText}>
                  {more ? 'Loading…' : 'Load More'}
                </Text>
              </TouchableOpacity>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  safe: {flex: 1, backgroundColor: '#111'},
  header: {
    height: 60,
    paddingHorizontal: 17,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#292929',
  },
  headerTitle: {color: '#fff', fontSize: 17, fontWeight: '900'},
  headerText: {flex: 1, marginLeft: 12},
  headerSub: {color: '#777', fontSize: 11, marginTop: 2},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  content: {padding: 15, paddingBottom: 35},
  overall: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
    backgroundColor: '#1B1B1B',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#2C2C2C',
  },
  big: {color: '#fff', fontSize: 44, fontWeight: '900'},
  bigStars: {color: '#FFD54A', letterSpacing: 1},
  muted: {color: '#777', fontSize: 11, marginTop: 5},
  dist: {flex: 1, justifyContent: 'center', gap: 5},
  distRow: {flexDirection: 'row', alignItems: 'center', gap: 6},
  distLabel: {color: '#bbb', fontSize: 10, width: 18},
  track: {
    height: 6,
    backgroundColor: '#333',
    borderRadius: 4,
    flex: 1,
    overflow: 'hidden',
  },
  fill: {height: 6, backgroundColor: '#FFD54A'},
  distCount: {color: '#777', fontSize: 9, width: 18},
  section: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '900',
    marginTop: 20,
    marginBottom: 10,
  },
  categories: {
    backgroundColor: '#1B1B1B',
    borderRadius: 16,
    paddingHorizontal: 14,
  },
  category: {
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#292929',
  },
  categoryLabel: {color: '#ccc', fontSize: 12},
  categoryScore: {color: '#FFD54A', fontWeight: '900'},
  card: {
    backgroundColor: '#1B1B1B',
    borderRadius: 16,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#292929',
  },
  reviewTop: {flexDirection: 'row', justifyContent: 'space-between'},
  name: {color: '#fff', fontWeight: '800'},
  verified: {flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4},
  verifiedText: {fontSize: 9, color: '#70E6B2', fontWeight: '700'},
  reviewStars: {color: '#FFD54A', textAlign: 'right'},
  date: {color: '#666', fontSize: 9, textAlign: 'right', marginTop: 3},
  comment: {color: '#ccc', lineHeight: 19, fontSize: 13, marginTop: 11},
  photos: {flexDirection: 'row', gap: 7, marginTop: 11},
  photo: {width: 72, height: 72, borderRadius: 10},
  reply: {
    backgroundColor: '#272727',
    padding: 11,
    borderRadius: 11,
    marginTop: 11,
  },
  replyLabel: {color: '#FFD54A', fontSize: 10, fontWeight: '800'},
  replyBody: {color: '#bbb', fontSize: 12, lineHeight: 17, marginTop: 4},
  helpful: {flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 12},
  helpfulText: {color: color.textMuted, fontSize: 11, fontWeight: '700'},
  load: {
    height: 45,
    borderWidth: 1,
    borderColor: '#FFD54A',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  loadText: {color: '#FFD54A', fontWeight: '900'},
  empty: {color: '#777', textAlign: 'center', padding: 30},
});

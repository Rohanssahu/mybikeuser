import React, {useCallback, useMemo, useState} from 'react';
import {ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation, useRoute} from '@react-navigation/native';
import CustomHeader from '../../component/CustomHeaderProps';
import ServiceSummaryCard from '../../component/serviceDetail/ServiceSummaryCard';
import GarageCompareCard, {CompareGarage} from '../../component/serviceDetail/GarageCompareCard';
import ScreenNameEnum from '../../routes/screenName.enum';
import {color, radius, spacing} from '../../constant';
import {get_FilterBydeler, get_servicelist, get_dealer_services, get_mybikes} from '../../redux/Api/apiRequests';
import {getCurrentLocation} from '../../component/helperFunction';
import {useRefreshOnResume} from '../../hooks/useRefreshOnResume';
import {calcDistanceKm} from '../../component/home/homeData';

type SortKey = 'price' | 'rating' | 'distance';

const SORT_OPTIONS: {key: SortKey; label: string}[] = [
  {key: 'price', label: 'Price'},
  {key: 'rating', label: 'Rating'},
  {key: 'distance', label: 'Distance'},
];

// Same free-text convention GarageDetails.tsx already parses duration out
// of ("Estimated Duration: 45 Minutes" embedded in the service description)
// — there is no discrete duration field on the service model, so this is
// the only real (if fragile) source for a duration chip. Returns undefined
// rather than a guessed number when the text doesn't contain one.
const extractDurationLabel = (description?: string): string | undefined => {
  if (!description) return undefined;
  const line = description
    .split('\n')
    .map(l => l.trim())
    .find(l => /estimated duration:/i.test(l) || /minutes?\b/i.test(l));
  if (!line) return undefined;
  return line.replace(/estimated duration:/i, '').trim() || undefined;
};

const ServiceDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const {serviceId, bikeId} = (route.params ?? {}) as {serviceId: string; bikeId?: string};

  const [loading, setLoading] = useState(false);
  const [serviceName, setServiceName] = useState('');
  const [serviceImage, setServiceImage] = useState<string | undefined>();
  const [durationLabel, setDurationLabel] = useState<string | undefined>();
  const [garages, setGarages] = useState<CompareGarage[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>('price');
  const [sortSheetVisible, setSortSheetVisible] = useState(false);
  const hasBikeContext = !!bikeId;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [{latitude, longitude}, bikesRes, servicesRes] = await Promise.all([
        getCurrentLocation(),
        bikeId ? get_mybikes() : Promise.resolve(null),
        get_servicelist(),
      ]);

      const bike = bikeId && bikesRes?.success
        ? (bikesRes.data as any[]).find(b => b._id === bikeId)
        : null;
      const variantId = bike?.variant_id;
      const cc = bike?.bike_cc?.toString().replace(/\D/g, '') || undefined;

      const matchedService = servicesRes?.success
        ? (servicesRes.data as any[]).find(s => s._id === serviceId)
        : null;
      setServiceName(matchedService?.name ?? '');
      setServiceImage(matchedService?.image);

      const dealerRes = await get_FilterBydeler(latitude, longitude, variantId, serviceId, cc);
      const dealers: any[] = dealerRes?.success ? dealerRes.data : [];

      // Per-garage price for this exact service has no batch endpoint —
      // it only exists per-dealer via get_dealer_services (same call
      // GarageDetails makes once a garage is opened). Resolvable only once
      // we know the bike's variant_id/cc; the list here is always
      // nearby-filtered (never unbounded), so one call per dealer is fine.
      const withPriceAndDistance = await Promise.all(
        dealers.map(async d => {
          const distanceKm =
            latitude && longitude && d.latitude && d.longitude
              ? calcDistanceKm(Number(latitude), Number(longitude), Number(d.latitude), Number(d.longitude))
              : null;

          let price: number | null = null;
          let matchedDuration: string | undefined;
          if (variantId) {
            const svcRes = await get_dealer_services(d._id, variantId, cc);
            const match = svcRes?.success
              ? (svcRes.data as any[]).find((s: any) => (s.serviceId ?? s._id) === serviceId)
              : null;
            if (match) {
              price = match.price ?? match.bikes?.[0]?.price ?? null;
              matchedDuration = extractDurationLabel(match.description ?? match.base_service_id?.description);
            }
          }

          return {
            _id: d._id,
            shopName: d.shopName,
            shopImages: d.shopImages,
            fullAddress: d.fullAddress,
            address: d.address,
            averageRating: d.averageRating,
            isOpen: d.isOpen,
            pickupAndDrop: d.pickupAndDrop,
            distanceKm,
            price,
            matchedDuration,
          };
        }),
      );

      setGarages(
        withPriceAndDistance.map(g => ({
          _id: g._id,
          shopName: g.shopName,
          shopImages: g.shopImages,
          fullAddress: g.fullAddress,
          address: g.address,
          averageRating: g.averageRating,
          isOpen: g.isOpen,
          pickupAndDrop: g.pickupAndDrop,
          distanceKm: g.distanceKm,
          price: g.price,
        })),
      );
      setDurationLabel(withPriceAndDistance.find(g => g.matchedDuration)?.matchedDuration);
    } catch (error) {
      console.error('ServiceDetailScreen fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [serviceId, bikeId]);

  // Refetch on focus/resume — a garage's open/closed status and price can
  // change at any time, same rule NearByShops/GarageDetails already follow.
  useRefreshOnResume(fetchData);

  const sortedGarages = useMemo(() => {
    const list = [...garages];
    list.sort((a, b) => {
      if (sortKey === 'price') {
        if (a.price == null && b.price == null) return 0;
        if (a.price == null) return 1;
        if (b.price == null) return -1;
        return a.price - b.price;
      }
      if (sortKey === 'rating') {
        return (b.averageRating ?? 0) - (a.averageRating ?? 0);
      }
      if (a.distanceKm == null && b.distanceKm == null) return 0;
      if (a.distanceKm == null) return 1;
      if (b.distanceKm == null) return -1;
      return a.distanceKm - b.distanceKm;
    });
    return list;
  }, [garages, sortKey]);

  const priceValues = garages.map(g => g.price).filter((p): p is number => p != null);
  const fromPrice = priceValues.length > 0 ? Math.min(...priceValues) : null;
  const anyPickup = garages.some(g => g.pickupAndDrop);

  const summaryParts: string[] = [];
  if (fromPrice != null) summaryParts.push(`From ₹${fromPrice}`);
  else if (!hasBikeContext) summaryParts.push('Select a bike to see pricing');
  if (durationLabel) summaryParts.push(durationLabel);
  // "Booked N+ times" intentionally omitted — no booking-count field exists
  // on any service/dealer response today. See report to product/backend.

  const goToGarageDetails = (garageId: string) => {
    // TODO: GarageDetails needs the full bike object (variant_id/bike_cc) to
    // price the booking — ServiceDetailScreen only receives a bikeId. Once a
    // caller wires this screen up from a place that already holds the full
    // bike object (e.g. after MyBikes), pass that object through instead of
    // this placeholder.
    (navigation as any).navigate(ScreenNameEnum.GARAGE_DETAILS, {
      bike: bikeId ? {_id: bikeId} : null,
      id: garageId,
      serviceId,
    });
  };

  return (
    <View style={styles.container}>
      <CustomHeader navigation={navigation} title={serviceName || 'Service'} showHome />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <ServiceSummaryCard name={serviceName} image={serviceImage} subtitle={summaryParts.join(' · ')} />

        {(durationLabel || anyPickup) && (
          <View style={styles.tagRow}>
            {durationLabel && (
              <View style={styles.chip}>
                <MaterialCommunityIcons name="clock-outline" size={13} color={color.buttonColor} />
                <Text style={styles.chipText}>{durationLabel}</Text>
              </View>
            )}
            {anyPickup && (
              <View style={styles.chip}>
                <MaterialCommunityIcons name="truck-fast-outline" size={13} color={color.buttonColor} />
                <Text style={styles.chipText}>Pickup available</Text>
              </View>
            )}
            {/* Warranty chip intentionally omitted — no warranty flag exists
                on any service/dealer response today. See report. */}
          </View>
        )}

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>
            Nearby garages · {garages.length} offer{garages.length !== 1 ? 's' : ''} this
          </Text>
          <TouchableOpacity onPress={() => setSortSheetVisible(true)} activeOpacity={0.7}>
            <Text style={styles.sortControlText}>
              Sort · {SORT_OPTIONS.find(o => o.key === sortKey)?.label}
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={color.buttonColor} style={styles.loader} />
        ) : sortedGarages.length === 0 ? (
          <Text style={styles.emptyText}>No garages currently offer this service nearby.</Text>
        ) : (
          sortedGarages.map((garage, index) => (
            <GarageCompareCard
              key={garage._id}
              garage={garage}
              isBestMatch={index === 0}
              onBookNow={() => goToGarageDetails(garage._id)}
              onViewDetails={() => goToGarageDetails(garage._id)}
            />
          ))
        )}
      </ScrollView>

      <Modal
        visible={sortSheetVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSortSheetVisible(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setSortSheetVisible(false)} />
        <View style={styles.sortSheet}>
          <Text style={styles.sortSheetTitle}>Sort by</Text>
          {SORT_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.key}
              style={styles.sortOptionRow}
              onPress={() => {
                setSortKey(opt.key);
                setSortSheetVisible(false);
              }}>
              <Text style={[styles.sortOptionText, sortKey === opt.key && styles.sortOptionTextActive]}>
                {opt.label}
              </Text>
              {sortKey === opt.key && <MaterialCommunityIcons name="check" size={18} color={color.buttonColor} />}
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
    </View>
  );
};

export default ServiceDetailScreen;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: color.baground},
  scrollContent: {paddingBottom: spacing.xxl},
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(254,212,40,0.1)',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipText: {fontSize: 11.5, fontWeight: '600', color: color.buttonColor},
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionHeaderTitle: {fontSize: 14, fontWeight: '700', color: color.textPrimary, flexShrink: 1, marginRight: 8},
  sortControlText: {fontSize: 12.5, fontWeight: '600', color: color.textMuted},
  loader: {marginTop: 32},
  emptyText: {textAlign: 'center', color: color.textMuted, marginTop: 24, paddingHorizontal: spacing.lg},
  modalBackdrop: {flex: 1, backgroundColor: 'rgba(0,0,0,0.4)'},
  sortSheet: {
    backgroundColor: color.cardSurface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sortSheetTitle: {fontSize: 15, fontWeight: '700', color: color.textPrimary, marginBottom: spacing.md},
  sortOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: color.borderSubtle,
  },
  sortOptionText: {fontSize: 14, color: color.textMuted, fontWeight: '600'},
  sortOptionTextActive: {color: color.buttonColor},
});

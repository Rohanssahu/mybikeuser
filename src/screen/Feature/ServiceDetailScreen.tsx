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

type SortKey = 'rating' | 'distance';

const SORT_OPTIONS: {key: SortKey; label: string}[] = [
  {key: 'distance', label: 'Distance'},
  {key: 'rating', label: 'Rating'},
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
  const {serviceId, bikeId, serviceName: routeServiceName, serviceImage: routeServiceImage} = (route.params ?? {}) as {
    serviceId: string;
    bikeId?: string;
    serviceName?: string;
    serviceImage?: string;
  };

  const [loading, setLoading] = useState(false);
  const [serviceName, setServiceName] = useState(routeServiceName ?? '');
  const [serviceImage, setServiceImage] = useState<string | undefined>(routeServiceImage);
  const [selectedBike, setSelectedBike] = useState<any>(null);
  const [durationLabel, setDurationLabel] = useState<string | undefined>();
  const [garages, setGarages] = useState<CompareGarage[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>('distance');
  const [filterOpenOnly, setFilterOpenOnly] = useState(false);
  const [filterPickup, setFilterPickup] = useState(false);
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
      setSelectedBike(bike);
      const variantId = bike?.variant_id;
      const cc = bike?.bike_cc?.toString().replace(/\D/g, '') || undefined;

      const matchedService = servicesRes?.success
        ? (servicesRes.data as any[]).find(s =>
            String(s.serviceId ?? s._id) === String(serviceId) ||
            String(s.base_service_id?._id ?? '') === String(serviceId),
          )
        : null;
      const resolvedServiceName = matchedService?.name ?? matchedService?.base_service_id?.name ?? routeServiceName ?? '';
      setServiceName(resolvedServiceName);
      setServiceImage(matchedService?.image ?? matchedService?.base_service_id?.image ?? routeServiceImage);

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
              ? (svcRes.data as any[]).find((s: any) =>
                  String(s.serviceId ?? s._id) === String(serviceId) ||
                  String(s.base_service_id?._id ?? '') === String(serviceId),
                )
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
  }, [serviceId, bikeId, routeServiceName, routeServiceImage]);

  // Refetch on focus/resume — a garage's open/closed status and price can
  // change at any time, same rule NearByShops/GarageDetails already follow.
  useRefreshOnResume(fetchData);

  const sortedGarages = useMemo(() => {
    const list = garages.filter(garage => {
      if (filterOpenOnly && garage.isOpen !== true) return false;
      if (filterPickup && !garage.pickupAndDrop) return false;
      return true;
    });
    list.sort((a, b) => {
      if (sortKey === 'rating') {
        return (b.averageRating ?? 0) - (a.averageRating ?? 0);
      }
      if (a.distanceKm == null && b.distanceKm == null) return 0;
      if (a.distanceKm == null) return 1;
      if (b.distanceKm == null) return -1;
      return a.distanceKm - b.distanceKm;
    });
    return list;
  }, [garages, sortKey, filterOpenOnly, filterPickup]);

  const activeFilterCount = Number(filterOpenOnly) + Number(filterPickup);

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
    (navigation as any).navigate(ScreenNameEnum.GARAGE_DETAILS, {
      bike: selectedBike,
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
            {sortedGarages.length} nearby garage{sortedGarages.length !== 1 ? 's' : ''}
          </Text>
          <TouchableOpacity style={styles.filterButton} onPress={() => setSortSheetVisible(true)} activeOpacity={0.75}>
            <MaterialCommunityIcons name="tune-variant" size={17} color={color.buttonColor} />
            <Text style={styles.filterButtonText}>Filter</Text>
            {activeFilterCount > 0 && (
              <View style={styles.filterCountBadge}>
                <Text style={styles.filterCountText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={color.buttonColor} style={styles.loader} />
        ) : sortedGarages.length === 0 ? (
          <Text style={styles.emptyText}>
            {activeFilterCount > 0 ? 'No garages match the selected filters.' : 'No garages currently offer this service nearby.'}
          </Text>
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
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sortSheetTitle}>Sort & filter</Text>
              <Text style={styles.sortSheetSubtitle}>Find the right nearby garage</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={() => setSortSheetVisible(false)}>
              <MaterialCommunityIcons name="close" size={20} color={color.textPrimary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.optionSectionTitle}>SORT BY</Text>
          {SORT_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.key}
              style={styles.sortOptionRow}
              onPress={() => setSortKey(opt.key)}>
              <Text style={[styles.sortOptionText, sortKey === opt.key && styles.sortOptionTextActive]}>
                {opt.key === 'distance' ? 'Nearest first' : 'Highest rated'}
              </Text>
              <MaterialCommunityIcons
                name={sortKey === opt.key ? 'radiobox-marked' : 'radiobox-blank'}
                size={19}
                color={sortKey === opt.key ? color.buttonColor : color.textMuted}
              />
            </TouchableOpacity>
          ))}

          <Text style={styles.optionSectionTitle}>FILTER BY</Text>
          <TouchableOpacity style={styles.filterOptionRow} onPress={() => setFilterOpenOnly(value => !value)}>
            <View style={styles.filterOptionLabel}>
              <MaterialCommunityIcons name="store-check-outline" size={19} color={color.success} />
              <Text style={styles.sortOptionText}>Open now</Text>
            </View>
            <MaterialCommunityIcons name={filterOpenOnly ? 'checkbox-marked' : 'checkbox-blank-outline'} size={21} color={filterOpenOnly ? color.buttonColor : color.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterOptionRow} onPress={() => setFilterPickup(value => !value)}>
            <View style={styles.filterOptionLabel}>
              <MaterialCommunityIcons name="truck-fast-outline" size={19} color={color.buttonColor} />
              <Text style={styles.sortOptionText}>Pickup & drop available</Text>
            </View>
            <MaterialCommunityIcons name={filterPickup ? 'checkbox-marked' : 'checkbox-blank-outline'} size={21} color={filterPickup ? color.buttonColor : color.textMuted} />
          </TouchableOpacity>

          <View style={styles.sheetActions}>
            <TouchableOpacity
              style={styles.clearFilterButton}
              onPress={() => {
                setSortKey('distance');
                setFilterOpenOnly(false);
                setFilterPickup(false);
              }}>
              <Text style={styles.clearFilterText}>Clear all</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyFilterButton} onPress={() => setSortSheetVisible(false)}>
              <Text style={styles.applyFilterText}>Show {sortedGarages.length} garage{sortedGarages.length !== 1 ? 's' : ''}</Text>
            </TouchableOpacity>
          </View>
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
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(254,212,40,0.4)',
    backgroundColor: 'rgba(254,212,40,0.08)',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  filterButtonText: {fontSize: 12, fontWeight: '700', color: color.buttonColor},
  filterCountBadge: {minWidth: 17, height: 17, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: color.buttonColor},
  filterCountText: {fontSize: 9.5, fontWeight: '800', color: color.baground},
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
  sheetHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg},
  sortSheetTitle: {fontSize: 18, fontWeight: '800', color: color.textPrimary},
  sortSheetSubtitle: {fontSize: 11.5, color: color.textMuted, marginTop: 3},
  closeButton: {width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.07)', alignItems: 'center', justifyContent: 'center'},
  optionSectionTitle: {fontSize: 10, fontWeight: '800', letterSpacing: 0.8, color: color.textMuted, marginTop: 8, marginBottom: 4},
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
  filterOptionRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 13, borderTopWidth: 1, borderTopColor: color.borderSubtle},
  filterOptionLabel: {flexDirection: 'row', alignItems: 'center', gap: 10},
  sheetActions: {flexDirection: 'row', gap: 10, marginTop: spacing.lg},
  clearFilterButton: {flex: 0.8, borderWidth: 1, borderColor: color.borderSubtle, borderRadius: radius.sm, alignItems: 'center', paddingVertical: 12},
  clearFilterText: {fontSize: 13, fontWeight: '700', color: color.textPrimary},
  applyFilterButton: {flex: 1.5, backgroundColor: color.buttonColor, borderRadius: radius.sm, alignItems: 'center', paddingVertical: 12},
  applyFilterText: {fontSize: 13, fontWeight: '800', color: color.baground},
});

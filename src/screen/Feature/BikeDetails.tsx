import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {color} from '../../constant';
import CustomHeader from '../../component/CustomHeaderProps';
import Icon from '../../component/Icon';
import {icon} from '../../component/Image';
import Stepper from '../../component/bikeDetails/Stepper';
import SelectionField from '../../component/bikeDetails/SelectionField';
import SearchableSheet from '../../component/bikeDetails/SearchableSheet';
import FloatingLabelInput from '../../component/bikeDetails/FloatingLabelInput';
import {successToast, errorToast} from '../../configs/customToast';
import {
  add_Bikes,
  get_BikeCompany,
  get_BikeModel,
  get_BikeVariant,
} from '../../redux/Api/apiRequests';
import {SafeAreaView} from 'react-native-safe-area-context';

type ActiveSheet = 'brand' | 'model' | 'variant' | null;

const BikeDetails: React.FC<{navigation: any}> = ({navigation}) => {
  const [selectedBikeId, setSelectedBikeId] = useState<string | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [plateNumber, setPlateNumber] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [bikeCompanies, setBikeCompanies] = useState<any[]>([]);
  const [bikeModels, setBikeModels] = useState<any[]>([]);
  const [bikeVariants, setBikeVariants] = useState<any[]>([]);
  const [bikeCC, setBikeCC] = useState('');
  const [variantId, setVariantId] = useState('');
  const [variantName, setVariantName] = useState<string | null>(null);

  // UI-only state: display labels, loading/saving flags, and which sheet is open.
  const [selectedBrandName, setSelectedBrandName] = useState<string | null>(null);
  const [selectedModelName, setSelectedModelName] = useState<string | null>(null);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>(null);
  const plateInputRef = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);

  const scrollToPlateInput = () => {
    // Android resizes the window on keyboard open (adjustResize) but never
    // auto-scrolls the ScrollView to reveal the now-hidden field, unlike iOS.
    setTimeout(() => scrollRef.current?.scrollToEnd({animated: true}), 120);
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoadingCompanies(true);
    try {
      const res = await get_BikeCompany();
      if (res?.data?.length > 0) {
        setBikeCompanies(res.data);
      }
    } finally {
      setLoadingCompanies(false);
    }
  };

  const isValidPlate = (plate: string) =>
    /^[A-Z]{2}[ -]?\d{1,2}[ -]?[A-Z]{1,2}[ -]?\d{1,4}$/i.test(plate.trim());

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!selectedBikeId) {
      newErrors.company = 'Bike brand is required';
    }
    if (!selectedModelId) {
      newErrors.model = 'Model is required';
    }
    if (!variantId) {
      newErrors.variant = 'Variant is required';
    }
    if (!plateNumber) {
      newErrors.plate = 'Plate number is required';
    } else if (!isValidPlate(plateNumber)) {
      newErrors.plate = 'Enter valid plate (e.g. MH12AB1234)';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    setSaving(true);
    try {
      const res = await add_Bikes(plateNumber, variantId);
      if (res?.success) {
        successToast('Bike added successfully');
        navigation.goBack();
      } else {
        errorToast(res?.message || 'Could not save your bike. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const fetchModels = async (id: string) => {
    setLoadingModels(true);
    try {
      const res = await get_BikeModel(id);
      if (res?.success) {
        setBikeModels(res.data);
      } else {
        setBikeModels([]);
      }
    } finally {
      setLoadingModels(false);
    }
  };

  const fetchVariants = async (id: string) => {
    setLoadingVariants(true);
    try {
      const res = await get_BikeVariant(id);
      if (res?.success) {
        setBikeVariants(
          res.data.map((item: any) => ({
            ...item,
            variant_display: `${item.variant_name} (${item.engine_cc} CC)`,
          })),
        );
      } else {
        setBikeVariants([]);
      }
    } finally {
      setLoadingVariants(false);
    }
  };

  const onSelectBrand = (item: any) => {
    setSelectedBikeId(item?._id);
    setSelectedBrandName(item?.name ?? null);
    setSelectedModelId(null);
    setSelectedModelName(null);
    setVariantId('');
    setVariantName(null);
    setBikeCC('');
    setBikeModels([]);
    setBikeVariants([]);
    setErrors(prev => {
      const rest = {...prev};
      delete rest.company;
      return rest;
    });
    setActiveSheet(null);
    fetchModels(item._id);
    setTimeout(() => setActiveSheet('model'), 360);
  };

  const onSelectModel = (item: any) => {
    setSelectedModelId(item?._id);
    setSelectedModelName(item?.model_name ?? null);
    setVariantId('');
    setVariantName(null);
    setBikeCC('');
    setBikeVariants([]);
    setErrors(prev => {
      const rest = {...prev};
      delete rest.model;
      return rest;
    });
    setActiveSheet(null);
    fetchVariants(item._id);
    setTimeout(() => setActiveSheet('variant'), 360);
  };

  const onSelectVariant = (item: any) => {
    setBikeCC(item?.engine_cc?.toString() || '');
    setVariantName(item?.variant_name?.toString() || '');
    setVariantId(item?._id?.toString() || '');
    setErrors(prev => {
      const rest = {...prev};
      delete rest.variant;
      return rest;
    });
    setActiveSheet(null);
    setTimeout(() => plateInputRef.current?.focus(), 360);
    scrollToPlateInput();
  };

  const onChangePlate = (text: string) => {
    const upper = text.toUpperCase();
    setPlateNumber(upper);
    if (upper && !isValidPlate(upper)) {
      setErrors(prev => ({
        ...prev,
        plate: 'Enter valid plate (e.g. MH12AB1234)',
      }));
    } else {
      setErrors(prev => {
        const rest = {...prev};
        delete rest.plate;
        return rest;
      });
    }
  };

  const getVariantSubtitle = (item: any) => {
    const parts: string[] = [];
    if (item?.engine_cc) {parts.push(`${item.engine_cc} CC`);}
    const fuel = item?.fuel_type || item?.fuelType || item?.fuel;
    if (fuel) {parts.push(String(fuel));}
    return parts.length ? parts.join(' • ') : null;
  };

  const renderLeading = (value?: string | null) => (
    <View
      style={[
        styles.leadingCircle,
        value ? styles.leadingCircleFilled : styles.leadingCircleEmpty,
      ]}>
      {value ? (
        <Text style={styles.leadingLetter}>{value.charAt(0).toUpperCase()}</Text>
      ) : (
        <Icon source={icon.bikep} size={18} tintColor="#7C86B8" />
      )}
    </View>
  );

  const steps = [
    {label: 'Brand', done: !!selectedBikeId},
    {label: 'Model', done: !!selectedModelId},
    {label: 'Variant', done: !!variantId},
    {label: 'Number', done: isValidPlate(plateNumber)},
  ];

  const canSave = !saving;

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={color.baground} barStyle="light-content" />
      <CustomHeader
        navigation={navigation}
        title="Add Your Bike"
        subtitle="Let's register your motorcycle."
        onSkipPress={() => {}}
        showSkip={false}
        showHome
      />

      <SafeAreaView style={{flex: 1}} edges={['bottom', 'left', 'right']}>
        <KeyboardAvoidingView
          style={{flex: 1}}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}>
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            <Stepper steps={steps} />

            <View style={styles.form}>
              <SelectionField
                label="Bike Brand"
                placeholder="Select your bike brand"
                value={selectedBrandName}
                error={errors.company}
                onPress={() => setActiveSheet('brand')}
                leading={renderLeading(selectedBrandName)}
              />

              <SelectionField
                label="Bike Model"
                placeholder={
                  selectedBikeId ? 'Select model' : 'Select a brand first'
                }
                value={selectedModelName}
                error={errors.model}
                disabled={!selectedBikeId}
                onPress={() => setActiveSheet('model')}
                leading={renderLeading(selectedModelName)}
              />

              <SelectionField
                label="Variant"
                placeholder={
                  selectedModelId ? 'Select variant' : 'Select a model first'
                }
                value={variantName}
                subValue={bikeCC ? `${bikeCC} CC` : null}
                error={errors.variant}
                disabled={!selectedModelId}
                onPress={() => setActiveSheet('variant')}
                leading={renderLeading(variantName)}
              />

              <FloatingLabelInput
                ref={plateInputRef}
                label="Registration Number"
                value={plateNumber}
                onChangeText={onChangePlate}
                error={errors.plate}
                helperText="Format: MH12AB1234"
                autoCapitalize="characters"
                maxLength={11}
                returnKeyType="done"
                onFocus={scrollToPlateInput}
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={canSave ? handleSubmit : undefined}
              disabled={!canSave}
              style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}>
              {saving ? (
                <ActivityIndicator color="#111827" />
              ) : (
                <Text style={styles.saveButtonText}>Save Bike</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <SearchableSheet
        visible={activeSheet === 'brand'}
        title="Select Bike Brand"
        onClose={() => setActiveSheet(null)}
        data={bikeCompanies}
        labelField="name"
        keyField="_id"
        onSelect={onSelectBrand}
        loading={loadingCompanies}
        emptyTitle="No brands available"
        emptyMessage="We couldn't load bike brands right now."
        onRetry={fetchCompanies}
      />

      <SearchableSheet
        visible={activeSheet === 'model'}
        title="Select Bike Model"
        onClose={() => setActiveSheet(null)}
        data={bikeModels}
        labelField="model_name"
        keyField="_id"
        onSelect={onSelectModel}
        loading={loadingModels}
        emptyTitle="No models available"
        emptyMessage={`No models found for ${selectedBrandName || 'this brand'}.`}
        onRetry={selectedBikeId ? () => fetchModels(selectedBikeId) : undefined}
      />

      <SearchableSheet
        visible={activeSheet === 'variant'}
        title="Select Variant"
        onClose={() => setActiveSheet(null)}
        data={bikeVariants}
        labelField="variant_display"
        searchFields={['variant_display', 'variant_name']}
        keyField="_id"
        getSubtitle={getVariantSubtitle}
        onSelect={onSelectVariant}
        loading={loadingVariants}
        emptyTitle="No variants available"
        emptyMessage={`No variants found for ${selectedModelName || 'this model'}.`}
        onRetry={selectedModelId ? () => fetchVariants(selectedModelId) : undefined}
      />
    </View>
  );
};

export default BikeDetails;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: color.baground},
  scroll: {paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40},
  form: {},
  leadingCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leadingCircleFilled: {backgroundColor: 'rgba(254,212,40,0.14)'},
  leadingCircleEmpty: {backgroundColor: 'rgba(255,255,255,0.05)'},
  leadingLetter: {color: color.buttonColor, fontWeight: '700', fontSize: 15},
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 8 : 16,
  },
  saveButton: {
    backgroundColor: color.buttonColor,
    borderRadius: 18,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: color.buttonColor,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 6,
  },
  saveButtonDisabled: {
    backgroundColor: 'rgba(254,212,40,0.5)',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {color: '#111827', fontSize: 17, fontWeight: '700'},
});

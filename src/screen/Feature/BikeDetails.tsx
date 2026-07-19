import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import {color} from '../../constant';
import CustomTextInput from '../../component/TextInput';
import CustomDropdown from '../../component/CustomDropdown';
import CustomButton from '../../component/CustomButton';
import CustomHeader from '../../component/CustomHeaderProps';
import ScreenNameEnum from '../../routes/screenName.enum';
import {
  add_Bikes,
  get_BikeCompany,
  get_BikeModel,
  get_BikeVariant,
} from '../../redux/Api/apiRequests';

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

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    const res = await get_BikeCompany();
    if (res?.data?.length > 0) {setBikeCompanies(res.data);}
  };

  const isValidPlate = (plate: string) =>
    /^[A-Z]{2}[ -]?\d{1,2}[ -]?[A-Z]{1,2}[ -]?\d{1,4}$/i.test(plate.trim());

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!selectedBikeId) {newErrors.company = 'Bike brand is required';}
    if (!selectedModelId) {newErrors.model = 'Model is required';}
    if (!variantId) {newErrors.variant = 'Variant is required';}
    if (!plateNumber) {
      newErrors.plate = 'Plate number is required';
    } else if (!isValidPlate(plateNumber)) {
      newErrors.plate = 'Enter valid plate (e.g. MH12AB1234)';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {return;}
    const res = await add_Bikes(plateNumber, variantId);
    if (res?.success) {navigation.goBack();}
  };

  const fetchModels = async (id: string) => {
    const res = await get_BikeModel(id);
    if (res?.success) {setBikeModels(res.data);}
    else {setBikeModels([]);}
  };

  const fetchVariants = async (id: string) => {
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
  };

  const steps = [
    {label: '1', done: !!selectedBikeId},
    {label: '2', done: !!selectedModelId},
    {label: '3', done: !!variantId},
    {label: '4', done: isValidPlate(plateNumber)},
  ];

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={color.baground} barStyle="light-content" />
      <CustomHeader
        navigation={navigation}
        title="Add Your Bike"
        onSkipPress={() => {}}
        showSkip={false}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* Step indicator */}
        <View style={styles.stepRow}>
          {steps.map((step, i) => (
            <React.Fragment key={i}>
              <View style={[styles.stepDot, step.done && styles.stepDotDone]}>
                <Text style={[styles.stepLabel, step.done && styles.stepLabelDone]}>
                  {step.label}
                </Text>
              </View>
              {i < steps.length - 1 && (
                <View style={[styles.stepLine, steps[i + 1].done && styles.stepLineDone]} />
              )}
            </React.Fragment>
          ))}
        </View>

        <View style={styles.form}>
          {/* Brand */}
          <Text style={styles.fieldLabel}>Bike Brand</Text>
          <CustomDropdown
            data={bikeCompanies}
            onSelect={(value: any) => {
              setSelectedBikeId(value?._id);
              setSelectedModelId(null);
              setVariantId('');
              setBikeModels([]);
              setBikeVariants([]);
              fetchModels(value._id);
            }}
            placeholder="Select brand"
            label="name"
            value="_id"
          />
          {errors.company ? <Text style={styles.error}>{errors.company}</Text> : null}

          {/* Model */}
          <Text style={[styles.fieldLabel, styles.fieldLabelGap]}>Model</Text>
          <CustomDropdown
            data={bikeModels}
            onSelect={(value: any) => {
              setSelectedModelId(value?._id);
              setVariantId('');
              setBikeVariants([]);
              fetchVariants(value._id);
            }}
            placeholder="Select model"
            label="model_name"
            value="_id"
          />
          {errors.model ? <Text style={styles.error}>{errors.model}</Text> : null}

          {/* Variant */}
          <Text style={[styles.fieldLabel, styles.fieldLabelGap]}>Variant</Text>
          <CustomDropdown
            data={bikeVariants}
            onSelect={(value: any) => {
              setBikeCC(value?.engine_cc?.toString() || '');
              setVariantName(value?.variant_name?.toString() || '');
              setVariantId(value?._id?.toString() || '');
            }}
            placeholder="Select variant"
            label="variant_display"
            value="_id"
          />
          {errors.variant ? <Text style={styles.error}>{errors.variant}</Text> : null}

          {/* Plate Number */}
          <Text style={[styles.fieldLabel, styles.fieldLabelGap]}>
            Registration Number
          </Text>
          <CustomTextInput
            editable
            placeholder="e.g. MH12AB1234"
            onChangeText={text => {
              const upper = text.toUpperCase();
              setPlateNumber(upper);
              if (upper && !isValidPlate(upper)) {
                setErrors(prev => ({...prev, plate: 'Enter valid plate (e.g. MH12AB1234)'}));
              } else {
                setErrors(prev => {const {plate: _, ...rest} = prev; return rest;});
              }
            }}
            value={plateNumber}
            maxLength={11}
            inputStyle={errors.plate ? styles.inputErrorPlate : styles.plateInput}
          />
          {errors.plate ? <Text style={styles.error}>{errors.plate}</Text> : null}

          {bikeCC ? (
            <View style={styles.ccBadge}>
              <Text style={styles.ccText}>Engine: {bikeCC} CC</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <CustomButton title="Save Bike" onPress={handleSubmit} />
      </View>
    </View>
  );
};

export default BikeDetails;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: color.baground},
  scroll: {paddingHorizontal: 24, paddingBottom: 100},
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 28,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotDone: {
    backgroundColor: color.buttonColor,
    borderColor: color.buttonColor,
  },
  stepLabel: {fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.5)'},
  stepLabelDone: {color: '#000'},
  stepLine: {flex: 1, height: 2, backgroundColor: 'rgba(255,255,255,0.15)'},
  stepLineDone: {backgroundColor: color.buttonColor},
  form: {},
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#B0B8D0',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  fieldLabelGap: {marginTop: 18},
  plateInput: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    letterSpacing: 2,
  },
  inputError: {borderColor: '#EF4444'},
  inputErrorPlate: {
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 12,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    letterSpacing: 2,
  },
  error: {color: '#EF4444', fontSize: 12, marginTop: 5},
  ccBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(254,212,40,0.15)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(254,212,40,0.3)',
  },
  ccText: {color: color.buttonColor, fontSize: 13, fontWeight: '600'},
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
  },
});

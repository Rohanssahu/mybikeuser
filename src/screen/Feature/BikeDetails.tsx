import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {color} from '../../constant';
import CustomTextInput from '../../component/TextInput';
import {hp} from '../../component/utils/Constant';
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
  // Form states
  const [selectedBike, setSelectedBike] = useState<string | null>(null);
  const [modelName, setModelName] = useState<string | null>(null);
  const [variant, setVariant] = useState<string | null>(null);
  const [VariantId, setVariantId] = useState<string | null>('');
  const [plateNumber, setPlateNumber] = useState<string>('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [bikeCompanies, setBikeCompanies] = useState<string[]>([]);
  const [bikeModels, setBikeModels] = useState<string[]>([]);
  const [bikeVariants, setBikeVariants] = useState<string[]>([]);
  const [bikeCC, setBikeCC] = useState<string | ''>('Bike CC');

  console.log(bikeVariants);

  // Fetch bike companies on component mount
  useEffect(() => {
    BikeCompany();
  }, []);

  const BikeCompany = async () => {
    const res = await get_BikeCompany();
    if (res?.data?.length > 0) {
      setBikeCompanies(res?.data);
    }
  };

  // --- Add regex validator for bike plate ---
  const isValidBikePlate = (plate: string) => {
    const re = /^[A-Z]{2}[ -]?\d{1,2}[ -]?[A-Z]{1,2}[ -]?\d{1,4}$/i;
    return re.test(plate.trim());
  };

  const validateForm = () => {
    let newErrors: {[key: string]: string} = {};

    if (!selectedBike) newErrors.selectedBike = 'Bike company is required';
    if (!modelName) newErrors.modelName = 'Model name is required';
    if (!variant) newErrors.variant = 'Variant is required';
    if (!plateNumber) {
      newErrors.plateNumber = 'Plate number is required';
    } else if (!isValidBikePlate(plateNumber)) {
      newErrors.plateNumber = 'Enter a valid plate number (e.g. MH12AB1234)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission
  const handleSubmit = async () => {
    if (validateForm()) {
      const res = await add_Bikes(
        selectedBike,
        modelName,
        bikeCC,
        plateNumber,
        VariantId,
      );
      if (res?.success) {
        navigation.goBack();
      }
    }
  };

  // Fetch model list based on selected bike company
  const get_Model_list = async (id: string) => {
    const state = await get_BikeModel(id);
    if (state.success) {
      setBikeModels(state.data);
    } else {
      setBikeModels([]);
    }
  };

  // Fetch variant list based on selected model
  const get_Variant_list = async (id: string) => {
    const state = await get_BikeVariant(id);
    if (state.success) {
      const modifiedData = state.data.map((item: any) => ({
        ...item,
        variant_display: `${item.variant_name} (${item.engine_cc} CC)`, // 👈 naya field
      }));
      setBikeVariants(modifiedData);
    } else {
      setBikeVariants([]);
    }
  };

  return (
    <View style={styles.container}>
      <CustomHeader
        navigation={navigation}
        title="Bike Details"
        onSkipPress={() => {}}
        showSkip={false}
      />

      <View style={styles.formContainer}>
        {/* Bike Company */}
        <CustomDropdown
          data={bikeCompanies}
          onSelect={value => {
            setSelectedBike(value?.name);
            setModelName(null); // Reset model when company changes
            setVariant(null); // Reset variant when company changes
            setBikeModels([]); // Clear previous models
            setBikeVariants([]); // Clear previous variants
            get_Model_list(value._id);
          }}
          placeholder="Bike Company"
          label="name"
          value="_id"
        />
        {errors.selectedBike && (
          <Text style={styles.errorText}>{errors.selectedBike}</Text>
        )}

        {/* Model Name */}
        <CustomDropdown
          data={bikeModels}
          onSelect={value => {
            setModelName(value?.model_name);
            setVariant(null); // Reset variant when model changes
            setBikeVariants([]); // Clear previous variants
            get_Variant_list(value._id);
          }}
          placeholder="Model Name"
          label="model_name"
          value="_id"
          disabled={!selectedBike} // Disable if no company is selected
        />
        {errors.modelName && (
          <Text style={styles.errorText}>{errors.modelName}</Text>
        )}

        {/* Variant */}
        <CustomDropdown
          data={bikeVariants}
          onSelect={value => {
            setBikeCC(value?.engine_cc?.toString());
            setVariant(value?.variant_name?.toString());
            setVariantId(value?._id?.toString());
          }}
          placeholder="Variant"
          label="variant_display" // 👈 ab modified naam show hoga
          value="_id"
          disabled={!modelName}
        />

        {errors.variant && (
          <Text style={styles.errorText}>{errors.variant}</Text>
        )}
        <View style={{height: 10}} />
        <CustomTextInput
          placeholder="Plate Number"
          onChangeText={text => {
            const upperText = text.toUpperCase();
            setPlateNumber(upperText);

            // Live validation (show error as user types)
            if (!isValidBikePlate(upperText)) {
              setErrors(prev => ({
                ...prev,
                plateNumber: 'Enter a valid plate number (e.g. MH12AB1234)',
              }));
            } else {
              setErrors(prev => {
                const {plateNumber, ...rest} = prev;
                return rest; // remove plate error if valid
              });
            }
          }}
          value={plateNumber}
          maxLength={10}
          inputStyle={[styles.input, errors.plateNumber && styles.inputError]}
        />
        {errors.plateNumber && (
          <Text style={styles.errorText}>{errors.plateNumber}</Text>
        )}
      </View>

      {/* Submit Button */}
      <View style={styles.submitContainer}>
        <CustomButton title="Save Bike" onPress={handleSubmit} />
      </View>
    </View>
  );
};

export default BikeDetails;

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.baground,
  },
  formContainer: {
    paddingHorizontal: 25,
    marginTop: hp(4),
  },
  input: {
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 15,
    padding: 10,
    color: '#fff',
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
  submitContainer: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    paddingHorizontal: 15,
  },
});

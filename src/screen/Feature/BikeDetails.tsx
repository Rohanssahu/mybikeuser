import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { color } from '../../constant';
import CustomTextInput from '../../component/TextInput';
import { hp } from '../../component/utils/Constant';
import CustomDropdown from '../../component/CustomDropdown';
import CustomButton from '../../component/CustomButton';
import CustomHeader from '../../component/CustomHeaderProps';
import ScreenNameEnum from '../../routes/screenName.enum';
import { add_Bikes, get_BikeCompany, get_BikeModel, get_BikeVariant } from '../../redux/Api/apiRequests';

const BikeDetails: React.FC<{ navigation: any }> = ({ navigation }) => {
    // Form states
    const [selectedBike, setSelectedBike] = useState<string | null>(null);
    const [modelName, setModelName] = useState<string | null>(null);
    const [variant, setVariant] = useState<string | null>(null);
    const [VariantCC, setVariantCC] = useState<string | null>('');
    const [plateNumber, setPlateNumber] = useState<string>('');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [bikeCompanies, setBikeCompanies] = useState<string[]>([]);
    const [bikeModels, setBikeModels] = useState<string[]>([]);
    const [bikeVariants, setBikeVariants] = useState<string[]>([]);

    // Fetch bike companies on component mount
    useEffect(() => {
        BikeCompany();
    }, [])

    const BikeCompany = async () => {
        const res = await get_BikeCompany();
        if (res?.data?.length > 0) {
            setBikeCompanies(res?.data);
        }
    }

    const validateForm = () => {
        let newErrors: { [key: string]: string } = {};

        if (!selectedBike) newErrors.selectedBike = 'Bike company is required';
        if (!modelName) newErrors.modelName = 'Model name is required';
        if (!variant) newErrors.variant = 'Variant is required';
        if (!plateNumber) newErrors.plateNumber = 'Plate number is required';

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    // Form submission
    const handleSubmit =async () => {
    

        if(validateForm()){
        const res = await add_Bikes(selectedBike, modelName, variant, plateNumber);
        console.log('=========add_Bikes===========================');
        console.log(res);
        if(res?.success){
            navigation.goBack()
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
    }

    // Fetch variant list based on selected model
    const get_Variant_list = async (id: string) => {
        const state = await get_BikeVariant(id);
        if (state.success) {
            setBikeVariants(state.data);
        } else {
            setBikeVariants([]);
        }
    }

    return (
        <View style={styles.container}>
            <CustomHeader navigation={navigation} title="Bike Details" onSkipPress={() => { }} showSkip={false} />

            <View style={styles.formContainer}>
                {/* Bike Company */}
                <CustomDropdown
                    data={bikeCompanies}
                    onSelect={(value) => {
                        setSelectedBike(value?.name);
                        setModelName(null);  // Reset model when company changes
                        setVariant(null);  // Reset variant when company changes
                        setBikeModels([]); // Clear previous models
                        setBikeVariants([]); // Clear previous variants
                        get_Model_list(value._id);
                    }}
                    placeholder="Bike Company"
                    label="name"
                    value="_id"
                />
                {errors.selectedBike && <Text style={styles.errorText}>{errors.selectedBike}</Text>}

                {/* Model Name */}
                <CustomDropdown
                    data={bikeModels}
                    onSelect={(value) => {
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
                {errors.modelName && <Text style={styles.errorText}>{errors.modelName}</Text>}

                {/* Variant */}
                <CustomDropdown
                    data={bikeVariants}
                    onSelect={(value) => {
                        setVariant(value?.variant_name);
                        setVariantCC(value?.engine_cc);
                    }}
                    placeholder="Variant"
                    label="variant_name"
                    value="_id"
                    disabled={!modelName} // Disable if no model is selected
                />
                {errors.variant && <Text style={styles.errorText}>{errors.variant}</Text>}

                {/* Plate Number */}
            
                <View style={{ height: 10 }} />
                <CustomTextInput
                    placeholder="Plate Number"
                    onChangeText={(text) => setPlateNumber(text)}
                    value={plateNumber?.toLocaleUpperCase()}
                    inputStyle={[styles.input, errors.plateNumber && styles.inputError,]}
                />
                {errors.plateNumber && <Text style={styles.errorText}>{errors.plateNumber}</Text>}
            </View>

            {/* Submit Button */}
            <View style={styles.submitContainer}>
                <CustomButton title="Submit" onPress={handleSubmit} />
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
        marginTop: hp(8),
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

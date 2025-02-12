
    import React, { useState } from 'react';
    import { View, Text, StyleSheet } from 'react-native';
    import { color } from '../../constant';
    
    import CustomTextInput from '../../component/TextInput';
    import { hp } from '../../component/utils/Constant';
    import CustomDropdown from '../../component/CustomDropdown';
    import CustomButton from '../../component/CustomButton';
    import CustomHeader from '../../component/CustomHeaderProps';
    import ScreenNameEnum from '../../routes/screenName.enum';
    
    const Vehical: React.FC<{ navigation: any }> = ({ navigation }) => {
        // Form states
        const [selectedBike, setSelectedBike] = useState<string | null>(null);
        const [modelName, setModelName] = useState<string | null>(null);
        const [variant, setVariant] = useState<string | null>(null);
        const [plateNumber, setPlateNumber] = useState<string>('');
    
        // Error states
        const [errors, setErrors] = useState<{ [key: string]: string }>({});
    
        // Validation function
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
        const handleSubmit = () => {
            navigation.navigate(ScreenNameEnum.NEARBY_SHOPS)
            // if (validateForm()) {
            //     console.log('Form submitted successfully!');
              
            // }
        };
    
        return (
            <View style={styles.container}>
                <CustomHeader navigation={navigation} title="Vehical Details" onSkipPress={() => { }} showSkip={false} />
    
                <View style={styles.formContainer}>
                    {/* Bike Company */}
                    <CustomDropdown 
                        data={bikeCompanies} 
                        onSelect={(value) => setSelectedBike(value)} 
                        placeholder="Bike Company"
                    />
                    {errors.selectedBike && <Text style={styles.errorText}>{errors.selectedBike}</Text>}
    
                    {/* Model Name */}
                    <CustomDropdown 
                        data={Array.isArray(bikeModels[selectedBike]) ? bikeModels[selectedBike] : []} 
                        onSelect={(value) => setModelName(value)} 
                        placeholder="Model Name"
                    />
                    {errors.modelName && <Text style={styles.errorText}>{errors.modelName}</Text>}
    
                    {/* Variant */}
                    <CustomDropdown 
                        data={Array.isArray(bikeVariants[modelName]) ? bikeVariants[modelName] : []} 
                        onSelect={(value) => setVariant(value)} 
                        placeholder="Variant"
                    />
                    {errors.variant && <Text style={styles.errorText}>{errors.variant}</Text>}
    
                    {/* Plate Number */}
                    <CustomTextInput
                        placeholder="Plate Number"
                        onChangeText={(text) => setPlateNumber(text)}
                        value={plateNumber}
                        inputStyle={[styles.input, errors.plateNumber && styles.inputError]}
                    />
                    {errors.plateNumber && <Text style={styles.errorText}>{errors.plateNumber}</Text>}
                </View>
    
                {/* Submit Button */}
                <View style={styles.submitContainer}>
                    <CustomButton title="Update" onPress={handleSubmit} />
                </View>
            </View>
        );
    };
    
    export default Vehical;
    
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
            color: '#000',
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
    
    // Bike Companies Data
    // Bike Companies Data
    const bikeCompanies = [
        { label: 'Yamaha', value: 'yamaha' },
        { label: 'Honda', value: 'honda' },
        { label: 'Suzuki', value: 'suzuki' },
        { label: 'Kawasaki', value: 'kawasaki' },
        { label: 'Ducati', value: 'ducati' },
    ];
    
    // Bike Models Data
    const bikeModels: { [key: string]: { label: string; value: string }[] } = {
        yamaha: [
            { label: 'YZF R1', value: 'yzf_r1' },
            { label: 'MT-15', value: 'mt_15' },
            { label: 'FZ V3', value: 'fz_v3' },
        ],
        honda: [
            { label: 'CBR 650R', value: 'cbr_650r' },
            { label: 'Hornet 2.0', value: 'hornet_2_0' },
            { label: 'X-Blade', value: 'x_blade' },
        ],
        suzuki: [
            { label: 'GSX S750', value: 'gsx_s750' },
            { label: 'Hayabusa', value: 'hayabusa' },
            { label: 'Gixxer SF', value: 'gixxer_sf' },
        ],
        kawasaki: [
            { label: 'Ninja 300', value: 'ninja_300' },
            { label: 'Z900', value: 'z900' },
            { label: 'Versys 650', value: 'versys_650' },
        ],
        ducati: [
            { label: 'Panigale V4', value: 'panigale_v4' },
            { label: 'Monster 821', value: 'monster_821' },
            { label: 'Multistrada 950', value: 'multistrada_950' },
        ],
    };
    
    // Bike Variants Data
    const bikeVariants: { [key: string]: { label: string; value: string }[] } = {
        yzf_r1: [
            { label: 'Standard', value: 'standard' },
            { label: 'M Variant', value: 'm_variant' },
        ],
        mt_15: [
            { label: 'Standard', value: 'standard' },
            { label: 'Dark Edition', value: 'dark_edition' },
        ],
        fz_v3: [
            { label: 'Disc Brake', value: 'disc_brake' },
            { label: 'Dual ABS', value: 'dual_abs' },
        ],
        cbr_650r: [
            { label: 'ABS', value: 'abs' },
            { label: 'Standard', value: 'standard' },
        ],
        hornet_2_0: [
            { label: 'Repsol Edition', value: 'repsol_edition' },
            { label: 'Standard', value: 'standard' },
        ],
        x_blade: [
            { label: 'ABS', value: 'abs' },
            { label: 'Drum Brake', value: 'drum_brake' },
        ],
        gsx_s750: [
            { label: 'Standard', value: 'standard' },
            { label: 'Z Variant', value: 'z_variant' },
        ],
        hayabusa: [
            { label: 'Standard', value: 'standard' },
            { label: 'Limited Edition', value: 'limited_edition' },
        ],
        gixxer_sf: [
            { label: 'Fi ABS', value: 'fi_abs' },
            { label: 'MotoGP Edition', value: 'motogp_edition' },
        ],
        ninja_300: [
            { label: 'Standard', value: 'standard' },
            { label: 'BS6 Edition', value: 'bs6_edition' },
        ],
        z900: [
            { label: 'Performance', value: 'performance' },
            { label: 'ABS Edition', value: 'abs_edition' },
        ],
        versys_650: [
            { label: 'Standard', value: 'standard' },
            { label: 'Touring Edition', value: 'touring_edition' },
        ],
        panigale_v4: [
            { label: 'S Variant', value: 's_variant' },
            { label: 'SP Edition', value: 'sp_edition' },
        ],
        monster_821: [
            { label: 'Dark Edition', value: 'dark_edition' },
            { label: 'Standard', value: 'standard' },
        ],
        multistrada_950: [
            { label: 'Touring Edition', value: 'touring_edition' },
            { label: 'S Variant', value: 's_variant' },
        ],
    };
    
    
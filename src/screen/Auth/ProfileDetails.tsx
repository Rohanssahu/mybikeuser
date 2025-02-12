import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { color } from '../../constant';
import CustomHeader from '../../component/CustomHeaderProps';
import images, { icon } from '../../component/Image';
import Icon from '../../component/Icon';
import CustomTextInput from '../../component/TextInput';
import { hp } from '../../component/utils/Constant';
import CustomButton from '../../component/CustomButton';
import ScreenNameEnum from '../../routes/screenName.enum';
import { StackNavigationProp } from '@react-navigation/stack';
import CustomDropdown from '../../component/CustomDropdown';

interface ProfileDetailsProps {
    navigation: StackNavigationProp<any, any>;
}

const ProfileDetails: React.FC<ProfileDetailsProps> = ({ navigation }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [state, setState] = useState('');
    const [city, setCity] = useState('');
    const [address, setAddress] = useState('');
    const [pinCode, setPinCode] = useState('');

    // Error states
    const [errors, setErrors] = useState({
        firstName: '',
        lastName: '',
        state: '',
        city: '',
        address: '',
        pinCode: ''
    });

    // Validation function
    const validateFields = () => {
        let isValid = true;
        let newErrors = {
            firstName: firstName ? '' : 'First Name is required',
            lastName: lastName ? '' : 'Last Name is required',
            state: state ? '' : 'State is required',
            city: city ? '' : 'City is required',
            address: address ? '' : 'Address is required',
            pinCode: pinCode ? '' : 'Pin Code is required'
        };

        setErrors(newErrors);

        // If any field has an error, form is invalid
        isValid = Object.values(newErrors).every(error => error === '');
        return isValid;
    };

    const handleSubmit = () => {
        if (validateFields()) {
            navigation.navigate(ScreenNameEnum.PROFILE_DETAILS);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: color.baground }}>
            {/* Header */}
            <CustomHeader navigation={navigation} title='Add Profile Details' onSkipPress={() => { }} showSkip={true} />

            {/* Profile Image Section */}
            <View style={styles.profileImageContainer}>
                <Image source={images.profileUpdate} style={styles.profileImage} />
                <TouchableOpacity style={styles.addIcon}>
                    <Icon source={icon.add} size={20} />
                </TouchableOpacity>
            </View>

            {/* Form Fields */}
            <View style={styles.formContainer}>
                <CustomTextInput
                    placeholder='First Name'
                    onChangeText={setFirstName}
                    value={firstName}
                    inputStyle={[styles.input, errors.firstName && styles.errorInput]}
                />
                {errors.firstName ? <Text style={styles.errorText}>{errors.firstName}</Text> : null}

                <CustomTextInput
                    placeholder='Last Name'
                    onChangeText={setLastName}
                    value={lastName}
                    inputStyle={[styles.input, errors.lastName && styles.errorInput, { marginTop: 15 }]}
                />
                {errors.lastName ? <Text style={styles.errorText}>{errors.lastName}</Text> : null}

                <CustomDropdown 
                      data={bikeCompanies}
                    onSelect={(value) => setState(value)} 
                    placeholder="State"
                />
                {errors.state ? <Text style={styles.errorText}>{errors.state}</Text> : null}

                <CustomDropdown 
                   data={bikeCompanies}
                    onSelect={(value) => setCity(value)} 
                    placeholder="City"
                />
                {errors.city ? <Text style={styles.errorText}>{errors.city}</Text> : null}

                <CustomTextInput
                    placeholder='Address'
                    onChangeText={setAddress}
                    value={address}
                    inputStyle={[styles.input, errors.address && styles.errorInput, { marginTop: 15 }]}
                />
                {errors.address ? <Text style={styles.errorText}>{errors.address}</Text> : null}

                <CustomTextInput
                    placeholder='Pin-code'
                    onChangeText={setPinCode}
                    value={pinCode}
                    inputStyle={[styles.input, errors.pinCode && styles.errorInput, { marginTop: 15 }]}
                />
                {errors.pinCode ? <Text style={styles.errorText}>{errors.pinCode}</Text> : null}
            </View>

            {/* Submit Button */}
            <View style={styles.buttonContainer}>
                <CustomButton
                    title="Submit"
                    onPress={()=>{ navigation.navigate(ScreenNameEnum.BOTTAM_TAB);}}
                    buttonStyle={styles.button}
                />
            </View>
        </View>
    );
};

const bikeCompanies = [
    { label: 'Yamaha', value: 'yamaha' },
    { label: 'Honda', value: 'honda' },
    { label: 'Suzuki', value: 'suzuki' },
    { label: 'Kawasaki', value: 'kawasaki' },
    { label: 'Ducati', value: 'ducati' },
];
const styles = StyleSheet.create({
    profileImageContainer: {
        marginTop: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileImage: {
        height: 100,
        width: 100,
    },
    addIcon: {
        marginTop: -25,
        right: -30,
        borderWidth: 1,
        borderColor: color.white,
        borderRadius: 30,
        padding:1,
    },
    formContainer: {
        paddingHorizontal: 25,
        marginTop: hp(8),
    },
    input: {
        borderWidth: 1,
        borderColor: '#fff',
        borderRadius:15,
        padding: 10,
        color: '#000',
    },
    errorInput: {
        borderColor: 'red',
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: 5,
        marginLeft: 5,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 40,
        width: '100%',
        paddingHorizontal: 20,
    },
    button: {},
});

export default ProfileDetails;


    import React from 'react';
    import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
    import { useNavigation } from '@react-navigation/native';
    import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
    import { color } from '../../constant';
    import CustomHeader from '../../component/CustomHeaderProps';
    import images from '../../component/Image';
    
    const Privacy: React.FC = ({}) => {
        const navigation = useNavigation();
    
        return (
            <View style={styles.container}>
           <CustomHeader  title='Privacy Policy'  navigation={navigation} />
    
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* Image */}
                    <Image source={images.about} style={styles.image} resizeMode="contain" />
    
                    {/* Section: App About Details */}
                    <Text style={styles.sectionTitle}>Privacy Policy</Text>
                    <Text style={styles.text}>
                        This Privacy Policy describes Our policies and procedures on the collection, use, and disclosure of
                        Your information when You use the Service and tells You about Your privacy rights and how the law
                        protects You. We use Your Personal data to provide and improve the Service. By using the Service,
                        You agree to the collection and use of information in accordance with this Privacy Policy.
                    </Text>
    
                    {/* Section: App Usage */}
                    <Text style={styles.sectionTitle}>Interpretation</Text>
                    <Text style={styles.text}>
                        The words of which the initial letter is capitalized have meanings defined under the following
                        conditions. The following definitions shall have the same meaning regardless of whether they appear
                        in singular or plural.
                    </Text>
                    <Text style={styles.text}>
                        Lorem ipsum dolor sit amet consectetur. Proin urna lorem condimentum consectetur pharetra nisi et.
                        Ut venenatis in id tortor arcu viverra tempor orci felis. Metus urna venenatis accumsan mi id.
                        Molestie ipsum egestas varius mollis tellus neque nec ultrices vel.
                    </Text>
                </ScrollView>
            </View>
        );
    };
    
    export default Privacy;
    
    // Styles
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: color.baground,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingTop: 50,
            paddingBottom: 15,
        },
        headerText: {
            fontSize: 18,
            fontWeight: 'bold',
            color: '#FFFFFF',
            marginLeft: 15,
        },
        scrollContent: {
            paddingHorizontal: 20,
            paddingBottom: 30,
        },
        image: {
            width: '100%',
            height: 180,
            marginBottom: 20,
        },
        sectionTitle: {
            fontSize: 16,
            fontWeight: 'bold',
            color: '#fff',
            marginTop: 20,
            marginBottom: 5,
        },
        text: {
            fontSize: 14,
            color: '#A0A3BD',
            lineHeight: 22,
            marginBottom: 10,
        },
    });
    
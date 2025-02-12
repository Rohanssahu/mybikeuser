import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, StatusBar, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CustomHeader from '../../component/CustomHeaderProps';
import { color } from '../../constant';
import images, { icon } from '../../component/Image';
import { hp } from '../../component/utils/Constant';
import Icon from '../../component/Icon';
import CustomButton from '../../component/CustomButton';
import ScreenNameEnum from '../../routes/screenName.enum';

interface ServiceItem {
  title: string;
  description: string;
}

const GarageDetails: React.FC<{ navigation: any }> = ({ navigation }) => {
  // Sample service data
  const services: ServiceItem[] = [
    { title: 'Oil Change & Oil Filter Cleaning', description: 'Proprietary quality engine oil. Manufacturer recommended oil grade.' },
    { title: 'Brake Check Up', description: 'Proprietary quality engine oil. Manufacturer recommended oil grade.' },
    { title: 'Electrical Maintenance', description: 'Proprietary quality engine oil. Manufacturer recommended oil grade.' },
    { title: 'Engine Maintenance', description: 'Proprietary quality engine oil. Manufacturer recommended oil grade.' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Garage Image */}
        <Image source={images.grage} style={styles.garageImage} resizeMode="cover" />

<TouchableOpacity style={{position:'absolute',top:40,left:10}}>
    <Icon source={icon.back}  size={30} />
</TouchableOpacity>
<View style={{position:'absolute',top:hp(18),left:10}}>
<Text style={styles.title}>MotoMend Station</Text>
          <Text style={styles.subtitle}>0993 Novick Parkway</Text>

          {/* Distance & Rating */}
          <View style={styles.infoRow}>
            <Icon  source={icon.pin} size={16} />
            <Text style={styles.infoText}>1.2 KM</Text>
            <Icon  source={icon.star} size={16} />
            <Text style={styles.infoText}>4.3</Text>
          </View>
</View>
        <View style={styles.contentContainer}>
         

          {/* Description */}
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris efficitur felis et ex ultrices, nec tincidunt nisi tristique.
          </Text>

          {/* Features */}
          <View style={styles.featureRow}>
            <Icon source={icon.Mobile} size={30}  />
            <View>
            <Text style={styles.featureText}>Go Digital</Text>
            <Text style={styles.featureText2}>Convenient Online Payment Options.</Text>
            </View>
          </View>
          <View style={styles.featureRow}>
          <Icon source={icon.pickups} size={30}  />
          <View>
            <Text style={styles.featureText}>Pick-Up & Drop</Text>
            <Text style={styles.featureText2}>Service from the comfort of your home/office.</Text>
            </View>
          </View>
          <View style={styles.featureRow}>
          <Icon source={icon.Mobile} size={30}  />
          <View>
            <Text style={styles.featureText}>Our Promise</Text>
            <Text style={styles.featureText2}>100% satisfaction guaranteed.</Text>
           
           </View>
          </View>
          <View style={styles.featureRow}>
          <Icon source={icon.Expert} size={30}  />
<View>
            <Text style={styles.featureText}>Expert Advice</Text>
            <Text style={styles.featureText2}>Skilled mechanics for your every need.</Text>
           
          </View>
          </View>

          {/* Services */}
          {services.map((service, index) => (
            <View key={index} style={styles.serviceContainer}>
                <View style={{backgroundColor:color.borderColor,
                padding:10,marginLeft:-50,
                    paddingLeft:50,
                    borderRadius:30}}>

              <Text style={[styles.serviceTitle,{color:'#000'}]}>{service.title}</Text>
              </View>
              <Text style={styles.serviceText}>{service.description}</Text>
            </View>
          ))}
        </View>
<View style={{marginVertical:15,paddingHorizontal:20,marginBottom:60}}>
        <CustomButton
title='Continue'

onPress={()=>{
    navigation.navigate(ScreenNameEnum.BOOKING_COMPLETE)
}}
        />
        </View>
      </ScrollView>
    </View>
  );
};

export default GarageDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.baground,
  },
  garageImage: {
    width: '100%',
    height: hp(30),
  },
  contentContainer: {
    padding:15,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 12,
    color: '#fff',
    marginTop: 5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  infoText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 5,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
  },
  descriptionText: {
    fontSize: 14,
    color: '#A0A3BD',
    marginTop: 10,
    lineHeight: 20,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 10,
    fontWeight:'600'
  },
  featureText2: {
    fontSize: 12,
    color: '#A1A1A1',
    marginLeft: 10,
  },
  serviceContainer: {
    marginTop: 20,

 
    borderRadius: 10,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  serviceText: {
    fontSize: 14,
    color: '#A0A3BD',
    marginTop: 5,
  },
});

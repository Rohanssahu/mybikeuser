
  import React from 'react';
  import { View, StyleSheet,ScrollView } from 'react-native';
  import images from '../../component/Image';
  import VerticalList from '../../component/VerticalList';
  import CustomHeader from '../../component/CustomHeaderProps';
  import { NativeStackScreenProps } from '@react-navigation/native-stack';
  import { color } from '../../constant';
  
  // Define the navigation type
  type RootStackParamList = {
    AllServices: undefined;
    // Add other screens if needed
  };
  
  // Define props for the component
  type Props = NativeStackScreenProps<RootStackParamList, 'AllServices'>;
  
  const MyBikes: React.FC<Props> = ({ navigation }) => {
    return (
      <View style={styles.container}>
        <CustomHeader navigation={navigation} title="Category" onSkipPress={() => { }} showSkip={false} />
       <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{marginTop:20}}>
        <VerticalList data={shopList} navigation={navigation} />
        </ScrollView>
      </View>
    );
  };
  
  // Define the type for shop list items
  interface ShopItem {
    name: string;
    description: string;
    distance: string;
    logo: any;
  }
  
  // Sample shop list data
  const shopList: ShopItem[] = [
    {
      name: 'GearUp Garage',
      description: 'Lorem ipsum dolor sit amet',
      distance: '2.5 km',
      logo: images.suzuki,
    },
    {
      name: 'MotoFix Center',
      description: 'Lorem ipsum dolor sit amet',
      distance: '3.8 km',
      logo: images.suzuki,
    },
  ];
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:color.baground
    },
  });
  
  export default MyBikes;
  
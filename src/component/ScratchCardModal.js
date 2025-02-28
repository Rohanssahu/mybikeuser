import {
    View,
    Image,
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
  } from 'react-native';
  import React, {useCallback, useEffect, useState} from 'react';
  import {ScratchCard} from 'rn-scratch-card';
  import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
  } from 'react-native-responsive-screen';
  import GifImage from '@lowkey/react-native-gif';
  import { useIsFocused } from '@react-navigation/native';
  
  export default function ScratchCardModal({visible, onClose, imageUri,Scratch}) {
    const [revealed, setRevealed] = useState(false);
  const [randomNumber,setrandomNumber]= useState(null)
  
  const isFocus =useIsFocused()
  
  useEffect(()=>{
    setrandomNumber(Math.floor(Math.random() * 10) + 1)
  },[isFocus])
  const onScratch = useCallback((percentage) => {

    if (percentage >=25) {
      setRevealed(true);
      if (percentage >=25) {
     
        Scratch(randomNumber);
        setrandomNumber(randomNumber)
      }
    }
  }, [Scratch]);
  
  
  
    return (
      <View style={{flex: 1}}>
        <Modal
          visible={visible}
          transparent={true}
          animationType="fade"
          onRequestClose={onClose}>
          <View onPress={onClose} style={styles.modalContainer}>
            <TouchableOpacity
              onPress={() => {
                onClose();
                setRevealed(false);
              }}
              style={{position: 'absolute', top: 30, right: 20}}>
              <Image
                source={require('../screen/ScratchCard/Close3x.png')}
                style={{height: 35, width: 35}}
              />
            </TouchableOpacity>
  
            <View style={styles.contentContainer}>
              <ImageBackground

              source={require('../screen/ScratchCard/winningcard.jpg')}
                style={{
                  borderRadius: 25,
                  padding: 0,
                  height: hp(45),
                  width: wp(80),
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  backgroundColor: '#FFD700',
                }}>
                
                <View
                  style={{
                    alignItems: 'center',
  
                    position: 'absolute',
                    bottom:120,
              
                  
                    justifyContent: 'center',
                    paddingHorizontal: 25,
                    borderRadius: 30,
                  }}>
                  
                </View>
               
                <ScratchCard
                  source={imageUri}
                  brushWidth={20}
                  onScratch={(percentage) => {
                    onScratch(percentage)
                  }}
                  style={{
                    height: hp(45),
                    width: wp(80),
                  }}
                />
              </ImageBackground>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
  const styles = StyleSheet.create({
    scratch_card: {
      height: '60%',
      width: 150,
    },
  
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    contentContainer: {
      borderRadius: 10,
      alignItems: 'center',
    },
  });
  
import {useCallback} from 'react';
import {Alert, BackHandler} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import ScreenNameEnum from '../routes/screenName.enum';

export function resetToHome(navigation: any) {
  navigation.reset({index: 0, routes: [{name: ScreenNameEnum.BOTTAM_TAB}]});
}

/**
 * Shared back/Home behavior for booking-flow screens.
 * Before completion: back works normally (hook is a no-op).
 * Once isBookingComplete is true: hardware back resets to Home instead of
 * popping, and handleHomePress resets immediately without confirmation.
 */
export function useBookingFlowNav(navigation: any, isBookingComplete = false) {
  useFocusEffect(
    useCallback(() => {
      if (!isBookingComplete) return;
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        resetToHome(navigation);
        return true;
      });
      return () => sub.remove();
    }, [navigation, isBookingComplete]),
  );

  const handleHomePress = useCallback(() => {
    if (isBookingComplete) {
      resetToHome(navigation);
      return;
    }
    Alert.alert(
      'Leave Booking?',
      'Your current booking process will be cancelled. Do you want to return to the Home screen?',
      [
        {text: 'Stay', style: 'cancel'},
        {text: 'Go Home', style: 'destructive', onPress: () => resetToHome(navigation)},
      ],
    );
  }, [navigation, isBookingComplete]);

  return {handleHomePress};
}

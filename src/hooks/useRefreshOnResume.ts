import {useCallback, useEffect, useRef} from 'react';
import {AppState} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';

// Runs `onRefresh` when this screen gains focus AND when the app returns to
// the foreground while this screen is the focused one. Garage availability
// (online/active) can change server-side at any moment — a screen that only
// refetches on mount/param-change would keep showing a dealer that went
// offline while the app was backgrounded or on another tab.
export function useRefreshOnResume(onRefresh: () => void) {
  const isFocusedRef = useRef(false);
  const savedCallback = useRef(onRefresh);
  savedCallback.current = onRefresh;

  useFocusEffect(
    useCallback(() => {
      isFocusedRef.current = true;
      savedCallback.current();
      return () => {
        isFocusedRef.current = false;
      };
    }, []),
  );

  useEffect(() => {
    const sub = AppState.addEventListener('change', nextState => {
      if (nextState === 'active' && isFocusedRef.current) {
        savedCallback.current();
      }
    });
    return () => sub.remove();
  }, []);
}

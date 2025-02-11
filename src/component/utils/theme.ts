import { StyleSheet } from 'react-native';

const lightTheme = {
  background: '#FFFFFF',
  text: '#000000',
  primary: '#FFC107',
  secondary: '#2C2F5B',
  accent: '#FFD700',
  button: '#FFC107',
  buttonText: '#000000',
  border: '#A0A3BD',
};

const darkTheme = {
  background: '#0E1333',
  text: '#FFFFFF',
  primary: '#FFC107',
  secondary: '#2C2F5B',
  accent: '#FFD700',
  button: '#FFD700',
  buttonText: '#0E1333',
  border: '#A0A3BD',
};

// Define global styles for the app
const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export { lightTheme, darkTheme, globalStyles };

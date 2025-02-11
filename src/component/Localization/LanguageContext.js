// src/contexts/LanguageContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import localizationStrings from './Localization';


const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('English');

  useEffect(() => {
    const loadLanguage = async () => {
      const storedLanguage = await AsyncStorage.getItem('Lng');
      if (storedLanguage) {
        setLanguage(storedLanguage);
        localizationStrings.setLanguage(storedLanguage);
      }
    };
    loadLanguage();
  }, []);

  const changeLanguage = async (newLanguage) => {
    setLanguage(newLanguage);
    localizationStrings.setLanguage(newLanguage);
    await AsyncStorage.setItem('Lng', newLanguage);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;

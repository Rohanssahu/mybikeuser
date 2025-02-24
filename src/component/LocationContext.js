import React, { createContext, useState, useContext } from 'react';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
    const [locationName, setLocationName] = useState('');

    return (
        <LocationContext.Provider value={{ locationName, setLocationName }}>
            {children}
        </LocationContext.Provider>
    );
};

export const useLocation = () => useContext(LocationContext);

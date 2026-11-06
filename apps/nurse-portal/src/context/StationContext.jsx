import React, { createContext, useContext, useState, useEffect } from 'react';
import { dataClient } from '@totoafya/api-client';
import { mockFacilities, mockNurses } from '@totoafya/api-client';

const StationContext = createContext(null);

const DEFAULT_STATION = {
  facility: mockFacilities[0] || {
    id: 'fac-pumwani-01',
    name: 'Pumwani Maternity Hospital',
    facility_code: 'MFL-13105',
    level: 'Level 5',
    county: 'Nairobi',
  },
  station: 'MCH Clinic',
  nurse: mockNurses[0] || {
    id: 'nurse-joy-01',
    full_name: 'Nurse Joy Wambui',
    designation: 'Senior Maternity Midwife',
    role: 'nurse',
    employee_id: 'PMH-NR-8821',
  },
};

export function StationProvider({ children }) {
  const [facility, setFacility] = useState(() => {
    try {
      const stored = sessionStorage.getItem('toto_station_facility');
      return stored ? JSON.parse(stored) : DEFAULT_STATION.facility;
    } catch {
      return DEFAULT_STATION.facility;
    }
  });

  const [station, setStation] = useState(() => {
    try {
      return sessionStorage.getItem('toto_station_name') || DEFAULT_STATION.station;
    } catch {
      return DEFAULT_STATION.station;
    }
  });

  const [nurse, setNurse] = useState(() => {
    try {
      const stored = sessionStorage.getItem('toto_station_nurse');
      return stored ? JSON.parse(stored) : DEFAULT_STATION.nurse;
    } catch {
      return DEFAULT_STATION.nurse;
    }
  });

  const [activePatient, setActivePatient] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lang, setLang] = useState('en');

  // Sync to session storage
  useEffect(() => {
    try {
      sessionStorage.setItem('toto_station_facility', JSON.stringify(facility));
    } catch {}
  }, [facility]);

  useEffect(() => {
    try {
      sessionStorage.setItem('toto_station_name', station);
    } catch {}
  }, [station]);

  useEffect(() => {
    try {
      sessionStorage.setItem('toto_station_nurse', JSON.stringify(nurse));
    } catch {}
  }, [nurse]);

  const lockStation = () => setIsLocked(true);
  const unlockStation = (enteredPin) => {
    // In mock mode, pin '1234' or any 4 digits unlocks
    if (!enteredPin || enteredPin.length >= 4) {
      setIsLocked(false);
      return true;
    }
    return false;
  };

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'sw' : 'en'));
  };

  return (
    <StationContext.Provider
      value={{
        facility,
        setFacility,
        station,
        setStation,
        nurse,
        setNurse,
        activePatient,
        setActivePatient,
        isLocked,
        lockStation,
        unlockStation,
        lang,
        setLang,
        toggleLanguage,
      }}
    >
      {children}
    </StationContext.Provider>
  );
}

export function useStation() {
  const context = useContext(StationContext);
  if (!context) {
    throw new Error('useStation must be used within a StationProvider');
  }
  return context;
}

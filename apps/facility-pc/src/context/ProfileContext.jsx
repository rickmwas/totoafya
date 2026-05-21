import db from '@/api/base44Client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    db.entities.Mother.list('-created_date', 1)
      .then(list => {
        setProfile(list[0] || null);
        setProfileLoaded(true);
      })
      .catch(() => setProfileLoaded(true));
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, setProfile, profileLoaded }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
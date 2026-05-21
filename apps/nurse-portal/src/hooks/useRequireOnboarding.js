import db from '@/api/base44Client';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Checks if the current user has completed onboarding (has a Mother profile).
 * If not, redirects them to /onboarding.
 * Returns { mother, loading } for use in page components.
 */
export function useRequireOnboarding() {
  const navigate = useNavigate();
  const [mother, setMother] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.entities.Mother.list('-created_date', 1).then((mothers) => {
      if (!mothers || mothers.length === 0) {
        navigate('/onboarding', { replace: true });
      } else {
        setMother(mothers[0]);
      }
      setLoading(false);
    });
  }, []);

  return { mother, loading };
}
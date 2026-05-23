import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@totoafya/api-client';
import { useAuthStore } from '../store/authStore';
import { 
  classifyNutritionStatus, 
  generateVaccinationSchedule,
  calculateGestationalAgeInWeeks,
  calculateEdd
} from '@totoafya/business-logic';
import { Child, Mother, GrowthRecord, Immunization, ANCVisit, AIAlert } from '@totoafya/types';

export function useHealthSummary() {
  const { user, activeChildId, setActiveChildId } = useAuthStore();
  const queryClient = useQueryClient();

  const userId = user?.id;
  const motherId = user?.mother_id;

  // 1. Fetch Mother Profile
  const motherQuery = useQuery<Mother | null>({
    queryKey: ['mother', userId],
    queryFn: async () => {
      if (!userId) return null;
      // Filter mother by user_id or mother_id
      const records = await db.entities.Mother.filter({ user_id: userId });
      if (records && records.length > 0) return records[0] as Mother;
      
      if (motherId) {
        return await db.entities.Mother.get(motherId) as Mother;
      }
      return null;
    },
    enabled: !!userId,
  });

  const mother = motherQuery.data;

  // 2. Fetch Children
  const childrenQuery = useQuery<Child[]>({
    queryKey: ['children', mother?.id],
    queryFn: async () => {
      if (!mother?.id) return [];
      const records = await db.entities.Child.filter({ mother_id: mother.id });
      return records as Child[];
    },
    enabled: !!mother?.id,
  });

  const children = childrenQuery.data || [];

  // Determine active child
  const activeChild = children.find(c => c.id === activeChildId) || children[0] || null;

  // 3. Fetch Growth Records for Active Child
  const growthQuery = useQuery<GrowthRecord[]>({
    queryKey: ['growth', activeChild?.id],
    queryFn: async () => {
      if (!activeChild?.id) return [];
      const records = await db.entities.GrowthRecord.filter({ child_id: activeChild.id });
      return records as GrowthRecord[];
    },
    enabled: !!activeChild?.id,
  });

  const growthRecords = growthQuery.data || [];

  // 4. Fetch Immunizations for Active Child
  const immunizationQuery = useQuery<Immunization[]>({
    queryKey: ['immunizations', activeChild?.id],
    queryFn: async () => {
      if (!activeChild?.id) return [];
      const records = await db.entities.Immunization.filter({ child_id: activeChild.id });
      return records as Immunization[];
    },
    enabled: !!activeChild?.id,
  });

  const immunizations = immunizationQuery.data || [];

  // 5. Fetch ANC Visits for Mother
  const ancQuery = useQuery<ANCVisit[]>({
    queryKey: ['anc_visits', mother?.id],
    queryFn: async () => {
      if (!mother?.id) return [];
      const records = await db.entities.ANCVisit.filter({ mother_id: mother.id });
      return records as ANCVisit[];
    },
    enabled: !!mother?.id && mother?.pregnancy_status === 'pregnant',
  });

  const ancVisits = ancQuery.data || [];

  // 6. Fetch AI Alerts
  const alertsQuery = useQuery<AIAlert[]>({
    queryKey: ['alerts', mother?.id],
    queryFn: async () => {
      if (!mother?.id) return [];
      const records = await db.entities.AIAlert.filter({ mother_id: mother.id });
      return records as AIAlert[];
    },
    enabled: !!mother?.id,
  });

  const alerts = alertsQuery.data || [];

  // Calculations
  const pregnancyWeeks = mother?.lmp ? calculateGestationalAgeInWeeks(mother.lmp) : 0;
  const edd = mother?.lmp ? calculateEdd(mother.lmp) : '';

  const activeChildNutritionStatus = activeChild && growthRecords.length > 0
    ? classifyNutritionStatus(
        growthRecords[0].weight_kg,
        growthRecords[0].age_months || 0,
        growthRecords[0].muac_cm
      )
    : 'normal';

  // MUTATIONS

  // Add a Child
  const addChildMutation = useMutation({
    mutationFn: async (newChild: Omit<Child, 'id' | 'created_at' | 'updated_at'>) => {
      const child = await db.entities.Child.create(newChild) as Child;
      
      // Auto-generate vaccination schedule for this child
      const schedule = generateVaccinationSchedule(child.id, child.date_of_birth);
      for (const item of schedule) {
        await db.entities.Immunization.create(item);
      }

      return child;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['children', mother?.id] });
      if (data) setActiveChildId(data.id);
    },
  });

  // Add Growth record
  const addGrowthMutation = useMutation({
    mutationFn: async (record: Omit<GrowthRecord, 'id' | 'created_at' | 'updated_at'>) => {
      return await db.entities.GrowthRecord.create(record);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['growth', activeChild?.id] });
    },
  });

  // Record Immunization
  const recordImmunizationMutation = useMutation({
    mutationFn: async ({ id, given_date, facility, administered_by }: { id: string; given_date: string; facility?: string; administered_by?: string }) => {
      return await db.entities.Immunization.update(id, {
        status: 'given',
        given_date,
        facility,
        administered_by,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['immunizations', activeChild?.id] });
    },
  });

  // Add ANC Visit
  const addAncVisitMutation = useMutation({
    mutationFn: async (visit: Omit<ANCVisit, 'id' | 'created_at' | 'updated_at'>) => {
      return await db.entities.ANCVisit.create(visit);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anc_visits', mother?.id] });
    },
  });

  // Register/Update Mother profile
  const updateMotherMutation = useMutation({
    mutationFn: async (profile: Partial<Mother>) => {
      if (mother?.id) {
        return await db.entities.Mother.update(mother.id, profile);
      } else {
        return await db.entities.Mother.create({
          ...profile,
          user_id: userId,
          profile_complete: true,
        });
      }
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['mother', userId] });
      useAuthStore.getState().updateUserProfile({
        mother_id: data.id,
        profile_complete: true,
        full_name: data.full_name,
      });
    },
  });

  return {
    mother,
    children,
    activeChild,
    growthRecords,
    immunizations,
    ancVisits,
    alerts,
    pregnancyWeeks,
    edd,
    activeChildNutritionStatus,
    isLoading: motherQuery.isLoading || childrenQuery.isLoading,
    addChild: addChildMutation.mutateAsync,
    isAddingChild: addChildMutation.isPending,
    addGrowthRecord: addGrowthMutation.mutateAsync,
    recordImmunization: recordImmunizationMutation.mutateAsync,
    addAncVisit: addAncVisitMutation.mutateAsync,
    updateMotherProfile: updateMotherMutation.mutateAsync,
    setActiveChildId,
  };
}

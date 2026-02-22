import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ─── Medications ───
export function useMedications(userId?: string) {
  const { user } = useAuth();
  const targetId = userId || user?.id;
  return useQuery({
    queryKey: ['medications', targetId],
    queryFn: async () => {
      if (!targetId) return [];
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', targetId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!targetId,
  });
}

export function useAddMedications() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (meds: { name: string; dosage: string; frequency_per_day: number; duration_days: number; notes: string }[]) => {
      if (!user) throw new Error('Not authenticated');
      const rows = meds.map(m => ({ ...m, user_id: user.id }));
      const { data, error } = await supabase.from('medications').insert(rows).select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['medications'] }),
  });
}

// ─── Schedules ───
export function useSchedules(userId?: string) {
  const { user } = useAuth();
  const targetId = userId || user?.id;
  return useQuery({
    queryKey: ['schedules', targetId],
    queryFn: async () => {
      if (!targetId) return [];
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('schedules')
        .select('*, medications(name, dosage)')
        .eq('user_id', targetId)
        .eq('date', today)
        .order('time_hhmm', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!targetId,
  });
}

export function useToggleSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, taken }: { id: string; taken: boolean }) => {
      const { error } = await supabase.from('schedules').update({ taken_status: taken }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['schedules'] }),
  });
}

export function useGenerateSchedules() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (medications: { id: string; frequency_per_day: number }[]) => {
      if (!user) throw new Error('Not authenticated');
      const today = new Date().toISOString().split('T')[0];
      const timeSlots = [
        { slot: '아침', time: '08:00' },
        { slot: '점심', time: '12:30' },
        { slot: '저녁', time: '18:30' },
        { slot: '취침 전', time: '22:00' },
      ];
      const rows: any[] = [];
      for (const med of medications) {
        const slots = timeSlots.slice(0, med.frequency_per_day);
        for (const s of slots) {
          rows.push({
            medication_id: med.id,
            user_id: user.id,
            time_of_day: s.slot,
            time_hhmm: s.time,
            date: today,
            taken_status: false,
          });
        }
      }
      if (rows.length > 0) {
        const { error } = await supabase.from('schedules').insert(rows);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['schedules'] }),
  });
}

// ─── Warnings ───
export function useWarnings(userId?: string) {
  const { user } = useAuth();
  const targetId = userId || user?.id;
  return useQuery({
    queryKey: ['warnings', targetId],
    queryFn: async () => {
      if (!targetId) return [];
      const { data, error } = await supabase
        .from('interaction_warnings')
        .select('*')
        .eq('user_id', targetId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!targetId,
  });
}

export function useAddWarnings() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (warnings: { medication_ids: string[]; severity: string; title: string; description: string }[]) => {
      if (!user) throw new Error('Not authenticated');
      const rows = warnings.map(w => ({ ...w, user_id: user.id }));
      const { error } = await supabase.from('interaction_warnings').insert(rows);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['warnings'] }),
  });
}

// ─── Profile ───
export function useProfile(userId?: string) {
  const { user } = useAuth();
  const targetId = userId || user?.id;
  return useQuery({
    queryKey: ['profile', targetId],
    queryFn: async () => {
      if (!targetId) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', targetId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!targetId,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (updates: { name?: string; conditions?: string; allergies?: string; emergency_contact?: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('profiles').update(updates).eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile'] }),
  });
}

// ─── Patient Links ───
export function usePatientLinks() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['patient_links', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('patient_links')
        .select('*, profiles!patient_links_patient_id_fkey(name, user_id)')
        .eq('caregiver_id', user.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user && user.role === 'caregiver',
  });
}

export function useLinkPatient() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (inviteCode: string) => {
      if (!user) throw new Error('Not authenticated');
      // Find the link by invite code
      const { data: link, error: findError } = await supabase
        .from('patient_links')
        .select('*')
        .eq('invite_code', inviteCode)
        .single();
      if (findError || !link) throw new Error('초대 코드를 찾을 수 없습니다');
      // Update caregiver_id
      const { error } = await supabase
        .from('patient_links')
        .update({ caregiver_id: user.id })
        .eq('id', link.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patient_links'] }),
  });
}

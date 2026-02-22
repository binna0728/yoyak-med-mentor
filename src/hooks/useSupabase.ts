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
    mutationFn: async (meds: { name: string; dosage: string; frequency_per_day: number; duration_days: number; notes: string; entp_name?: string; efcy?: string; use_method?: string; intrc?: string; se?: string; deposit_method?: string; item_seq?: string; item_image?: string }[]) => {
      if (!user) throw new Error('Not authenticated');
      const rows = meds.map(m => ({ ...m, user_id: user.id }));
      const { data, error } = await supabase.from('medications').insert(rows).select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['medications'] }),
  });
}

export function useUpdateMedication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Record<string, any> }) => {
      const { error } = await supabase.from('medications').update(updates).eq('id', id);
      if (error) throw error;
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
    mutationFn: async (medications: { id: string; frequency_per_day: number; use_method?: string }[]) => {
      if (!user) throw new Error('Not authenticated');
      const today = new Date().toISOString().split('T')[0];

      const rows: any[] = [];
      for (const med of medications) {
        const slots = parseUseMethodToSlots(med.use_method || '', med.frequency_per_day);
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

// ─── Schedule Optimizer (Stage 5) ───
export function useOptimizeSchedules() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const today = new Date().toISOString().split('T')[0];
      // Fetch today's schedules with medication info
      const { data: schedules, error } = await supabase
        .from('schedules')
        .select('*, medications(name, dosage, use_method, intrc)')
        .eq('user_id', user.id)
        .eq('date', today)
        .order('time_hhmm', { ascending: true });
      if (error) throw error;
      if (!schedules || schedules.length === 0) return { conflicts: [], optimized: false };

      // Detect time conflicts (same time_hhmm for drugs with interaction warnings)
      const conflicts: { drugA: string; drugB: string; time: string; suggestion: string }[] = [];
      for (let i = 0; i < schedules.length; i++) {
        for (let j = i + 1; j < schedules.length; j++) {
          const a = schedules[i] as any;
          const b = schedules[j] as any;
          if (a.time_hhmm === b.time_hhmm) {
            // Check if either has interaction info mentioning the other
            const aIntrc = (a.medications?.intrc || '').toLowerCase();
            const bIntrc = (b.medications?.intrc || '').toLowerCase();
            const aName = (a.medications?.name || '').toLowerCase();
            const bName = (b.medications?.name || '').toLowerCase();
            if (aIntrc.includes(bName) || bIntrc.includes(aName)) {
              conflicts.push({
                drugA: a.medications?.name || '',
                drugB: b.medications?.name || '',
                time: a.time_hhmm,
                suggestion: `${b.medications?.name}의 복용 시간을 30분 뒤로 조정하세요`,
              });
              // Adjust the second schedule by 30 min
              const [h, m] = b.time_hhmm.split(':').map(Number);
              const newMin = m + 30;
              const newTime = `${String(h + Math.floor(newMin / 60)).padStart(2, '0')}:${String(newMin % 60).padStart(2, '0')}`;
              await supabase.from('schedules').update({ time_hhmm: newTime }).eq('id', b.id);
            }
          }
        }
      }
      return { conflicts, optimized: conflicts.length > 0 };
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
    mutationFn: async (warnings: { medication_ids: string[]; severity: string; title: string; description: string; type?: string; source_snippet?: string }[]) => {
      if (!user) throw new Error('Not authenticated');
      const rows = warnings.map(w => ({ ...w, user_id: user.id }));
      const { error } = await supabase.from('interaction_warnings').insert(rows);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['warnings'] }),
  });
}

// ─── DUR Interaction Matrix (Stage 4) ───
export function useInteractionMatrix(userId?: string) {
  const { user } = useAuth();
  const targetId = userId || user?.id;
  return useQuery({
    queryKey: ['interaction_matrix', targetId],
    queryFn: async () => {
      if (!targetId) return [];
      const { data, error } = await supabase
        .from('interaction_matrix')
        .select('*')
        .eq('user_id', targetId)
        .order('severity', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!targetId,
  });
}

export function useGenerateDurCheck() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (medications: { id: string; name: string; intrc: string }[]) => {
      if (!user) throw new Error('Not authenticated');
      const pairs: any[] = [];
      for (let i = 0; i < medications.length; i++) {
        for (let j = i + 1; j < medications.length; j++) {
          const a = medications[i];
          const b = medications[j];
          const aIntrc = (a.intrc || '').toLowerCase();
          const bIntrc = (b.intrc || '').toLowerCase();
          const aName = a.name.toLowerCase();
          const bName = b.name.toLowerCase();

          let severity = 'low';
          let riskDesc = '';
          let action = '';
          let type = 'drug-drug';

          if (aIntrc.includes(bName) || bIntrc.includes(aName)) {
            severity = 'high';
            riskDesc = `${a.name}과(와) ${b.name}의 상호작용이 감지되었습니다.`;
            action = '의사 또는 약사에게 상담하세요.';
          }

          // Check food interactions
          const foodKeywords = ['음식', '식사', '우유', '주스', '알코올', '카페인', '자몽'];
          for (const food of foodKeywords) {
            if (aIntrc.includes(food)) {
              type = 'drug-food';
              riskDesc += ` ${a.name}: ${food} 관련 주의사항이 있습니다.`;
              severity = severity === 'low' ? 'medium' : severity;
            }
          }

          if (riskDesc) {
            pairs.push({
              drug_a: a.name,
              drug_b: b.name,
              contraindication_type: type,
              risk_description: riskDesc.trim(),
              recommended_action: action || '복용 시간 간격을 두세요.',
              severity,
              user_id: user.id,
              medication_id_a: a.id,
              medication_id_b: b.id,
            });
          }
        }
      }
      if (pairs.length > 0) {
        // Clear old matrix entries for this user
        await supabase.from('interaction_matrix').delete().eq('user_id', user.id);
        const { error } = await supabase.from('interaction_matrix').insert(pairs);
        if (error) throw error;
      }
      return pairs;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['interaction_matrix'] }),
  });
}

// ─── Drug Info Chunks (Stage 3) ───
export function useSaveDrugChunks() {
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ medicationId, sections }: { medicationId: string; sections: Record<string, string> }) => {
      if (!user) throw new Error('Not authenticated');
      const chunks = Object.entries(sections)
        .filter(([_, v]) => v && v.trim())
        .map(([type, content]) => ({
          medication_id: medicationId,
          user_id: user.id,
          chunk_type: type,
          content: content.substring(0, 2000),
        }));
      if (chunks.length > 0) {
        const { error } = await supabase.from('drug_info_chunks').insert(chunks);
        if (error) throw error;
      }
    },
  });
}

// ─── Guide Context Bundle (Stage 3) ───
export function useGuideBundle(medicationId: string | undefined) {
  return useQuery({
    queryKey: ['guide', medicationId],
    queryFn: async () => {
      if (!medicationId) return null;
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/guide`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ medicationId }),
        }
      );
      if (!res.ok) throw new Error('Guide fetch failed');
      return res.json();
    },
    enabled: !!medicationId,
  });
}

// ─── MFDS Search ───
export function useMfdsSearch() {
  return useMutation({
    mutationFn: async (itemName: string) => {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mfds-search`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ itemName }),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'MFDS 검색 실패');
      }
      return res.json();
    },
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
        .select('*')
        .or(`caregiver_id.eq.${user.id},patient_id.eq.${user.id}`);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

export function useLinkPatient() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (inviteCode: string) => {
      if (!user) throw new Error('Not authenticated');
      const { data: link, error: findError } = await supabase
        .from('patient_links')
        .select('*')
        .eq('invite_code', inviteCode)
        .single();
      if (findError || !link) throw new Error('초대 코드를 찾을 수 없습니다');
      const { error } = await supabase
        .from('patient_links')
        .update({ caregiver_id: user.id })
        .eq('id', link.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patient_links'] }),
  });
}

// ─── Helpers ───
function parseUseMethodToSlots(useMethod: string, fallbackFreq: number): { slot: string; time: string }[] {
  const defaultSlots = [
    { slot: '아침', time: '08:00' },
    { slot: '점심', time: '12:30' },
    { slot: '저녁', time: '18:30' },
    { slot: '취침 전', time: '22:00' },
  ];

  if (!useMethod) return defaultSlots.slice(0, fallbackFreq);

  const text = useMethod.toLowerCase();
  const slots: { slot: string; time: string }[] = [];

  // Detect specific timing keywords
  if (text.includes('식전') || text.includes('공복')) {
    if (text.includes('아침') || !text.includes('저녁')) slots.push({ slot: '아침', time: '07:30' });
    if (text.includes('점심')) slots.push({ slot: '점심', time: '12:00' });
    if (text.includes('저녁')) slots.push({ slot: '저녁', time: '18:00' });
  } else if (text.includes('식후')) {
    if (text.includes('아침') || !text.includes('저녁')) slots.push({ slot: '아침', time: '08:30' });
    if (text.includes('점심')) slots.push({ slot: '점심', time: '13:00' });
    if (text.includes('저녁')) slots.push({ slot: '저녁', time: '19:00' });
  }

  if (text.includes('취침') || text.includes('자기 전')) {
    slots.push({ slot: '취침 전', time: '22:00' });
  }

  // Detect interval-based (e.g., 매 8시간)
  const intervalMatch = text.match(/(\d+)\s*시간/);
  if (intervalMatch && slots.length === 0) {
    const interval = parseInt(intervalMatch[1]);
    let hour = 8;
    const slotNames = ['아침', '점심', '저녁', '취침 전'];
    let idx = 0;
    while (hour < 24 && idx < 4) {
      slots.push({ slot: slotNames[idx], time: `${String(hour).padStart(2, '0')}:00` });
      hour += interval;
      idx++;
    }
  }

  // Detect n회
  const freqMatch = text.match(/1일\s*(\d+)\s*회/);
  const detectedFreq = freqMatch ? parseInt(freqMatch[1]) : fallbackFreq;

  if (slots.length === 0) {
    return defaultSlots.slice(0, detectedFreq);
  }

  // Ensure we have at least the detected frequency
  while (slots.length < detectedFreq && slots.length < 4) {
    const remaining = defaultSlots.filter(d => !slots.some(s => s.slot === d.slot));
    if (remaining.length === 0) break;
    slots.push(remaining[0]);
  }

  return slots.sort((a, b) => a.time.localeCompare(b.time));
}

// ─── Interaction Parsing (Stage 2) ───
export function parseIntrcWarnings(
  intrcText: string,
  medName: string,
  medIds: string[]
): { title: string; description: string; severity: string; type: string; source_snippet: string }[] {
  if (!intrcText || !intrcText.trim()) return [];

  const warnings: { title: string; description: string; severity: string; type: string; source_snippet: string }[] = [];
  const lines = intrcText.split('\n').filter(l => l.trim());

  const foodKeywords = ['음식', '식사', '우유', '주스', '알코올', '카페인', '자몽', '칼슘', '철분', '과일'];
  const conditionKeywords = ['간', '신장', '심장', '당뇨', '고혈압', '임신', '수유', '노인', '소아'];
  const highKeywords = ['금기', '병용', '위험', '치명', '심각', '사망'];
  const mediumKeywords = ['주의', '조심', '상담', '확인', '모니터링'];

  for (const line of lines) {
    const lower = line.toLowerCase();
    let type = 'drug-drug';
    let severity = 'low';

    if (foodKeywords.some(k => lower.includes(k))) type = 'drug-food';
    if (conditionKeywords.some(k => lower.includes(k))) type = 'drug-condition';
    if (highKeywords.some(k => lower.includes(k))) severity = 'high';
    else if (mediumKeywords.some(k => lower.includes(k))) severity = 'medium';

    if (severity !== 'low' || type !== 'drug-drug') {
      const typeLabel = type === 'drug-food' ? '식사 충돌' : type === 'drug-condition' ? '질환 주의' : '약물 상호작용';
      warnings.push({
        title: `${medName} — ${typeLabel}`,
        description: line.substring(0, 300),
        severity,
        type,
        source_snippet: line.substring(0, 500),
      });
    }
  }

  // If no warnings extracted but text exists, add a general one
  if (warnings.length === 0 && intrcText.length > 10) {
    warnings.push({
      title: `${medName} — 상호작용 정보`,
      description: intrcText.substring(0, 300),
      severity: 'low',
      type: 'drug-drug',
      source_snippet: intrcText.substring(0, 500),
    });
  }

  return warnings;
}

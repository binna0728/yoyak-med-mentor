export interface Medication {
  id: string;
  userId: string;
  name: string;
  dosage: string;
  frequencyPerDay: number;
  durationDays: number;
  notes: string;
  description?: string;
}

export interface Schedule {
  id: string;
  medicationId: string;
  medicationName: string;
  timeOfDay: string;
  timeHHMM: string;
  date: string;
  takenStatus: boolean;
}

export interface InteractionWarning {
  id: string;
  userId: string;
  medicationIds: string[];
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  recommendation: string;
}

export interface PatientProfile {
  id: string;
  userId: string;
  conditions: string[];
  allergies: string[];
  emergencyContact: string;
  emergencyPhone: string;
  bloodType: string;
}

const today = new Date().toISOString().split('T')[0];

export const mockMedications: Medication[] = [
  { id: '1', userId: 'demo-1', name: '아목시실린', dosage: '500mg', frequencyPerDay: 3, durationDays: 7, notes: '식후 30분', description: '아목시실린은 세균 감염을 치료하는 항생제입니다. 반드시 처방된 기간 동안 꾸준히 복용하세요. 중간에 멈추면 내성균이 생길 수 있습니다.' },
  { id: '2', userId: 'demo-1', name: '이부프로펜', dosage: '200mg', frequencyPerDay: 2, durationDays: 5, notes: '식후 즉시', description: '이부프로펜은 통증과 염증을 줄여주는 소염진통제입니다. 빈속에 먹으면 위장이 아플 수 있으니 반드시 식후에 드세요.' },
  { id: '3', userId: 'demo-1', name: '오메프라졸', dosage: '20mg', frequencyPerDay: 1, durationDays: 14, notes: '아침 식전 30분', description: '오메프라졸은 위산 분비를 억제하여 위염, 역류성 식도염을 치료합니다. 아침 식사 30분 전에 복용하세요.' },
  { id: '4', userId: 'demo-1', name: '메트포르민', dosage: '500mg', frequencyPerDay: 2, durationDays: 30, notes: '식사와 함께', description: '메트포르민은 혈당을 낮추는 당뇨병 치료제입니다. 식사와 함께 복용하면 위장 부작용을 줄일 수 있습니다.' },
];

export const mockSchedule: Schedule[] = [
  { id: 's1', medicationId: '1', medicationName: '아목시실린 500mg', timeOfDay: '아침', timeHHMM: '08:00', date: today, takenStatus: true },
  { id: 's2', medicationId: '3', medicationName: '오메프라졸 20mg', timeOfDay: '아침', timeHHMM: '07:30', date: today, takenStatus: true },
  { id: 's3', medicationId: '2', medicationName: '이부프로펜 200mg', timeOfDay: '점심', timeHHMM: '12:30', date: today, takenStatus: false },
  { id: 's4', medicationId: '1', medicationName: '아목시실린 500mg', timeOfDay: '점심', timeHHMM: '13:00', date: today, takenStatus: false },
  { id: 's5', medicationId: '4', medicationName: '메트포르민 500mg', timeOfDay: '점심', timeHHMM: '12:30', date: today, takenStatus: false },
  { id: 's6', medicationId: '1', medicationName: '아목시실린 500mg', timeOfDay: '저녁', timeHHMM: '18:30', date: today, takenStatus: false },
  { id: 's7', medicationId: '2', medicationName: '이부프로펜 200mg', timeOfDay: '저녁', timeHHMM: '19:00', date: today, takenStatus: false },
  { id: 's8', medicationId: '4', medicationName: '메트포르민 500mg', timeOfDay: '저녁', timeHHMM: '18:30', date: today, takenStatus: false },
];

export const mockWarnings: InteractionWarning[] = [
  { id: 'w1', userId: 'demo-1', medicationIds: ['1', '4'], severity: 'high', title: '아목시실린 + 메트포르민 병용 주의', description: '아목시실린이 메트포르민의 혈당 강하 효과를 증가시킬 수 있습니다.', recommendation: '혈당 수치를 자주 확인하고 저혈당 증상(어지러움, 식은땀)에 주의하세요.' },
  { id: 'w2', userId: 'demo-1', medicationIds: ['2', '3'], severity: 'medium', title: '이부프로펜 + 오메프라졸 식사 타이밍 충돌', description: '이부프로펜은 식후, 오메프라졸은 식전에 복용해야 합니다.', recommendation: '오메프라졸을 식전 30분에, 이부프로펜을 식후에 복용하세요.' },
  { id: 'w3', userId: 'demo-1', medicationIds: ['2'], severity: 'low', title: '이부프로펜 위장 보호 권장', description: '이부프로펜 장기 복용 시 위점막 손상 가능성이 있습니다.', recommendation: '위장 보호제와 함께 복용하는 것이 권장됩니다.' },
];

export const mockProfile: PatientProfile = {
  id: 'p1',
  userId: 'demo-1',
  conditions: ['제2형 당뇨', '고혈압'],
  allergies: ['페니실린 계열 주의'],
  emergencyContact: '김보호 (배우자)',
  emergencyPhone: '010-1234-5678',
  bloodType: 'A+',
};

export const weeklyAdherence = [
  { day: '월', rate: 100 },
  { day: '화', rate: 87 },
  { day: '수', rate: 75 },
  { day: '목', rate: 100 },
  { day: '금', rate: 62 },
  { day: '토', rate: 87 },
  { day: '일', rate: 50 },
];

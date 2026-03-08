import apiClient from './client';
import { Medicine, MedicineGuideRequest, MedicineGuideResponse, MedicineHistory } from '@/types/medicine';

export const medicineApi = {
  // AI 복약지도 생성
  generateGuide: async (data: MedicineGuideRequest): Promise<MedicineGuideResponse> => {
    const response = await apiClient.post<MedicineGuideResponse>('/medicines/guide', data);
    return response.data;
  },

  // 복약지도 기록 조회
  getHistory: async (limit: number = 10): Promise<MedicineHistory> => {
    const response = await apiClient.get<MedicineHistory>('/medicines/history', {
      params: { limit }
    });
    return response.data;
  },

  // 특정 복약지도 조회
  getGuideById: async (id: string): Promise<Medicine> => {
    const response = await apiClient.get<Medicine>(`/medicines/guide/${id}`);
    return response.data;
  },
};

import apiClient from './client';
import { Medicine, MedicineGuideRequest, MedicineGuideResponse, MedicineHistory, MedicineRecognizeResponse, MedicineTTSResponse, PrescriptionOcrResponse } from '@/types/medicine';

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

  // 알약 이미지 인식
  recognizePill: async (image: File): Promise<MedicineRecognizeResponse> => {
    const formData = new FormData();
    formData.append('image', image);
    const response = await apiClient.post<MedicineRecognizeResponse>('/medicines/recognize', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // 처방전 OCR 인식 (네이버 클로바 OCR)
  recognizePrescription: async (image: File): Promise<PrescriptionOcrResponse> => {
    const formData = new FormData();
    formData.append('image', image);
    const response = await apiClient.post<PrescriptionOcrResponse>('/medicines/ocr/prescription', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // TTS 음성 생성
  getTTS: async (guideId: string): Promise<MedicineTTSResponse> => {
    const response = await apiClient.post<MedicineTTSResponse>('/medicines/tts', { guide_id: guideId });
    return response.data;
  },
};

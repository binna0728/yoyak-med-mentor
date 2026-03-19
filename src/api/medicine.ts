import { apiClient } from './client';

export const medicineApi = {
  /** 가이드 상세 조회 */
  getGuideById: async (id: string) => {
    const { data } = await apiClient.get(`/medications/${id}/guide`);
    return data.data ?? data;
  },

  /** TTS 음성 URL 조회 */
  getTTS: async (guideId: string, text?: string) => {
    const { data } = await apiClient.post('/tts/generate', {
      guide_id: guideId,
      text,
    });
    return data.data ?? data;
  },

  /** 알약 이미지 인식 */
  recognizePill: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post('/vision/identify', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data ?? data;
  },

  /** 처방전 OCR 인식 */
  recognizePrescription: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post('/ocr/parse', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data ?? data;
  },
};

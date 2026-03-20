// Toss WebView 유틸리티 함수들

/**
 * 토스 앱 내부에서 실행 중인지 확인
 * 개발 모드에서는 항상 true 반환 (테스트 편의)
 */
export const isInTossApp = (): boolean => {
  if (import.meta.env.DEV) return true;
  if (typeof window === 'undefined') return false;
  return /TossApp/i.test(navigator.userAgent);
};

/**
 * 토스 딥링크로 이동
 */
export const openTossDeepLink = (path: string): void => {
  const deepLink = `intoss://${path}`;
  if (isInTossApp()) {
    window.location.href = deepLink;
  } else {
    window.open('https://toss.im/app', '_blank');
  }
};

/**
 * 토스 로그인 요청 (토스 앱 내부에서만 동작)
 */
export const requestTossLogin = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!isInTossApp()) {
      reject(new Error('토스 앱 내부에서만 사용 가능합니다.'));
      return;
    }
    openTossDeepLink('login');
    resolve();
  });
};

/**
 * Safe Area Inset 값 가져오기
 */
export const getSafeAreaInsets = () => {
  const computedStyle = getComputedStyle(document.documentElement);
  return {
    top: computedStyle.getPropertyValue('--sat') || '0px',
    bottom: computedStyle.getPropertyValue('--sab') || '0px',
    left: computedStyle.getPropertyValue('--sal') || '0px',
    right: computedStyle.getPropertyValue('--sar') || '0px',
  };
};

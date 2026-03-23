import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold">개인정보 처리방침</h1>
      </div>

      <div className="px-5 py-6 space-y-6 text-sm text-foreground leading-relaxed">
        <section>
          <h2 className="font-bold text-base mb-2">1. 개인정보의 수집 및 이용 목적</h2>
          <p>요약(YoYak)은 다음 목적을 위해 최소한의 개인정보를 수집·이용합니다.</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>회원가입 및 로그인 (이메일, 소셜 계정 식별자)</li>
            <li>복약 스케줄 관리 및 알림 제공</li>
            <li>AI 기반 의약품 안내 서비스 제공</li>
            <li>서비스 개선 및 오류 분석</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">2. 수집하는 개인정보 항목</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>필수:</strong> 이메일 주소, 비밀번호(암호화 저장), 소셜 로그인 식별자</li>
            <li><strong>선택:</strong> 복용 중인 약품 정보, 복약 시간 설정</li>
            <li><strong>자동 수집:</strong> 서비스 이용 기록, 접속 로그, 기기 정보</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">3. 개인정보의 보유 및 이용 기간</h2>
          <p>회원 탈퇴 시 즉시 파기합니다. 단, 관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.</p>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>서비스 이용 기록: 3개월</li>
            <li>로그인 기록: 3개월</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">4. 개인정보의 제3자 제공</h2>
          <p>원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 이용자의 동의가 있거나 법령에 의한 경우는 예외로 합니다.</p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">5. 개인정보의 처리 위탁</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Supabase:</strong> 회원 인증 및 데이터 저장</li>
            <li><strong>OpenAI:</strong> AI 의약품 안내 응답 생성</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">6. 이용자의 권리</h2>
          <p>이용자는 언제든지 자신의 개인정보를 조회, 수정, 삭제할 수 있으며, 회원 탈퇴를 통해 개인정보 처리 정지를 요청할 수 있습니다.</p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">7. 개인정보 보호책임자</h2>
          <p>서비스명: 요약(YoYak)</p>
          <p>문의: 서비스 내 설정 메뉴 또는 이메일을 통해 문의해주세요.</p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2">8. 시행일</h2>
          <p>본 개인정보 처리방침은 2025년 6월 23일부터 시행됩니다.</p>
        </section>

        <p className="text-xs text-muted-foreground pt-4 border-t border-border">
          본 방침은 관련 법령 및 서비스 변경에 따라 수정될 수 있으며, 변경 시 앱 내 공지를 통해 안내합니다.
        </p>
      </div>
    </div>
  );
};

export default Privacy;


-- 약관 테이블
CREATE TABLE public.terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content_url text NOT NULL DEFAULT '',
  term_type text NOT NULL DEFAULT 'service',
  is_required boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.terms ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 활성 약관을 읽을 수 있음
CREATE POLICY "Anyone can read active terms" ON public.terms
  FOR SELECT TO authenticated
  USING (is_active = true);

-- 관리자만 약관 CRUD 가능 (admin 역할 추가 필요)
CREATE POLICY "Admins can manage terms" ON public.terms
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'caregiver'))
  WITH CHECK (public.has_role(auth.uid(), 'caregiver'));

-- 사용자 약관 동의 테이블
CREATE TABLE public.user_term_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  term_id uuid NOT NULL REFERENCES public.terms(id) ON DELETE CASCADE,
  agreed boolean NOT NULL DEFAULT false,
  agreed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, term_id)
);

ALTER TABLE public.user_term_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own consents" ON public.user_term_consents
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own consents" ON public.user_term_consents
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own consents" ON public.user_term_consents
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

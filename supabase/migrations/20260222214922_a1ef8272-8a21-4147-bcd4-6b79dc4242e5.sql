
-- Role enum
CREATE TYPE public.app_role AS ENUM ('patient', 'caregiver');

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role check
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL DEFAULT '',
  conditions TEXT DEFAULT '',
  allergies TEXT DEFAULT '',
  emergency_contact TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Patient links (caregiver <-> patient)
CREATE TABLE public.patient_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caregiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  invite_code TEXT NOT NULL UNIQUE DEFAULT substring(md5(random()::text) from 1 for 8),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.patient_links ENABLE ROW LEVEL SECURITY;

-- Medications
CREATE TABLE public.medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL DEFAULT '',
  frequency_per_day INT NOT NULL DEFAULT 1,
  duration_days INT NOT NULL DEFAULT 7,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;

-- Schedules
CREATE TABLE public.schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id UUID REFERENCES public.medications(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  time_of_day TEXT NOT NULL DEFAULT '아침',
  time_hhmm TEXT NOT NULL DEFAULT '08:00',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  taken_status BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- Interaction warnings
CREATE TABLE public.interaction_warnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  medication_ids UUID[] NOT NULL DEFAULT '{}',
  severity TEXT NOT NULL DEFAULT 'low',
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.interaction_warnings ENABLE ROW LEVEL SECURITY;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile + role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''));
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'patient'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies

-- user_roles: users can read their own role
CREATE POLICY "Users can read own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- profiles: users can CRUD own profile; caregivers can read linked patients
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Caregivers can read linked patient profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.patient_links
      WHERE caregiver_id = auth.uid() AND patient_id = profiles.user_id
    )
  );
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- patient_links
CREATE POLICY "Caregivers can read own links" ON public.patient_links
  FOR SELECT USING (auth.uid() = caregiver_id);
CREATE POLICY "Patients can read own links" ON public.patient_links
  FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Caregivers can insert links" ON public.patient_links
  FOR INSERT WITH CHECK (auth.uid() = caregiver_id);
CREATE POLICY "Caregivers can delete own links" ON public.patient_links
  FOR DELETE USING (auth.uid() = caregiver_id);

-- medications: own data + caregiver read
CREATE POLICY "Users can CRUD own medications" ON public.medications
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Caregivers can read linked patient medications" ON public.medications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.patient_links
      WHERE caregiver_id = auth.uid() AND patient_id = medications.user_id
    )
  );

-- schedules: own data + caregiver read
CREATE POLICY "Users can CRUD own schedules" ON public.schedules
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Caregivers can read linked patient schedules" ON public.schedules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.patient_links
      WHERE caregiver_id = auth.uid() AND patient_id = schedules.user_id
    )
  );

-- interaction_warnings: own data + caregiver read
CREATE POLICY "Users can CRUD own warnings" ON public.interaction_warnings
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Caregivers can read linked patient warnings" ON public.interaction_warnings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.patient_links
      WHERE caregiver_id = auth.uid() AND patient_id = interaction_warnings.user_id
    )
  );

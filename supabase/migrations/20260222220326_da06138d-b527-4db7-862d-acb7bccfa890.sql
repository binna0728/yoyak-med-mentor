
-- Stage 1: Add MFDS fields to medications
ALTER TABLE public.medications
ADD COLUMN IF NOT EXISTS entp_name text DEFAULT '',
ADD COLUMN IF NOT EXISTS efcy text DEFAULT '',
ADD COLUMN IF NOT EXISTS use_method text DEFAULT '',
ADD COLUMN IF NOT EXISTS intrc text DEFAULT '',
ADD COLUMN IF NOT EXISTS se text DEFAULT '',
ADD COLUMN IF NOT EXISTS deposit_method text DEFAULT '',
ADD COLUMN IF NOT EXISTS item_seq text DEFAULT '',
ADD COLUMN IF NOT EXISTS item_image text DEFAULT '';

-- Stage 2: Add type and source_snippet to interaction_warnings
ALTER TABLE public.interaction_warnings
ADD COLUMN IF NOT EXISTS type text DEFAULT 'drug-drug',
ADD COLUMN IF NOT EXISTS source_snippet text DEFAULT '';

-- Stage 3: RAG chunks table
CREATE TABLE public.drug_info_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id uuid NOT NULL REFERENCES public.medications(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  chunk_type text NOT NULL,
  content text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.drug_info_chunks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own chunks" ON public.drug_info_chunks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Caregivers can read linked patient chunks" ON public.drug_info_chunks FOR SELECT USING (
  EXISTS (SELECT 1 FROM patient_links WHERE caregiver_id = auth.uid() AND patient_id = drug_info_chunks.user_id)
);

-- Stage 4: Interaction matrix table
CREATE TABLE public.interaction_matrix (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  drug_a text NOT NULL,
  drug_b text NOT NULL,
  contraindication_type text NOT NULL DEFAULT 'drug-drug',
  risk_description text NOT NULL DEFAULT '',
  recommended_action text NOT NULL DEFAULT '',
  severity text NOT NULL DEFAULT 'medium',
  user_id uuid NOT NULL,
  medication_id_a uuid REFERENCES public.medications(id) ON DELETE CASCADE,
  medication_id_b uuid REFERENCES public.medications(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.interaction_matrix ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own matrix" ON public.interaction_matrix FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Caregivers can read linked patient matrix" ON public.interaction_matrix FOR SELECT USING (
  EXISTS (SELECT 1 FROM patient_links WHERE caregiver_id = auth.uid() AND patient_id = interaction_matrix.user_id)
);

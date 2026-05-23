-- ============================================================
-- 004_rls.sql
-- 全テーブル RLS 有効化 + profiles / ikemen_types / profile_ikemen_types ポリシー
-- ============================================================

-- ------------------------------------------------------------
-- RLS 有効化（全テーブル）
-- ------------------------------------------------------------
ALTER TABLE public.profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ikemen_types          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_ikemen_types  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages              ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- profiles
-- INSERT / DELETE は禁止（ポリシーなし = 全拒否）
-- ------------------------------------------------------------
CREATE POLICY "profiles_select_authenticated"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ------------------------------------------------------------
-- ikemen_types
-- SELECT のみ（INSERT / UPDATE / DELETE は禁止）
-- ------------------------------------------------------------
CREATE POLICY "ikemen_types_select_authenticated"
  ON public.ikemen_types FOR SELECT
  TO authenticated
  USING (true);

-- ------------------------------------------------------------
-- profile_ikemen_types
-- ------------------------------------------------------------
CREATE POLICY "profile_ikemen_types_select_authenticated"
  ON public.profile_ikemen_types FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "profile_ikemen_types_insert_own"
  ON public.profile_ikemen_types FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "profile_ikemen_types_delete_own"
  ON public.profile_ikemen_types FOR DELETE
  TO authenticated
  USING (profile_id = auth.uid());

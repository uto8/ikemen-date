-- ============================================================
-- 001_profiles.sql
-- profiles / ikemen_types / profile_ikemen_types テーブル
-- + handle_new_user / check_male_ikemen_types トリガー
-- ============================================================

-- ------------------------------------------------------------
-- ikemen_types
-- ------------------------------------------------------------
CREATE TABLE public.ikemen_types (
  id            smallint     PRIMARY KEY,
  name          varchar(30)  NOT NULL UNIQUE,
  display_order smallint     NOT NULL UNIQUE
);

-- ------------------------------------------------------------
-- profiles
-- ------------------------------------------------------------
CREATE TABLE public.profiles (
  id                     uuid         PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  gender                 text         NOT NULL CHECK (gender IN ('male', 'female')),
  birth_date             date         NOT NULL,
  nickname               varchar(20)  NOT NULL DEFAULT '',
  prefecture             varchar(10)  NOT NULL DEFAULT '',
  avatar_url             text,
  occupation             varchar(30),
  height                 smallint     CHECK (height IS NULL OR height BETWEEN 100 AND 250),
  bio                    text         CHECK (bio IS NULL OR char_length(bio) BETWEEN 1 AND 300),
  is_onboarding_complete boolean      NOT NULL DEFAULT false,
  likes_last_read_at     timestamptz,
  created_at             timestamptz  NOT NULL DEFAULT now(),
  updated_at             timestamptz  NOT NULL DEFAULT now(),

  CONSTRAINT profiles_male_fields_required CHECK (
    gender = 'female'
    OR (
      avatar_url IS NOT NULL AND
      occupation IS NOT NULL AND
      height     IS NOT NULL AND
      bio        IS NOT NULL
    )
  )
);

CREATE INDEX idx_profiles_gender ON public.profiles (gender);

-- ------------------------------------------------------------
-- profile_ikemen_types
-- ------------------------------------------------------------
CREATE TABLE public.profile_ikemen_types (
  profile_id     uuid      NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  ikemen_type_id smallint  NOT NULL REFERENCES public.ikemen_types(id),
  PRIMARY KEY (profile_id, ikemen_type_id)
);

-- ------------------------------------------------------------
-- handle_new_user: auth.users INSERT 時に profiles を自動生成
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, gender, birth_date)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'gender',
    (NEW.raw_user_meta_data ->> 'birth_date')::date
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------
-- check_male_ikemen_types: is_onboarding_complete=true 更新時に
-- 男性は ikemen_type が 1 件以上必要
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_male_ikemen_types()
RETURNS trigger AS $$
BEGIN
  IF NEW.is_onboarding_complete = true AND NEW.gender = 'male' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.profile_ikemen_types WHERE profile_id = NEW.id
    ) THEN
      RAISE EXCEPTION 'Male profile must have at least one ikemen type selected';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_male_ikemen_types
  BEFORE UPDATE OF is_onboarding_complete ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.check_male_ikemen_types();

-- ============================================================
-- 002_social.sql
-- likes / matches / messages テーブル
-- ============================================================

-- ------------------------------------------------------------
-- likes
-- ------------------------------------------------------------
CREATE TABLE public.likes (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id   uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT likes_unique_pair   UNIQUE (sender_id, receiver_id),
  CONSTRAINT likes_no_self_like  CHECK  (sender_id != receiver_id)
);

-- ------------------------------------------------------------
-- matches
-- ------------------------------------------------------------
CREATE TABLE public.matches (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id   uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  user2_id   uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT matches_unique_pair UNIQUE (user1_id, user2_id),
  CONSTRAINT matches_ordered     CHECK  (user1_id < user2_id)
);

-- ------------------------------------------------------------
-- messages
-- ------------------------------------------------------------
CREATE TABLE public.messages (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id   uuid        NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  sender_id  uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  content    text        NOT NULL CHECK (char_length(content) BETWEEN 1 AND 500),
  is_read    boolean     NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_match_created  ON public.messages (match_id, created_at ASC);
CREATE INDEX idx_messages_match_is_read  ON public.messages (match_id, is_read);

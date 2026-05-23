-- ============================================================
-- 003_match_trigger.sql
-- 双方向いいね時にマッチングを自動生成するトリガー
-- ============================================================

CREATE OR REPLACE FUNCTION public.create_match_if_mutual()
RETURNS trigger AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.likes
    WHERE sender_id   = NEW.receiver_id
      AND receiver_id = NEW.sender_id
  ) THEN
    INSERT INTO public.matches (user1_id, user2_id)
    VALUES (
      LEAST(NEW.sender_id, NEW.receiver_id),
      GREATEST(NEW.sender_id, NEW.receiver_id)
    )
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_like_inserted
  AFTER INSERT ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.create_match_if_mutual();

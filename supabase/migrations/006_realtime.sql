-- ============================================================
-- 006_realtime.sql
-- Supabase Realtime パブリケーション設定
-- postgres_changes でイベントを受信するために必要
-- ============================================================

-- メッセージのリアルタイム受信（チャット）
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- 相手退会イベントのリアルタイム受信
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

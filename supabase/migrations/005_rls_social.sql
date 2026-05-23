-- ============================================================
-- 005_rls_social.sql
-- likes / matches / messages RLS ポリシー
-- ============================================================

-- ------------------------------------------------------------
-- likes
-- UPDATE / DELETE は禁止（ポリシーなし = 全拒否）
-- ------------------------------------------------------------
CREATE POLICY "likes_select_own"
  ON public.likes FOR SELECT
  TO authenticated
  USING (
    sender_id   = auth.uid()
    OR receiver_id = auth.uid()
  );

CREATE POLICY "likes_insert_own"
  ON public.likes FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

-- ------------------------------------------------------------
-- matches
-- INSERT / UPDATE / DELETE は禁止（create_match_if_mutual が SECURITY DEFINER で実行）
-- ------------------------------------------------------------
CREATE POLICY "matches_select_own"
  ON public.matches FOR SELECT
  TO authenticated
  USING (
    user1_id = auth.uid()
    OR user2_id = auth.uid()
  );

-- ------------------------------------------------------------
-- messages
-- DELETE は禁止（ポリシーなし = 全拒否）
-- ------------------------------------------------------------
CREATE POLICY "messages_select_own"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.matches
      WHERE id = messages.match_id
        AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

CREATE POLICY "messages_insert_own"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.matches
      WHERE id = messages.match_id
        AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

-- 既読化のみ許可（受信者が is_read = true に更新する用途）
CREATE POLICY "messages_update_isread"
  ON public.messages FOR UPDATE
  TO authenticated
  USING (
    sender_id != auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.matches
      WHERE id = messages.match_id
        AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  )
  WITH CHECK (is_read = true);

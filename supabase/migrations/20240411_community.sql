-- ═══════════════════════════════════════════════════════════════
--  Habitat CRM · Community Feed Tables
--  Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ═══════════════════════════════════════════════════════════════

-- ── Posts ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_posts (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content     TEXT        NOT NULL DEFAULT '',
  image_url   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Full replica identity so DELETE payloads include all columns in realtime
ALTER TABLE community_posts REPLICA IDENTITY FULL;

-- ── Comments ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_comments (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID        NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content     TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE community_comments REPLICA IDENTITY FULL;

-- ── Likes ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_likes (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     UUID        NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT community_likes_unique UNIQUE (post_id, user_id)
);

ALTER TABLE community_likes REPLICA IDENTITY FULL;

-- ── Indexes ──────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_community_posts_created   ON community_posts   (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_user      ON community_posts   (user_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_post   ON community_comments (post_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_community_likes_post      ON community_likes   (post_id);
CREATE INDEX IF NOT EXISTS idx_community_likes_user_post ON community_likes   (user_id, post_id);

-- ── RLS: community_posts ─────────────────────────────────────────
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "community_posts_select_all"
  ON community_posts FOR SELECT
  USING (true);

CREATE POLICY "community_posts_insert_own"
  ON community_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "community_posts_delete_own"
  ON community_posts FOR DELETE
  USING (auth.uid() = user_id);

-- ── RLS: community_comments ──────────────────────────────────────
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "community_comments_select_all"
  ON community_comments FOR SELECT
  USING (true);

CREATE POLICY "community_comments_insert_own"
  ON community_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "community_comments_delete_own"
  ON community_comments FOR DELETE
  USING (auth.uid() = user_id);

-- ── RLS: community_likes ─────────────────────────────────────────
ALTER TABLE community_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "community_likes_select_all"
  ON community_likes FOR SELECT
  USING (true);

CREATE POLICY "community_likes_insert_own"
  ON community_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "community_likes_delete_own"
  ON community_likes FOR DELETE
  USING (auth.uid() = user_id);

-- ── Storage bucket for community images ──────────────────────────
-- Run this separately if the bucket doesn't exist yet:
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('community-images', 'community-images', true)
-- ON CONFLICT (id) DO NOTHING;

-- Storage RLS (run after creating the bucket)
-- CREATE POLICY "community_images_select" ON storage.objects FOR SELECT USING (bucket_id = 'community-images');
-- CREATE POLICY "community_images_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'community-images' AND auth.role() = 'authenticated');
-- CREATE POLICY "community_images_delete" ON storage.objects FOR DELETE USING (bucket_id = 'community-images' AND auth.uid()::text = (storage.foldername(name))[1]);

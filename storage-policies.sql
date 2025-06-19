-- 確保 RLS 已啟用
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 更新 bucket 設定
SELECT storage.update_bucket('closet-images', jsonb_build_object(
  'public', true,
  'file_size_limit', 5242880, -- 5MB
  'allowed_mime_types', array['image/*']
));

-- 刪除現有的 policies
BEGIN;
  SELECT storage.delete_policy('closet-images', 'INSERT');
  SELECT storage.delete_policy('closet-images', 'SELECT');
  SELECT storage.delete_policy('closet-images', 'UPDATE');
  SELECT storage.delete_policy('closet-images', 'DELETE');
COMMIT;

-- 建立新的 policies
BEGIN;
  -- 上傳權限
  SELECT storage.create_policy(
    'closet-images',
    'INSERT',
    'authenticated',
    true
  );

  -- 更新權限
  SELECT storage.create_policy(
    'closet-images',
    'UPDATE',
    'authenticated',
    true,
    '(storage.foldername(name))[1] = auth.uid()::text'
  );

  -- 讀取權限
  SELECT storage.create_policy(
    'closet-images',
    'SELECT',
    'public',
    true
  );

  -- 刪除權限
  SELECT storage.create_policy(
    'closet-images',
    'DELETE',
    'authenticated',
    true,
    '(storage.foldername(name))[1] = auth.uid()::text'
  );
COMMIT;

-- 設定預設權限為拒絕
ALTER TABLE storage.objects FORCE ROW LEVEL SECURITY;

-- 設定 bucket policy
INSERT INTO storage.buckets (id, name, public)
VALUES ('closet-images', 'closet-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 設定 CORS
UPDATE storage.buckets
SET cors_origins = array['*']
WHERE id = 'closet-images';

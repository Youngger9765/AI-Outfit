-- 1. 先刪除現有的觸發器和 function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- 2. 刪除並重建 users 表
DROP TABLE IF EXISTS public.users;

CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 重新建立 function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (id, email, name)  -- 明確指定 schema
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      CASE
        WHEN NEW.raw_user_meta_data IS NOT NULL THEN NEW.raw_user_meta_data->>'name'
        ELSE NULL
      END,
      split_part(NEW.email, '@', 1)
    )
  );
  RETURN NEW;
END;
$$;

-- 4. 重新建立觸發器
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. 設定 RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 允許已登入用戶讀取所有用戶資料
CREATE POLICY "Allow users to read all profiles" ON public.users
  FOR SELECT USING (auth.role() = 'authenticated');

-- 允許用戶更新自己的資料
CREATE POLICY "Allow users to update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);
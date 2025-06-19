-- 啟用必要的擴展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 建立用戶資料表
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立衣物資料表
CREATE TABLE IF NOT EXISTS clothing_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('top', 'bottom', 'dress', 'outerwear', 'shoes', 'accessories')),
  color TEXT NOT NULL,
  season TEXT NOT NULL CHECK (season IN ('spring', 'summer', 'autumn', 'winter', 'all')),
  image_url TEXT NOT NULL,
  description TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立搭配資料表
CREATE TABLE IF NOT EXISTS outfits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  clothing_items UUID[] NOT NULL,
  is_favorite BOOLEAN DEFAULT FALSE,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立旅行搭配資料表
CREATE TABLE IF NOT EXISTS travel_outfits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  destination_name TEXT NOT NULL,
  destination_address TEXT NOT NULL,
  destination_image TEXT NOT NULL,
  generated_outfit_image TEXT NOT NULL,
  weather_info TEXT,
  notes TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 建立 user_profiles 資料表
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_clothing_items_user_id ON clothing_items(user_id);
CREATE INDEX IF NOT EXISTS idx_clothing_items_category ON clothing_items(category);
CREATE INDEX IF NOT EXISTS idx_outfits_user_id ON outfits(user_id);
CREATE INDEX IF NOT EXISTS idx_travel_outfits_user_id ON travel_outfits(user_id);

-- 建立 RLS (Row Level Security) 政策
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clothing_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 用戶資料表政策
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- 重設 clothing_items 的 RLS 政策
drop policy if exists "Users can view own clothing items" on clothing_items;
drop policy if exists "Users can insert own clothing items" on clothing_items;
drop policy if exists "Users can update own clothing items" on clothing_items;
drop policy if exists "Users can delete own clothing items" on clothing_items;

-- 設定 clothing_items 的 RLS 政策
create policy "Users can view own clothing items"
  on clothing_items
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own clothing items"
  on clothing_items
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own clothing items"
  on clothing_items
  for update
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can delete own clothing items"
  on clothing_items
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- 確保 RLS 已啟用
alter table clothing_items enable row level security;

-- 重設 storage 的 RLS 政策
drop policy if exists "Authenticated users can upload images" on storage.objects;
drop policy if exists "Authenticated users can update their images" on storage.objects;
drop policy if exists "Images are publicly accessible" on storage.objects;
drop policy if exists "Users can delete their own images" on storage.objects;

-- 設定 storage 的 RLS 政策
create policy "Authenticated users can upload images"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'closet-images');

create policy "Authenticated users can update their images"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'closet-images' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Images are publicly accessible"
  on storage.objects
  for select
  to public
  using (bucket_id = 'closet-images');

create policy "Users can delete their own images"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'closet-images' and auth.uid()::text = (storage.foldername(name))[1]);

-- 確保 storage bucket 存在
insert into storage.buckets (id, name, public)
values ('closet-images', 'closet-images', true)
on conflict (id) do nothing;

-- 搭配資料表政策
CREATE POLICY "Users can view own outfits" ON outfits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own outfits" ON outfits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own outfits" ON outfits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own outfits" ON outfits
  FOR DELETE USING (auth.uid() = user_id);

-- 旅行搭配資料表政策
CREATE POLICY "Users can view own travel outfits" ON travel_outfits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own travel outfits" ON travel_outfits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own travel outfits" ON travel_outfits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own travel outfits" ON travel_outfits
  FOR DELETE USING (auth.uid() = user_id);

-- 建立觸發器函數來更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 為所有資料表添加 updated_at 觸發器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clothing_items_updated_at BEFORE UPDATE ON clothing_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_outfits_updated_at BEFORE UPDATE ON outfits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_travel_outfits_updated_at BEFORE UPDATE ON travel_outfits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 建立用戶註冊時的觸發器
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 設定 RLS 政策
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 允許使用者讀取自己的資料
CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 允許使用者更新自己的資料
CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- 允許在註冊時建立資料
CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 建立觸發器，在使用者註冊時自動建立 profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 
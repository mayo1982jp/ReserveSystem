/*
  # 予約管理システムのデータベーススキーマ

  1. 新しいテーブル
    - `profiles` - ユーザープロフィール情報
      - `id` (uuid, primary key, auth.users.idと連携)
      - `name` (text)
      - `phone` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `services` - サービス情報
      - `id` (text, primary key)
      - `name` (text)
      - `name_en` (text)
      - `duration` (text)
      - `price` (integer)
      - `description` (text)
      - `active` (boolean)
      - `created_at` (timestamp)
    
    - `bookings` - 予約情報
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `service_id` (text, foreign key to services)
      - `booking_date` (date)
      - `booking_time` (time)
      - `status` (enum: pending, confirmed, cancelled, completed)
      - `notes` (text)
      - `chart_number` (text, unique)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. セキュリティ
    - 全テーブルでRLSを有効化
    - ユーザーは自分の情報のみアクセス可能
    - 管理者は全データにアクセス可能
*/

-- プロフィールテーブル
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- サービステーブル
CREATE TABLE IF NOT EXISTS services (
  id text PRIMARY KEY,
  name text NOT NULL,
  name_en text,
  duration text NOT NULL,
  price integer NOT NULL,
  description text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 予約ステータスのenum型
DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 予約テーブル
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  service_id text REFERENCES services(id) NOT NULL,
  booking_date date NOT NULL,
  booking_time time NOT NULL,
  status booking_status DEFAULT 'pending',
  notes text,
  chart_number text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(booking_date, booking_time, status) DEFERRABLE INITIALLY DEFERRED
);

-- カルテ番号生成関数
CREATE OR REPLACE FUNCTION generate_chart_number()
RETURNS text AS $$
DECLARE
  chart_num text;
  exists_check boolean;
BEGIN
  LOOP
    chart_num := (1000 + floor(random() * 9000))::text;
    SELECT EXISTS(SELECT 1 FROM bookings WHERE chart_number = chart_num) INTO exists_check;
    IF NOT exists_check THEN
      EXIT;
    END IF;
  END LOOP;
  RETURN chart_num;
END;
$$ LANGUAGE plpgsql;

-- 予約作成時にカルテ番号を自動生成するトリガー
CREATE OR REPLACE FUNCTION set_chart_number()
RETURNS trigger AS $$
BEGIN
  IF NEW.chart_number IS NULL THEN
    NEW.chart_number := generate_chart_number();
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_chart_number_trigger
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION set_chart_number();

-- プロフィール更新時のトリガー
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLSを有効化
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- プロフィールのRLSポリシー
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 管理者はすべてのプロフィールにアクセス可能
CREATE POLICY "Admin can access all profiles"
  ON profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'mayo810246@gmail.com'
    )
  );

-- サービスのRLSポリシー（全員が読み取り可能、管理者のみ変更可能）
CREATE POLICY "Anyone can read active services"
  ON services
  FOR SELECT
  TO authenticated
  USING (active = true);

CREATE POLICY "Admin can manage services"
  ON services
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'mayo810246@gmail.com'
    )
  );

-- 予約のRLSポリシー
CREATE POLICY "Users can read own bookings"
  ON bookings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookings"
  ON bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- 管理者はすべての予約にアクセス可能
CREATE POLICY "Admin can access all bookings"
  ON bookings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'mayo810246@gmail.com'
    )
  );

-- 初期サービスデータの挿入
INSERT INTO services (id, name, name_en, duration, price, description) VALUES
  ('general', '一般整骨治療', 'General Treatment', '30分', 3000, '肩こり、腰痛、関節痛の基本治療'),
  ('sports', 'スポーツ整骨', 'Sports Therapy', '45分', 4500, 'スポーツ外傷・障害の専門治療'),
  ('massage', 'マッサージ治療', 'Therapeutic Massage', '60分', 5000, '筋肉の緊張緩和とリラクゼーション'),
  ('acupuncture', '鍼灸治療', 'Acupuncture', '45分', 4000, '東洋医学による痛みの根本治療')
ON CONFLICT (id) DO NOTHING;

-- 新規ユーザー登録時にプロフィールを自動作成する関数
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 新規ユーザー作成時のトリガー
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
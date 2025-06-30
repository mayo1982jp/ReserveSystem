/*
  # Fix RLS policies for profiles and services tables

  1. Security Updates
    - Update profiles table RLS policies to allow proper access
    - Update services table RLS policies to allow public read access
    - Ensure proper permissions for authenticated and anonymous users

  2. Changes Made
    - Drop existing problematic policies
    - Create new policies with correct permissions
    - Ensure services can be read by all users (including anonymous)
    - Ensure profiles can be read/updated by their owners and admin
*/

-- Drop existing policies that might be causing issues
DROP POLICY IF EXISTS "Enable read access for own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for own profile" ON profiles;
DROP POLICY IF EXISTS "Enable update for own profile" ON profiles;
DROP POLICY IF EXISTS "Admin can access all profiles" ON profiles;
DROP POLICY IF EXISTS "Public can read active services" ON services;
DROP POLICY IF EXISTS "Admin can manage all services" ON services;

-- Profiles table policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

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
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'mayo810246@gmail.com'
    )
  );

-- Services table policies
CREATE POLICY "Anyone can read active services"
  ON services
  FOR SELECT
  TO anon, authenticated
  USING (active = true);

CREATE POLICY "Admin can manage all services"
  ON services
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'mayo810246@gmail.com'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email = 'mayo810246@gmail.com'
    )
  );
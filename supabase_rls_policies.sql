-- COMPLETE RLS POLICY RESET AND SETUP
-- Run this entire script to fix all permission issues

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Users can insert own predictions" ON predictions;
DROP POLICY IF EXISTS "Users can view own predictions" ON predictions;
DROP POLICY IF EXISTS "Users can update own predictions" ON predictions;
DROP POLICY IF EXISTS "Users can insert own prediction history" ON prediction_history;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON user_profiles;
DROP POLICY IF EXISTS "All profiles viewable" ON user_profiles;

-- Enable RLS on all tables
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PREDICTIONS TABLE POLICIES
-- ============================================
CREATE POLICY "Users can insert own predictions"
ON predictions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own predictions"
ON predictions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own predictions"
ON predictions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- PREDICTION HISTORY TABLE POLICIES
-- ============================================
CREATE POLICY "Users can insert own prediction history"
ON prediction_history FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM predictions
    WHERE predictions.id = prediction_history.prediction_id
    AND predictions.user_id = auth.uid()
  )
);

-- ============================================
-- USER PROFILES TABLE POLICIES
-- ============================================

-- Allow users to create their own profile
CREATE POLICY "Users can insert own profile"
ON user_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- CRITICAL: Allow ALL authenticated users to view ALL profiles
-- This is required for the leaderboard to work
CREATE POLICY "All profiles viewable by authenticated users"
ON user_profiles FOR SELECT
TO authenticated
USING (true);

-- Verify policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('predictions', 'prediction_history', 'user_profiles')
ORDER BY tablename, policyname;

-- FINAL FIX FOR RLS POLICIES
-- This will completely reset and fix all policies

-- Step 1: Drop ALL policies on user_profiles
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_profiles') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON user_profiles';
    END LOOP;
END $$;

-- Step 2: Drop ALL policies on predictions
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'predictions') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON predictions';
    END LOOP;
END $$;

-- Step 3: Drop ALL policies on prediction_history
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'prediction_history') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON prediction_history';
    END LOOP;
END $$;

-- Step 4: Enable RLS
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Step 5: Create fresh policies for PREDICTIONS
CREATE POLICY "pred_insert" ON predictions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pred_select" ON predictions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "pred_update" ON predictions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Step 6: Create fresh policies for PREDICTION_HISTORY
CREATE POLICY "hist_insert" ON prediction_history FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM predictions WHERE predictions.id = prediction_history.prediction_id AND predictions.user_id = auth.uid())
);

-- Step 7: Create fresh policies for USER_PROFILES
CREATE POLICY "profile_insert" ON user_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profile_update" ON user_profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profile_select_all" ON user_profiles FOR SELECT TO authenticated USING (true);

-- Step 8: Verify all policies
SELECT 
    tablename, 
    policyname, 
    cmd,
    CASE 
        WHEN qual IS NOT NULL THEN 'USING: ' || qual 
        ELSE 'No USING clause' 
    END as using_clause,
    CASE 
        WHEN with_check IS NOT NULL THEN 'WITH CHECK: ' || with_check 
        ELSE 'No WITH CHECK clause' 
    END as with_check_clause
FROM pg_policies
WHERE tablename IN ('predictions', 'prediction_history', 'user_profiles')
ORDER BY tablename, policyname;

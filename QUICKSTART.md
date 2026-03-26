# ⚡ Quick Setup

## 1. Install Dependencies
```bash
npm install
```

## 2. Setup Supabase

1. Create account at https://supabase.com
2. Create new project
3. Go to **SQL Editor** and run:

```sql
-- User profiles
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all profiles" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- Predictions
CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  match_id TEXT NOT NULL,
  predicted_team TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  is_final BOOLEAN DEFAULT TRUE,
  edit_count INTEGER DEFAULT 0 CHECK (edit_count <= 2),
  UNIQUE(user_id, match_id)
);

-- History
CREATE TABLE prediction_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prediction_id UUID REFERENCES predictions(id) ON DELETE CASCADE,
  previous_team TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_history ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view all predictions" ON predictions FOR SELECT USING (true);
CREATE POLICY "Users can insert own predictions" ON predictions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own predictions" ON predictions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view all history" ON prediction_history FOR SELECT USING (true);
CREATE POLICY "Users can insert history" ON prediction_history FOR INSERT WITH CHECK (true);

-- Indexes
CREATE INDEX idx_predictions_user_id ON predictions(user_id);
CREATE INDEX idx_predictions_match_id ON predictions(match_id);
```

## 3. Configure Environment

Get your Supabase credentials:
- Settings → API → Project URL
- Settings → API → anon public key

Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_full_anon_key_here
```

## 4. Run App
```bash
npm run dev
```

Open http://localhost:3000

## 5. Create Account

1. Click "Sign up"
2. Enter name, email, password
3. Check email for verification
4. Login

## Deploy to Vercel

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/LaryCodes/myPSL.git
git push -u origin main
```

Then:
1. Go to vercel.com
2. Import GitHub repo
3. Add environment variables
4. Deploy

Done!

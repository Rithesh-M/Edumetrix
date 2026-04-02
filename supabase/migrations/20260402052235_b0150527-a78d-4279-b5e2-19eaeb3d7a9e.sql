
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('student', 'parent', 'admin');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    name TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    gender TEXT,
    nickname TEXT,
    bio TEXT,
    pronouns TEXT,
    profile_picture_url TEXT,
    parent_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Parents can view linked student profiles" ON public.profiles FOR SELECT USING (
  parent_id = auth.uid()
);

-- Activities table
CREATE TABLE public.activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    study_hours NUMERIC(4,1) NOT NULL DEFAULT 0,
    assignments_completed INTEGER NOT NULL DEFAULT 0,
    coding_practice_hours NUMERIC(4,1) NOT NULL DEFAULT 0,
    exercise_minutes INTEGER NOT NULL DEFAULT 0,
    productivity_score NUMERIC(5,2) DEFAULT 0,
    subject_wise_breakdown JSONB DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(student_id, date)
);
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can manage own activities" ON public.activities FOR ALL USING (auth.uid() = student_id);
CREATE POLICY "Parents can view linked student activities" ON public.activities FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = activities.student_id AND p.parent_id = auth.uid())
);

-- Subject slots table
CREATE TABLE public.subject_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    subject_name TEXT NOT NULL,
    allocated_hours NUMERIC(4,1) NOT NULL DEFAULT 0,
    actual_hours NUMERIC(4,1) NOT NULL DEFAULT 0,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.subject_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can manage own subject slots" ON public.subject_slots FOR ALL USING (auth.uid() = student_id);
CREATE POLICY "Parents can view linked student subject slots" ON public.subject_slots FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = subject_slots.student_id AND p.parent_id = auth.uid())
);

-- Streaks table
CREATE TABLE public.streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    last_active_date DATE,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can manage own streaks" ON public.streaks FOR ALL USING (auth.uid() = student_id);
CREATE POLICY "Parents can view linked student streaks" ON public.streaks FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = streaks.student_id AND p.parent_id = auth.uid())
);

-- Goals table
CREATE TABLE public.goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    target_value NUMERIC(10,2),
    current_value NUMERIC(10,2) DEFAULT 0,
    goal_type TEXT NOT NULL DEFAULT 'study_hours',
    deadline DATE,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can manage own goals" ON public.goals FOR ALL USING (auth.uid() = student_id);
CREATE POLICY "Parents can view linked student goals" ON public.goals FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = goals.student_id AND p.parent_id = auth.uid())
);

-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON public.activities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_streaks_updated_at BEFORE UPDATE ON public.streaks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON public.goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''), NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-create streak record on signup  
CREATE OR REPLACE FUNCTION public.handle_new_streak()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.streaks (student_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created_streak
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_streak();

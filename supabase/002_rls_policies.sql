-- ==============================================================================
-- 002_rls_policies.sql
-- Row Level Security Policies for profiles, user_favorites, recommendation_histories
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_histories ENABLE ROW LEVEL SECURITY;

-- 1. profiles
CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE USING (id = auth.uid() OR public.is_admin());

-- 2. user_favorites
CREATE POLICY "user_favorites_select_policy" ON public.user_favorites
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "user_favorites_insert_policy" ON public.user_favorites
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_favorites_delete_policy" ON public.user_favorites
  FOR DELETE USING (user_id = auth.uid());

-- 3. recommendation_histories
CREATE POLICY "recommendation_histories_select_policy" ON public.recommendation_histories
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "recommendation_histories_insert_policy" ON public.recommendation_histories
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "recommendation_histories_delete_policy" ON public.recommendation_histories
  FOR DELETE USING (user_id = auth.uid());

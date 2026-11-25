-- Additive: widen the allowed challenge categories. Existing rows keep their values.
alter table public.challenges drop constraint if exists challenges_category_check;
alter table public.challenges add constraint challenges_category_check
  check (category in ('fitness', 'productivity', 'discipline', 'lifestyle', 'learning', 'money', 'social',
                      'health', 'creativity', 'music', 'mindfulness', 'custom'));

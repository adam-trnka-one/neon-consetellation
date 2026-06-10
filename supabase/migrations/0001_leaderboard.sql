-- Neon Constellations leaderboard schema.
--
-- RLS tradeoff: the app uses the anon key with no auth, so policies can only
-- constrain row *shape* (CHECK constraints, append-only scores), not row
-- ownership — anyone could forge a score or rename a player. Acceptable for a
-- casual global leaderboard. Upgrade path: enable Supabase anonymous sign-ins
-- and use auth.uid() as players.id, which makes these same policies
-- ownership-enforcing with minimal client changes.

create extension if not exists pgcrypto;

create table public.players (
  id         uuid primary key,
  nickname   text not null default 'Anonymous'
             check (char_length(nickname) between 2 and 24),
  created_at timestamptz not null default now()
);

create table public.scores (
  id         uuid primary key default gen_random_uuid(),
  player_id  uuid not null references public.players(id) on delete cascade,
  mode       text not null default 'single' check (mode in ('single', 'multi')),
  score      integer not null check (score >= 0 and score <= 1000000),
  won        boolean not null,
  map_size   text not null check (map_size in ('small', 'medium', 'large')),
  duration_s integer not null check (duration_s > 0 and duration_s < 7200),
  breakdown  jsonb not null default '[]',
  created_at timestamptz not null default now()
);

-- leaderboard rank + pagination ordering
create index scores_mode_score_idx on public.scores (mode, score desc, created_at asc);
-- player profile drawer
create index scores_player_idx on public.scores (player_id, created_at desc);
-- nickname search
create index players_nick_idx on public.players (lower(nickname));

alter table public.players enable row level security;
alter table public.scores enable row level security;

create policy "read players" on public.players for select using (true);
create policy "read scores" on public.scores for select using (true);
create policy "insert player" on public.players for insert with check (true);
create policy "rename player" on public.players for update using (true)
  with check (char_length(nickname) between 2 and 24);
create policy "insert score" on public.scores for insert with check (true);
-- no update/delete policies on scores: append-only

-- rank lookup without fetching all rows
create or replace function public.get_rank(p_mode text, p_score int)
returns bigint
language sql
stable
as $$
  select count(*) + 1 from public.scores where mode = p_mode and score > p_score
$$;

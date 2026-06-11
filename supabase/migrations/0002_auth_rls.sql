-- Tighten RLS now that account login (email/Google) exists: authenticated
-- users can only write their own rows. The anonymous no-login flow keeps the
-- permissive legacy path (role `anon`), so the game still works logged out.

drop policy "insert player" on public.players;
drop policy "rename player" on public.players;
drop policy "insert score" on public.scores;

create policy "anon insert player" on public.players
  for insert to anon with check (true);
create policy "auth insert own player" on public.players
  for insert to authenticated with check (id = auth.uid());

create policy "anon rename player" on public.players
  for update to anon using (true)
  with check (char_length(nickname) between 2 and 24);
create policy "auth rename own player" on public.players
  for update to authenticated using (id = auth.uid())
  with check (id = auth.uid() and char_length(nickname) between 2 and 24);

create policy "anon insert score" on public.scores
  for insert to anon with check (true);
create policy "auth insert own score" on public.scores
  for insert to authenticated with check (player_id = auth.uid());

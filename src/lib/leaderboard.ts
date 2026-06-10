import { computeScore } from '../game/score'
import type { MatchResult } from '../game/types'
import { supabase } from './supabase'

export type LeaderboardMode = 'single' | 'multi'

export const PAGE_SIZE = 25

export interface ScoreRow {
  id: string
  playerId: string
  nickname: string
  score: number
  won: boolean
  mode: LeaderboardMode
  mapSize: string
  durationS: number
  breakdown: unknown
  createdAt: string
}

const SCORE_COLUMNS =
  'id, player_id, score, won, mode, map_size, duration_s, breakdown, created_at, players!inner(nickname)'

function toRow(raw: Record<string, unknown>): ScoreRow {
  const players = raw.players as { nickname?: string } | { nickname?: string }[] | null
  const nickname = Array.isArray(players) ? players[0]?.nickname : players?.nickname
  return {
    id: raw.id as string,
    playerId: raw.player_id as string,
    nickname: nickname ?? 'Anonymous',
    score: raw.score as number,
    won: raw.won as boolean,
    mode: raw.mode as LeaderboardMode,
    mapSize: raw.map_size as string,
    durationS: raw.duration_s as number,
    breakdown: raw.breakdown,
    createdAt: raw.created_at as string,
  }
}

function client() {
  if (!supabase) throw new Error('Leaderboard is not configured')
  return supabase
}

export async function ensurePlayer(playerId: string, nickname: string): Promise<void> {
  const { error } = await client()
    .from('players')
    .upsert({ id: playerId, nickname: nickname || 'Anonymous' })
  if (error) throw error
}

export async function submitScore(
  playerId: string,
  nickname: string,
  result: MatchResult,
): Promise<{ score: number; rank: number }> {
  const score = computeScore(result, result.config)
  await ensurePlayer(playerId, nickname)
  const { error } = await client().from('scores').insert({
    player_id: playerId,
    mode: 'single',
    score,
    won: result.won,
    map_size: result.config.mapSize,
    duration_s: Math.max(1, result.durationS),
    breakdown: result.breakdown,
  })
  if (error) throw error
  const rank = await fetchRank('single', score)
  return { score, rank }
}

export async function fetchRank(mode: LeaderboardMode, score: number): Promise<number> {
  const { data, error } = await client().rpc('get_rank', { p_mode: mode, p_score: score })
  if (error) throw error
  return Number(data)
}

export async function fetchScores(mode: LeaderboardMode, page: number): Promise<ScoreRow[]> {
  const from = (page - 1) * PAGE_SIZE
  const { data, error } = await client()
    .from('scores')
    .select(SCORE_COLUMNS)
    .eq('mode', mode)
    .order('score', { ascending: false })
    .order('created_at', { ascending: true })
    .range(from, from + PAGE_SIZE - 1)
  if (error) throw error
  return (data ?? []).map(toRow)
}

// Exact (case-insensitive) nickname match.
export async function searchNickname(mode: LeaderboardMode, q: string): Promise<ScoreRow[]> {
  const escaped = q.replace(/[%_]/g, '\\$&')
  const { data, error } = await client()
    .from('scores')
    .select(SCORE_COLUMNS)
    .eq('mode', mode)
    .ilike('players.nickname', escaped)
    .order('score', { ascending: false })
    .limit(PAGE_SIZE)
  if (error) throw error
  return (data ?? []).map(toRow)
}

export async function fetchMyBest(
  playerId: string,
  mode: LeaderboardMode,
): Promise<{ score: number; rank: number } | null> {
  const { data, error } = await client()
    .from('scores')
    .select('score')
    .eq('mode', mode)
    .eq('player_id', playerId)
    .order('score', { ascending: false })
    .limit(1)
  if (error) throw error
  if (!data || data.length === 0) return null
  const best = data[0].score as number
  return { score: best, rank: await fetchRank(mode, best) }
}

export interface PlayerProfile {
  nickname: string
  best: ScoreRow[]
  recent: ScoreRow[]
}

export async function fetchPlayerProfile(playerId: string): Promise<PlayerProfile> {
  const base = () =>
    client().from('scores').select(SCORE_COLUMNS).eq('player_id', playerId)
  const [bestRes, recentRes] = await Promise.all([
    base().order('score', { ascending: false }).limit(5),
    base().order('created_at', { ascending: false }).limit(10),
  ])
  if (bestRes.error) throw bestRes.error
  if (recentRes.error) throw recentRes.error
  const best = (bestRes.data ?? []).map(toRow)
  const recent = (recentRes.data ?? []).map(toRow)
  return {
    nickname: best[0]?.nickname ?? recent[0]?.nickname ?? 'Anonymous',
    best,
    recent,
  }
}

export async function updateNickname(playerId: string, nickname: string): Promise<void> {
  await ensurePlayer(playerId, nickname)
  const { error } = await client().from('players').update({ nickname }).eq('id', playerId)
  if (error) throw error
}

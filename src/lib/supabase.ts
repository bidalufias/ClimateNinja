import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface LeaderboardEntry {
  id: string;
  player_name: string;
  score: number;
  items_sliced: number;
  max_combo: number;
  created_at: string;
}

export async function fetchTopScores(limit = 10): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .order('score', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function submitScore(entry: Omit<LeaderboardEntry, 'id' | 'created_at'>): Promise<void> {
  const { error } = await supabase.from('leaderboard').insert([entry]);
  if (error) throw error;
}

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ── ユーザー管理 ──

export async function upsertUser({ lineId, displayName, avatarUrl }) {
  const { data, error } = await supabase
    .from('users')
    .upsert(
      { line_id: lineId, display_name: displayName, avatar_url: avatarUrl },
      { onConflict: 'line_id' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserByLineId(lineId) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('line_id', lineId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

// ── 成績管理 ──

export async function saveQuizResult({ userId, category, totalQuestions, correctAnswers, wrongQuestionIds }) {
  const { data, error } = await supabase
    .from('quiz_results')
    .insert({
      user_id: userId,
      category,
      total_questions: totalQuestions,
      correct_answers: correctAnswers,
      wrong_question_ids: wrongQuestionIds,
      completed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getQuizResults(userId) {
  const { data, error } = await supabase
    .from('quiz_results')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getCategoryStats(userId) {
  const results = await getQuizResults(userId);

  const stats = {};
  results.forEach((r) => {
    if (!stats[r.category]) {
      stats[r.category] = { total: 0, correct: 0, attempts: 0 };
    }
    stats[r.category].total += r.total_questions;
    stats[r.category].correct += r.correct_answers;
    stats[r.category].attempts += 1;
  });

  return stats;
}

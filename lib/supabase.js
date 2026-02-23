import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// supabaseが利用できるかチェック
function requireSupabase() {
  if (!supabase) throw new Error('Supabase is not configured');
  return supabase;
}

// ── ユーザー管理 ──

export async function upsertUser({ lineId, displayName, avatarUrl }) {
  const db = requireSupabase();
  const { data, error } = await db
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
  const db = requireSupabase();
  const { data, error } = await db
    .from('users')
    .select('*')
    .eq('line_id', lineId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

// ── 成績管理 ──

export async function saveQuizResult({ userId, category, totalQuestions, correctAnswers, wrongQuestionIds }) {
  const db = requireSupabase();
  const { data, error } = await db
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
  const db = requireSupabase();
  const { data, error } = await db
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

// 苦手問題IDリストを返す（直近30件の結果から集計）
export async function getWeakQuestionIds(userId) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('quiz_results')
    .select('wrong_question_ids')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
    .limit(30);

  if (error) throw error;
  if (!data || data.length === 0) return [];

  const wrongCount = {};
  data.forEach((r) => {
    if (Array.isArray(r.wrong_question_ids)) {
      r.wrong_question_ids.forEach((id) => {
        wrongCount[id] = (wrongCount[id] || 0) + 1;
      });
    }
  });

  return Object.entries(wrongCount)
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => Number(id));
}

// ── リーダーボード（Phase3） ──

// 全ユーザーの直近スコアを集計してランキングを返す
export async function getLeaderboard(limit = 20) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('quiz_results')
    .select('user_id, total_questions, correct_answers, completed_at, users(display_name, avatar_url)')
    .order('completed_at', { ascending: false })
    .limit(200); // 直近200件から集計

  if (error) throw error;
  if (!data) return [];

  // ユーザーごとに集計
  const userMap = {};
  data.forEach((r) => {
    const uid = r.user_id;
    if (!userMap[uid]) {
      userMap[uid] = {
        userId: uid,
        name: r.users?.display_name || '匿名',
        avatar: r.users?.avatar_url || '',
        total: 0,
        correct: 0,
        attempts: 0,
        lastAt: r.completed_at,
      };
    }
    userMap[uid].total += r.total_questions;
    userMap[uid].correct += r.correct_answers;
    userMap[uid].attempts += 1;
    if (r.completed_at > userMap[uid].lastAt) {
      userMap[uid].lastAt = r.completed_at;
    }
  });

  return Object.values(userMap)
    .filter(u => u.total >= 10) // 最低10問以上解いたユーザーのみ
    .map(u => ({
      ...u,
      rate: Math.round((u.correct / u.total) * 100),
    }))
    .sort((a, b) => b.rate - a.rate || b.total - a.total) // 正答率→総問題数の順
    .slice(0, limit);
}

import { NextResponse } from 'next/server';
import { getLeaderboard } from '@/lib/supabase';

// GET: リーダーボード取得（公開API）
export async function GET() {
  try {
    const board = await getLeaderboard(20);
    return NextResponse.json({ data: board });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}

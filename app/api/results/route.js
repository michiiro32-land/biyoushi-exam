import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserByLineId, saveQuizResult, getQuizResults, getCategoryStats, getWeakQuestionIds } from '@/lib/supabase';

// POST: 成績を保存
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.lineId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserByLineId(session.user.lineId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { category, totalQuestions, correctAnswers, wrongQuestionIds } = body;

    const result = await saveQuizResult({
      userId: user.id,
      category,
      totalQuestions,
      correctAnswers,
      wrongQuestionIds,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error saving result:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET: 成績を取得
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.lineId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUserByLineId(session.user.lineId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'stats') {
      const stats = await getCategoryStats(user.id);
      return NextResponse.json({ data: stats });
    }

    if (type === 'weak') {
      const weakIds = await getWeakQuestionIds(user.id);
      return NextResponse.json({ data: weakIds });
    }

    const results = await getQuizResults(user.id);
    return NextResponse.json({ data: results });
  } catch (error) {
    console.error('Error fetching results:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

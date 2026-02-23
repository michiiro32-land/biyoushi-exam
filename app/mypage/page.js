'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ResultChart from '@/components/ResultChart';
import { CATEGORIES, CATEGORY_ICONS } from '@/lib/questions';
import Link from 'next/link';

export default function MyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({});
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status !== 'authenticated') return;

    Promise.all([
      fetch('/api/results?type=stats').then((r) => r.json()),
      fetch('/api/results').then((r) => r.json()),
    ])
      .then(([statsRes, historyRes]) => {
        if (statsRes.data) setStats(statsRes.data);
        if (historyRes.data) setHistory(historyRes.data.slice(0, 20));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [status, router]);

  if (status === 'loading' || loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #f5f3ff 100%)' }}
      >
        <div className="text-pink-400 text-lg animate-pulse">読み込み中...</div>
      </div>
    );
  }

  if (!session?.user) return null;

  const totalQuestions = Object.values(stats).reduce((s, c) => s + (c.total || 0), 0);
  const totalCorrect = Object.values(stats).reduce((s, c) => s + (c.correct || 0), 0);
  const overallRate = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const totalAttempts = Object.values(stats).reduce((s, c) => s + (c.attempts || 0), 0);

  // 学習日数（ユニークな日付数）
  const uniqueDays = new Set(
    history.map((h) => new Date(h.completed_at).toLocaleDateString('ja-JP'))
  ).size;

  // 苦手分野（正答率が低い順）
  const weakCategories = CATEGORIES
    .filter((cat) => stats[cat]?.total > 0)
    .map((cat) => ({
      name: cat,
      rate: Math.round((stats[cat].correct / stats[cat].total) * 100),
    }))
    .sort((a, b) => a.rate - b.rate)
    .slice(0, 3);

  return (
    <div
      className="min-h-screen pb-8"
      style={{ background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #f5f3ff 100%)' }}
    >
      <Header />

      <div className="max-w-lg mx-auto pt-4">
        {/* プロフィール */}
        <div className="mx-4 mb-6 p-5 rounded-2xl bg-white/90 text-center">
          {session.user.image ? (
            <img
              src={session.user.image}
              alt=""
              className="w-20 h-20 rounded-full mx-auto border-4 border-pink-200 mb-3"
            />
          ) : (
            <div className="w-20 h-20 rounded-full mx-auto mb-3 bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center text-white text-2xl font-bold">
              {(session.user.name || 'U')[0]}
            </div>
          )}
          <h2 className="text-lg font-bold text-indigo-950">{session.user.name}</h2>
          <p className="text-xs text-purple-400 mt-1">マイページ</p>
        </div>

        {/* サマリーカード */}
        <div className="mx-4 mb-6 grid grid-cols-3 gap-3">
          {[
            { label: '総合正答率', value: `${overallRate}%`, color: 'text-pink-600' },
            { label: '学習日数', value: `${uniqueDays}日`, color: 'text-purple-600' },
            { label: '演習回数', value: `${totalAttempts}回`, color: 'text-indigo-600' },
          ].map((item) => (
            <div key={item.label} className="p-3 rounded-xl bg-white/90 text-center">
              <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
              <div className="text-xs text-gray-500 mt-1">{item.label}</div>
            </div>
          ))}
        </div>

        {/* レーダーチャート */}
        {Object.keys(stats).length >= 3 && (
          <div className="mx-4 mb-6 p-4 rounded-2xl bg-white/90">
            <h3 className="font-bold text-sm text-purple-800 mb-3 text-center">分野別正答率</h3>
            <ResultChart categoryStats={stats} />
          </div>
        )}

        {/* 苦手分野 */}
        {weakCategories.length > 0 && (
          <div className="mx-4 mb-6 p-4 rounded-2xl bg-white/90">
            <h3 className="font-bold text-sm text-red-600 mb-3">🔥 苦手分野TOP3</h3>
            <div className="space-y-2">
              {weakCategories.map((wc, i) => (
                <div key={wc.name} className="flex items-center gap-3 p-2 rounded-xl bg-red-50">
                  <span className="text-lg font-bold text-red-400">#{i + 1}</span>
                  <span className="text-sm flex-1">
                    {CATEGORY_ICONS[wc.name]} {wc.name}
                  </span>
                  <span
                    className="text-sm font-bold"
                    style={{ color: wc.rate >= 50 ? '#d97706' : '#dc2626' }}
                  >
                    {wc.rate}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 学習履歴 */}
        {history.length > 0 && (
          <div className="mx-4 mb-6 p-4 rounded-2xl bg-white/90">
            <h3 className="font-bold text-sm text-purple-800 mb-3">📋 直近の学習履歴</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {history.map((h) => {
                const rate = h.total_questions > 0
                  ? Math.round((h.correct_answers / h.total_questions) * 100)
                  : 0;
                const date = new Date(h.completed_at);
                return (
                  <div
                    key={h.id}
                    className="flex items-center gap-3 p-2 rounded-xl bg-purple-50"
                  >
                    <span className="text-xs text-gray-400 w-16 flex-shrink-0">
                      {date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-xs flex-1 truncate">
                      {CATEGORY_ICONS[h.category]} {h.category}
                    </span>
                    <span
                      className="text-xs font-bold"
                      style={{ color: rate >= 70 ? '#059669' : rate >= 50 ? '#d97706' : '#dc2626' }}
                    >
                      {rate}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 演習へ */}
        <div className="px-4">
          <Link
            href="/"
            className="block w-full py-4 rounded-2xl text-white font-bold text-base text-center shadow-lg active:scale-95 transition-transform"
            style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
          >
            📝 演習を始める
          </Link>
        </div>
      </div>
    </div>
  );
}

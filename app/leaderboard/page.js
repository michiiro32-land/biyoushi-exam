'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

const MEDAL = ['🥇', '🥈', '🥉'];
const RANK_COLORS = ['#f59e0b', '#9ca3af', '#b45309'];

function RankBadge({ rank }) {
  if (rank <= 3) return <span className="text-2xl">{MEDAL[rank - 1]}</span>;
  return (
    <span className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-sm font-bold text-purple-600">
      {rank}
    </span>
  );
}

function ScoreBar({ rate }) {
  const color = rate >= 85 ? '#10b981' : rate >= 70 ? '#a855f7' : rate >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div className="w-full h-1.5 rounded-full bg-gray-100 mt-1">
      <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${rate}%`, background: color }} />
    </div>
  );
}

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overall');

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(r => r.json())
      .then(res => {
        if (res.data) setBoard(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const myEntry = session?.user
    ? board.find(u => u.name === session.user.name)
    : null;
  const myRank = myEntry ? board.indexOf(myEntry) + 1 : null;

  return (
    <div
      className="min-h-screen pb-10"
      style={{ background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #f5f3ff 100%)' }}
    >
      {/* ヘッダー */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        <Link href="/" className="w-9 h-9 rounded-full bg-white/80 flex items-center justify-center text-lg">
          ←
        </Link>
        <div>
          <h1 className="text-lg font-bold text-pink-700">🏆 ランキング</h1>
          <p className="text-xs text-purple-500">10問以上解いたユーザーが対象</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4">
        {/* 自分の順位（ログイン時） */}
        {session?.user && (
          <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-pink-100 to-purple-100">
            {myEntry ? (
              <div className="flex items-center gap-3">
                <RankBadge rank={myRank} />
                <div className="flex-1">
                  <p className="text-xs text-purple-600 font-bold">あなたの順位</p>
                  <p className="text-base font-bold text-indigo-950">{myRank}位 / {board.length}人中</p>
                  <p className="text-xs text-gray-500">正答率 {myEntry.rate}% · {myEntry.total}問解答</p>
                </div>
                <div className="text-3xl font-bold" style={{ color: myEntry.rate >= 80 ? '#059669' : '#d97706' }}>
                  {myEntry.rate}%
                </div>
              </div>
            ) : (
              <div className="text-center py-2">
                <p className="text-sm text-purple-600">まだランキング入りしていません</p>
                <p className="text-xs text-gray-400 mt-1">10問以上解くとランキングに表示されます</p>
                <Link href="/" className="inline-block mt-2 px-4 py-1.5 rounded-full text-xs font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
                  演習を始める →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* タブ */}
        <div className="flex gap-2 mb-4">
          {[
            { id: 'overall', label: '🌟 総合' },
            { id: 'active', label: '🔥 演習数' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                tab === t.id ? 'bg-pink-500 text-white shadow' : 'bg-white/70 text-purple-600'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ランキング本体 */}
        {loading ? (
          <div className="text-center py-10 text-pink-300 animate-pulse text-lg">読み込み中...</div>
        ) : board.length === 0 ? (
          <div className="bg-white/90 rounded-2xl p-8 text-center">
            <p className="text-4xl mb-3">🌱</p>
            <p className="text-sm font-bold text-purple-700">まだランキングデータがありません</p>
            <p className="text-xs text-gray-400 mt-1">最初の挑戦者になろう！</p>
            <Link href="/" className="inline-block mt-4 px-6 py-2 rounded-full text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}>
              演習を始める
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {/* 上位3人 - カード表示 */}
            {board.slice(0, 3).length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[board[1], board[0], board[2]].filter(Boolean).map((u, i) => {
                  const rank = i === 0 ? 2 : i === 1 ? 1 : 3;
                  const heights = ['h-24', 'h-32', 'h-20'];
                  const actualHeightIdx = i;
                  return (
                    <div key={u.userId} className={`bg-white/90 rounded-2xl p-3 text-center flex flex-col items-center justify-end ${heights[actualHeightIdx]}`}
                      style={{ boxShadow: rank === 1 ? '0 0 0 2px #f59e0b' : undefined }}>
                      {u.avatar ? (
                        <img src={u.avatar} alt="" className="w-9 h-9 rounded-full border-2 border-pink-200 mb-1" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center text-white text-sm font-bold mb-1">
                          {(u.name || '?')[0]}
                        </div>
                      )}
                      <p className="text-xs font-bold text-gray-700 truncate w-full">{u.name}</p>
                      <p className="text-lg font-bold" style={{ color: RANK_COLORS[rank - 1] }}>{u.rate}%</p>
                      <p className="text-lg">{MEDAL[rank - 1]}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 4位以下リスト */}
            {(tab === 'overall' ? board : [...board].sort((a, b) => b.attempts - a.attempts))
              .slice(3).map((u, i) => {
                const rank = tab === 'overall' ? i + 4 :
                  [...board].sort((a, b) => b.attempts - a.attempts).indexOf(u) + 1;
                const isMe = session?.user && u.name === session.user.name;
                return (
                  <div key={u.userId}
                    className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${
                      isMe ? 'bg-pink-50 border border-pink-200' : 'bg-white/85'
                    }`}>
                    <span className="text-sm font-bold text-gray-400 w-6 text-center">{rank}</span>
                    {u.avatar ? (
                      <img src={u.avatar} alt="" className="w-9 h-9 rounded-full border-2 border-purple-100 flex-shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-300 to-purple-300 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {(u.name || '?')[0]}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">
                        {u.name} {isMe && <span className="text-xs text-pink-500">（あなた）</span>}
                      </p>
                      <p className="text-xs text-gray-400">{u.attempts}回演習 · {u.total}問解答</p>
                      <ScoreBar rate={u.rate} />
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-base font-bold"
                        style={{ color: u.rate >= 85 ? '#059669' : u.rate >= 70 ? '#a855f7' : '#f59e0b' }}>
                        {tab === 'active' ? `${u.attempts}回` : `${u.rate}%`}
                      </p>
                      <p className="text-xs text-gray-400">{tab === 'active' ? `正答率${u.rate}%` : `${u.total}問`}</p>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* ログインCTA */}
        {!session?.user && (
          <div className="mt-6 p-4 bg-white/90 rounded-2xl text-center">
            <p className="text-sm font-bold text-purple-700 mb-1">ランキングに参加しよう！</p>
            <p className="text-xs text-gray-500 mb-3">LINEでログインして成績を記録するとランキングに表示されます</p>
            <Link href="/login"
              className="inline-block px-6 py-2.5 rounded-full text-sm font-bold text-white"
              style={{ background: '#06C755' }}>
              LINEでログイン
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

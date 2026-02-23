'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Header from '@/components/Header';
import { QUESTIONS, CATEGORIES, CATEGORY_ICONS, shuffle, getWeakQuestions } from '@/lib/questions';
import QuizCard from '@/components/QuizCard';

// ============================================================
// ホーム画面
// ============================================================
function HomeScreen({ onStart, stats, isLoggedIn, weakQuestionIds = [] }) {
  const totalAnswered = Object.values(stats).reduce((s, c) => s + c.total, 0);
  const totalCorrect = Object.values(stats).reduce((s, c) => s + c.correct, 0);
  const overallRate = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  return (
    <div>
      {/* 総合成績 */}
      {totalAnswered > 0 && (
        <div className="mx-4 mb-6 p-4 rounded-2xl bg-white/80 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-purple-800">総合成績</span>
            <span className="text-sm font-bold text-pink-700">
              {totalCorrect}/{totalAnswered}問 ({overallRate}%)
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-purple-100">
            <div
              className="h-3 rounded-full transition-all duration-500"
              style={{
                width: `${overallRate}%`,
                background: 'linear-gradient(90deg, #ec4899, #a855f7)',
              }}
            />
          </div>
        </div>
      )}

      {/* ゲスト注意書き */}
      {!isLoggedIn && totalAnswered > 0 && (
        <div className="mx-4 mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200">
          <p className="text-xs text-amber-700">
            ⚠️ ゲストモードのため成績は保存されません。
            <Link href="/login" className="underline font-bold ml-1">
              LINEでログイン
            </Link>
            すると学習記録が保存されます。
          </p>
        </div>
      )}

      {/* 全分野ランダム */}
      <div className="px-4 mb-6">
        <button
          onClick={() => onStart(null)}
          className="w-full py-4 rounded-2xl text-white font-bold text-lg shadow-lg active:scale-95 transition-transform"
          style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
        >
          🎲 全分野ランダム演習
        </button>
      </div>

      {/* 苦手問題練習 */}
      {isLoggedIn && weakQuestionIds.length > 0 && (
        <div className="px-4 mb-4">
          <button
            onClick={() => onStart('weak')}
            className="w-full py-4 rounded-2xl text-white font-bold text-lg shadow-lg active:scale-95 transition-transform"
            style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)' }}
          >
            🔥 苦手問題を集中練習 ({weakQuestionIds.length}問)
          </button>
        </div>
      )}

      {/* 分野別 */}
      <div className="px-4 pb-8 space-y-3">
        <h2 className="text-lg font-bold text-purple-800 mb-2">分野別演習</h2>
        {CATEGORIES.map((cat) => {
          const catQuestions = QUESTIONS.filter((q) => q.category === cat);
          const catStat = stats[cat] || { total: 0, correct: 0 };
          const rate = catStat.total > 0 ? Math.round((catStat.correct / catStat.total) * 100) : null;
          return (
            <button
              key={cat}
              onClick={() => onStart(cat)}
              className="w-full p-4 rounded-2xl text-left flex items-center gap-3 active:scale-[0.98] transition-transform bg-white/85 backdrop-blur-sm"
            >
              <span className="text-3xl">{CATEGORY_ICONS[cat]}</span>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-indigo-950">{cat}</div>
                <div className="text-xs mt-1 text-purple-600">
                  {catQuestions.length}問
                  {rate !== null && (
                    <span
                      className="ml-2"
                      style={{
                        color: rate >= 80 ? '#059669' : rate >= 50 ? '#d97706' : '#dc2626',
                      }}
                    >
                      正答率 {rate}%
                    </span>
                  )}
                </div>
              </div>
              <span className="text-purple-400">▶</span>
            </button>
          );
        })}
      </div>

      <div className="text-center pb-6 text-xs text-purple-300">
        問題データは学習用サンプルです
      </div>
    </div>
  );
}

// ============================================================
// クイズ画面
// ============================================================
function QuizScreen({ questions, onFinish, onBack }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [answers, setAnswers] = useState([]);

  const q = questions[currentIndex];
  const progress = ((currentIndex + (answered ? 1 : 0)) / questions.length) * 100;

  const handleAnswer = (result) => {
    setAnswered(true);
    setAnswers((prev) => [...prev, { question: q, ...result }]);
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      onFinish(answers);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setAnswered(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* ヘッダー */}
      <div className="p-4 flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg bg-white/80"
        >
          ←
        </button>
        <div className="flex-1">
          <div className="text-xs font-semibold text-pink-800">{q.category}</div>
          <div className="text-xs text-purple-400">
            {currentIndex + 1} / {questions.length}
          </div>
        </div>
      </div>

      {/* プログレスバー */}
      <div className="px-4 mb-4">
        <div className="w-full h-2 rounded-full bg-purple-100">
          <div
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #ec4899, #a855f7)',
            }}
          />
        </div>
      </div>

      {/* 問題カード */}
      <div className="px-4 flex-1">
        <QuizCard key={q.id} question={q} onAnswer={handleAnswer} />
      </div>

      {/* 次へ */}
      {answered && (
        <div className="p-4">
          <button
            onClick={handleNext}
            className="w-full py-4 rounded-2xl text-white font-bold text-base shadow-lg active:scale-95 transition-transform"
            style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
          >
            {currentIndex + 1 >= questions.length ? '結果を見る 📊' : '次の問題 →'}
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================================
// 結果画面
// ============================================================
function ResultScreen({ answers, onRetry, onHome, isLoggedIn }) {
  const [saved, setSaved] = useState(false);
  const total = answers.length;
  const correct = answers.filter((a) => a.correct).length;
  const rate = Math.round((correct / total) * 100);

  // 分野別集計
  const categoryStats = {};
  answers.forEach((a) => {
    const cat = a.question.category;
    if (!categoryStats[cat]) categoryStats[cat] = { total: 0, correct: 0 };
    categoryStats[cat].total++;
    if (a.correct) categoryStats[cat].correct++;
  });

  const wrongAnswers = answers.filter((a) => !a.correct);

  // ログイン済みなら成績をAPIに保存
  useEffect(() => {
    if (!isLoggedIn || saved) return;

    const saveResults = async () => {
      try {
        // 分野ごとに保存
        const categories = Object.keys(categoryStats);
        for (const cat of categories) {
          const s = categoryStats[cat];
          const wrongIds = answers
            .filter((a) => a.question.category === cat && !a.correct)
            .map((a) => a.question.id);

          await fetch('/api/results', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              category: cat,
              totalQuestions: s.total,
              correctAnswers: s.correct,
              wrongQuestionIds: wrongIds,
            }),
          });
        }
        setSaved(true);
      } catch (e) {
        console.error('Failed to save results:', e);
      }
    };

    saveResults();
  }, [isLoggedIn]);

  let message = '';
  let emoji = '';
  if (rate >= 90) { message = '素晴らしい！合格レベルです！'; emoji = '🎉'; }
  else if (rate >= 70) { message = '良い調子です！もう少し！'; emoji = '😊'; }
  else if (rate >= 50) { message = '半分正解！復習しましょう'; emoji = '💪'; }
  else { message = '基礎から見直しましょう'; emoji = '📚'; }

  return (
    <div className="min-h-screen pb-8">
      {/* スコア */}
      <div className="text-center pt-8 pb-4 px-4">
        <div className="text-6xl mb-3">{emoji}</div>
        <h2 className="text-2xl font-bold text-pink-700 mb-1">演習結果</h2>
        <p className="text-sm text-purple-600">{message}</p>
      </div>

      {/* スコアカード */}
      <div className="mx-4 mb-6 p-6 rounded-2xl text-center bg-white/90">
        <div
          className="text-5xl font-bold mb-1"
          style={{ color: rate >= 70 ? '#059669' : rate >= 50 ? '#d97706' : '#dc2626' }}
        >
          {rate}%
        </div>
        <div className="text-sm text-gray-500">
          {correct}問正解 / {total}問中
        </div>

        <div className="flex justify-center mt-4">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#f3e8ff" strokeWidth="12" />
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke={rate >= 70 ? '#22c55e' : rate >= 50 ? '#f59e0b' : '#ef4444'}
              strokeWidth="12"
              strokeDasharray={`${(rate / 100) * 314} 314`}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
            />
          </svg>
        </div>

        {isLoggedIn && saved && (
          <p className="text-xs text-green-600 mt-2">✅ 成績を保存しました</p>
        )}
        {!isLoggedIn && (
          <p className="text-xs text-amber-600 mt-2">
            ⚠️ ログインすると成績が保存されます
          </p>
        )}
      </div>

      {/* 分野別 */}
      {Object.keys(categoryStats).length > 1 && (
        <div className="mx-4 mb-6 p-4 rounded-2xl bg-white/90">
          <h3 className="font-bold text-sm text-purple-800 mb-3">分野別成績</h3>
          <div className="space-y-3">
            {Object.entries(categoryStats).map(([cat, stat]) => {
              const catRate = Math.round((stat.correct / stat.total) * 100);
              return (
                <div key={cat}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-700">
                      {CATEGORY_ICONS[cat]} {cat}
                    </span>
                    <span
                      className="font-bold"
                      style={{ color: catRate >= 70 ? '#059669' : catRate >= 50 ? '#d97706' : '#dc2626' }}
                    >
                      {catRate}% ({stat.correct}/{stat.total})
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-purple-100">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${catRate}%`,
                        background: catRate >= 70 ? '#22c55e' : catRate >= 50 ? '#f59e0b' : '#ef4444',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 間違えた問題 */}
      {wrongAnswers.length > 0 && (
        <div className="mx-4 mb-6 p-4 rounded-2xl bg-white/90">
          <h3 className="font-bold text-sm text-red-600 mb-3">❌ 間違えた問題</h3>
          <div className="space-y-3">
            {wrongAnswers.map((a, i) => (
              <div key={i} className="p-3 rounded-xl bg-red-50">
                <p className="text-xs font-medium text-indigo-950 mb-2">{a.question.question}</p>
                <p className="text-xs text-red-600">あなたの回答: {a.question.choices[a.selected]}</p>
                <p className="text-xs text-green-700">正解: {a.question.choices[a.question.correctIndex]}</p>
                <p className="text-xs text-gray-500 mt-1">{a.question.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ボタン */}
      <div className="px-4 space-y-3">
        <button
          onClick={onRetry}
          className="w-full py-4 rounded-2xl text-white font-bold text-base shadow-lg active:scale-95 transition-transform"
          style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
        >
          🔄 もう一度挑戦
        </button>
        <button
          onClick={onHome}
          className="w-full py-4 rounded-2xl font-bold text-base active:scale-95 transition-transform bg-white/85 text-purple-600"
        >
          🏠 ホームに戻る
        </button>
      </div>
    </div>
  );
}

// ============================================================
// メインApp
// ============================================================
export default function Home() {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  const [screen, setScreen] = useState('home');
  const [currentCategory, setCurrentCategory] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [localStats, setLocalStats] = useState(() => {
    const init = {};
    CATEGORIES.forEach((c) => { init[c] = { total: 0, correct: 0 }; });
    return init;
  });
  const [serverStats, setServerStats] = useState(null);
  const [weakQuestionIds, setWeakQuestionIds] = useState([]);

  // ログイン済みならサーバーから成績取得
  useEffect(() => {
    if (!isLoggedIn) return;
    fetch('/api/results?type=stats')
      .then((r) => r.json())
      .then((res) => {
        if (res.data) setServerStats(res.data);
      })
      .catch(console.error);

    // 苦手問題IDを取得
    fetch('/api/results?type=weak')
      .then((r) => r.json())
      .then((res) => {
        if (res.data) setWeakQuestionIds(res.data);
      })
      .catch(console.error);
  }, [isLoggedIn]);

  // サーバーの成績とローカル成績をマージ
  const stats = { ...localStats };
  if (serverStats) {
    CATEGORIES.forEach((cat) => {
      if (serverStats[cat]) {
        stats[cat] = {
          total: (localStats[cat]?.total || 0) + (serverStats[cat]?.total || 0),
          correct: (localStats[cat]?.correct || 0) + (serverStats[cat]?.correct || 0),
        };
      }
    });
  }

  const handleStart = useCallback((category) => {
    let qs;
    if (category === 'weak') {
      // 苦手問題モード
      const weak = getWeakQuestions(weakQuestionIds);
      qs = shuffle(weak.length > 0 ? weak : QUESTIONS);
    } else if (category) {
      qs = shuffle(QUESTIONS.filter((q) => q.category === category));
    } else {
      qs = shuffle(QUESTIONS);
    }
    setCurrentCategory(category);
    setQuizQuestions(qs);
    setQuizAnswers([]);
    setScreen('quiz');
  }, [weakQuestionIds]);

  const handleFinish = useCallback((answers) => {
    setQuizAnswers(answers);
    setLocalStats((prev) => {
      const next = { ...prev };
      answers.forEach((a) => {
        const cat = a.question.category;
        next[cat] = {
          total: (next[cat]?.total || 0) + 1,
          correct: (next[cat]?.correct || 0) + (a.correct ? 1 : 0),
        };
      });
      return next;
    });
    setScreen('result');
  }, []);

  const handleRetry = useCallback(() => {
    handleStart(currentCategory);
  }, [currentCategory, handleStart]);

  const handleHome = useCallback(() => {
    setScreen('home');
  }, []);

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #f5f3ff 100%)' }}
    >
      {screen === 'home' && <Header />}

      <div className="max-w-lg mx-auto">
        {screen === 'home' && (
          <>
            <div className="text-center pt-6 pb-4 px-4">
              <h1 className="text-2xl font-bold text-pink-700">
                ✨ 美容師国試対策 ✨
              </h1>
              <p className="mt-1 text-xs text-pink-600">国家試験 筆記対策問題集</p>
            </div>
            <HomeScreen onStart={handleStart} stats={stats} isLoggedIn={isLoggedIn} weakQuestionIds={weakQuestionIds} />
          </>
        )}

        {screen === 'quiz' && (
          <QuizScreen questions={quizQuestions} onFinish={handleFinish} onBack={handleHome} />
        )}

        {screen === 'result' && (
          <ResultScreen
            answers={quizAnswers}
            onRetry={handleRetry}
            onHome={handleHome}
            isLoggedIn={isLoggedIn}
          />
        )}
      </div>
    </div>
  );
}

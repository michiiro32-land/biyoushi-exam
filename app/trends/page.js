'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, RadarChart,
  PolarGrid, PolarAngleAxis, Radar,
} from 'recharts';
import { QUESTIONS, CATEGORIES, CATEGORY_ICONS } from '@/lib/questions';

const COLORS = ['#ec4899','#a855f7','#6366f1','#3b82f6','#06b6d4','#10b981','#f59e0b'];

const EXAM_COLORS = {
  '第52回': '#ec4899',
  '第51回': '#a855f7',
  '第47回': '#6366f1',
  '第45回': '#3b82f6',
  '手動': '#94a3b8',
};

export default function TrendsPage() {
  const [activeTab, setActiveTab] = useState('category');

  // カテゴリ別問題数
  const categoryData = useMemo(() => {
    return CATEGORIES.map((cat, i) => ({
      name: cat.replace('美容の', ''),
      icon: CATEGORY_ICONS[cat],
      count: QUESTIONS.filter(q => q.category === cat).length,
      fill: COLORS[i],
    }));
  }, []);

  // 試験回 × カテゴリ のクロス集計
  const examCategories = useMemo(() => {
    const exams = ['第45回', '第47回', '第51回', '第52回'];
    return CATEGORIES.map((cat, ci) => {
      const row = { category: cat.replace('美容の', '').replace('関係法規・', '法規'), icon: CATEGORY_ICONS[cat] };
      exams.forEach(exam => {
        row[exam] = QUESTIONS.filter(q => q.exam === exam && q.category === cat).length;
      });
      return row;
    });
  }, []);

  // ラーダーチャート用（試験回ごとのカテゴリ分布）
  const radarData = useMemo(() => {
    const exams = ['第45回', '第47回', '第51回', '第52回'];
    return CATEGORIES.map(cat => {
      const row = { category: cat.replace('美容の物理・化学', '物理化学').replace('美容技術理論', '技術理論').replace('関係法規・制度', '法規制度') };
      exams.forEach(exam => {
        row[exam] = QUESTIONS.filter(q => q.exam === exam && q.category === cat).length;
      });
      return row;
    });
  }, []);

  // 出題傾向スコア（合格には各科目満遍なく必要）
  const trendInsights = useMemo(() => {
    const insights = CATEGORIES.map(cat => {
      const qs = QUESTIONS.filter(q => q.category === cat && q.exam);
      const exams = [...new Set(qs.map(q => q.exam))];
      const avgPerExam = exams.length > 0 ? qs.length / exams.length : 0;
      return { category: cat, avgPerExam: Math.round(avgPerExam * 10) / 10, total: qs.length };
    });
    return insights.sort((a, b) => b.avgPerExam - a.avgPerExam);
  }, []);

  return (
    <div
      className="min-h-screen pb-10"
      style={{ background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #f5f3ff 100%)' }}
    >
      {/* ヘッダー */}
      <div className="px-4 pt-4 pb-2 flex items-center gap-3">
        <Link href="/" className="w-9 h-9 rounded-full bg-white/80 flex items-center justify-center text-lg">
          ←
        </Link>
        <div>
          <h1 className="text-lg font-bold text-pink-700">📈 出題傾向分析</h1>
          <p className="text-xs text-purple-500">第45・47・51・52回のデータ</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4">
        {/* タブ */}
        <div className="flex gap-2 mb-5 mt-2">
          {[
            { id: 'category', label: '📊 分野別' },
            { id: 'exam', label: '🔄 回別推移' },
            { id: 'radar', label: '🕸️ レーダー' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-pink-500 text-white shadow'
                  : 'bg-white/70 text-purple-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 分野別グラフ */}
        {activeTab === 'category' && (
          <div className="space-y-4">
            <div className="bg-white/90 rounded-2xl p-4">
              <h2 className="text-sm font-bold text-purple-800 mb-3">分野別 出題数（全{QUESTIONS.length}問）</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={categoryData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3e8ff" />
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v) => [`${v}問`, '出題数']} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {categoryData.map((d, i) => (
                      <Cell key={i} fill={d.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 分野別詳細 */}
            <div className="bg-white/90 rounded-2xl p-4">
              <h2 className="text-sm font-bold text-purple-800 mb-3">分野別 問題数ランキング</h2>
              <div className="space-y-2">
                {categoryData.sort((a,b) => b.count - a.count).map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="text-lg w-7">{d.icon}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-700">{d.name}</span>
                        <span className="font-bold" style={{ color: d.fill }}>{d.count}問</span>
                      </div>
                      <div className="h-2 rounded-full bg-purple-100">
                        <div className="h-2 rounded-full" style={{
                          width: `${(d.count / categoryData[0].count) * 100}%`,
                          background: d.fill
                        }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 試験1回あたりの平均出題数 */}
            <div className="bg-white/90 rounded-2xl p-4">
              <h2 className="text-sm font-bold text-purple-800 mb-1">📌 1回の試験あたり平均出題数</h2>
              <p className="text-xs text-gray-400 mb-3">（第45・47・51・52回の平均）</p>
              <div className="space-y-2">
                {trendInsights.map((t, i) => (
                  <div key={t.category} className="flex items-center justify-between text-xs">
                    <span className="text-gray-700">{CATEGORY_ICONS[t.category]} {t.category}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 rounded-full bg-purple-100">
                        <div className="h-2 rounded-full bg-pink-400" style={{
                          width: `${(t.avgPerExam / 15) * 100}%`
                        }} />
                      </div>
                      <span className="font-bold text-pink-600 w-10 text-right">
                        {t.avgPerExam}問
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 回別推移 */}
        {activeTab === 'exam' && (
          <div className="space-y-4">
            <div className="bg-white/90 rounded-2xl p-4">
              <h2 className="text-sm font-bold text-purple-800 mb-3">分野 × 試験回 クロス集計</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-purple-50">
                      <th className="text-left p-2 text-purple-700">分野</th>
                      {['第45回','第47回','第51回','第52回'].map(e => (
                        <th key={e} className="text-center p-2 text-purple-700">{e.replace('第','').replace('回','回')}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {examCategories.map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-purple-50/30'}>
                        <td className="p-2 text-gray-700">{row.icon} {row.category}</td>
                        {['第45回','第47回','第51回','第52回'].map(e => (
                          <td key={e} className="text-center p-2 font-bold"
                            style={{ color: row[e] >= 15 ? '#ec4899' : row[e] >= 10 ? '#a855f7' : '#6b7280' }}>
                            {row[e] || 0}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-400 mt-2">※ 問題数が多い分野ほど重要度が高い</p>
            </div>

            <div className="bg-white/90 rounded-2xl p-4">
              <h2 className="text-sm font-bold text-purple-800 mb-3">試験回別 分野分布</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={examCategories} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3e8ff" />
                  <XAxis dataKey="category" tick={{ fontSize: 8 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  {['第45回','第47回','第51回','第52回'].map((exam, i) => (
                    <Bar key={exam} dataKey={exam} stackId="a" fill={Object.values(EXAM_COLORS)[i]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* レーダーチャート */}
        {activeTab === 'radar' && (
          <div className="space-y-4">
            <div className="bg-white/90 rounded-2xl p-4">
              <h2 className="text-sm font-bold text-purple-800 mb-3">分野バランス レーダー</h2>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#f3e8ff" />
                  <PolarAngleAxis dataKey="category" tick={{ fontSize: 9 }} />
                  {['第45回','第47回','第51回','第52回'].map((exam, i) => (
                    <Radar
                      key={exam}
                      name={exam}
                      dataKey={exam}
                      stroke={Object.values(EXAM_COLORS)[i]}
                      fill={Object.values(EXAM_COLORS)[i]}
                      fillOpacity={0.1}
                    />
                  ))}
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* 対策ポイント */}
            <div className="bg-white/90 rounded-2xl p-4">
              <h2 className="text-sm font-bold text-purple-800 mb-3">💡 効率的な対策ポイント</h2>
              <div className="space-y-2 text-xs text-gray-700">
                <div className="flex gap-2 p-2 bg-pink-50 rounded-xl">
                  <span>🔴</span>
                  <div><strong className="text-pink-600">最重要（15問以上/回）</strong><br/>衛生管理・美容保健・美容技術理論は毎回多く出題</div>
                </div>
                <div className="flex gap-2 p-2 bg-purple-50 rounded-xl">
                  <span>🟡</span>
                  <div><strong className="text-purple-600">重要（8〜14問/回）</strong><br/>関係法規・物理化学は基礎を確実に固める</div>
                </div>
                <div className="flex gap-2 p-2 bg-blue-50 rounded-xl">
                  <span>🔵</span>
                  <div><strong className="text-blue-600">得点源（5〜7問/回）</strong><br/>運営管理・文化論は少ないが確実に取れる</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

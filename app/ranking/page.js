'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, BarChart, Bar, Cell,
} from 'recharts';
import { EXAM_RESULTS, SEASON_NOTES } from '@/lib/examData';

const PASS_THRESHOLD = 80; // 合格基準目安

export default function RankingPage() {
  const [activeTab, setActiveTab] = useState('trend');

  const springData = useMemo(() =>
    EXAM_RESULTS.filter(e => e.season === '春').slice().reverse(),
  []);

  const fallData = useMemo(() =>
    EXAM_RESULTS.filter(e => e.season === '秋').slice().reverse(),
  []);

  const allData = useMemo(() =>
    EXAM_RESULTS.slice().reverse().map((e, i) => ({ ...e, index: i })),
  []);

  const latest = EXAM_RESULTS[0];
  const latestSpring = EXAM_RESULTS.find(e => e.season === '春');
  const latestFall = EXAM_RESULTS.find(e => e.season === '秋');
  const springAvg = Math.round(springData.reduce((s, e) => s + e.rate, 0) / springData.length * 10) / 10;
  const fallAvg = Math.round(fallData.reduce((s, e) => s + e.rate, 0) / fallData.length * 10) / 10;

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white border border-purple-200 rounded-xl p-3 shadow text-xs">
        <p className="font-bold text-purple-800">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {p.value}%</p>
        ))}
      </div>
    );
  };

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
          <h1 className="text-lg font-bold text-pink-700">🏆 合格率データ</h1>
          <p className="text-xs text-purple-500">出典: 理容師美容師試験研修センター</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4">

        {/* 最新回サマリー */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white/90 rounded-2xl p-3 text-center">
            <p className="text-xs text-gray-500">最新（{latest.exam}）</p>
            <p className="text-2xl font-bold" style={{ color: latest.rate >= 80 ? '#059669' : latest.rate >= 60 ? '#d97706' : '#dc2626' }}>
              {latest.rate}%
            </p>
            <p className="text-xs text-gray-400">{latest.season}期</p>
          </div>
          <div className="bg-white/90 rounded-2xl p-3 text-center">
            <p className="text-xs text-gray-500">春期 平均</p>
            <p className="text-2xl font-bold text-green-600">{springAvg}%</p>
            <p className="text-xs text-gray-400">直近7回</p>
          </div>
          <div className="bg-white/90 rounded-2xl p-3 text-center">
            <p className="text-xs text-gray-500">秋期 平均</p>
            <p className="text-2xl font-bold text-orange-500">{fallAvg}%</p>
            <p className="text-xs text-gray-400">直近7回</p>
          </div>
        </div>

        {/* タブ */}
        <div className="flex gap-2 mb-4">
          {[
            { id: 'trend', label: '📈 推移' },
            { id: 'compare', label: '🔄 春秋比較' },
            { id: 'list', label: '📋 一覧' },
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

        {/* 推移グラフ */}
        {activeTab === 'trend' && (
          <div className="space-y-4">
            <div className="bg-white/90 rounded-2xl p-4">
              <h2 className="text-sm font-bold text-purple-800 mb-3">美容師国家試験 合格率推移</h2>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={allData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3e8ff" />
                  <XAxis dataKey="exam" tick={{ fontSize: 8 }} interval={1} angle={-30} textAnchor="end" height={40} />
                  <YAxis domain={[40, 100]} tick={{ fontSize: 10 }} unit="%" />
                  <Tooltip content={<CustomTooltip />} formatter={(v) => `${v}%`} />
                  <ReferenceLine y={80} stroke="#ec4899" strokeDasharray="4 4" label={{ value: '80%', fill: '#ec4899', fontSize: 10 }} />
                  <Line
                    type="monotone" dataKey="rate" name="合格率"
                    stroke="#a855f7" strokeWidth={2} dot={{ fill: '#a855f7', r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-xs text-gray-400 mt-1">※ ピンクの破線が80%ライン</p>
            </div>

            <div className="bg-white/90 rounded-2xl p-4">
              <h2 className="text-sm font-bold text-purple-800 mb-3">受験者数 推移</h2>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={allData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3e8ff" />
                  <XAxis dataKey="exam" tick={{ fontSize: 8 }} interval={1} angle={-30} textAnchor="end" height={40} />
                  <YAxis tick={{ fontSize: 9 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => [`${v.toLocaleString()}人`]} />
                  <Bar dataKey="takers" name="受験者数" radius={[3,3,0,0]}>
                    {allData.map((e, i) => (
                      <Cell key={i} fill={e.season === '春' ? '#a855f7' : '#f59e0b'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded" style={{background:'#a855f7'}} />春期</span>
                <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded" style={{background:'#f59e0b'}} />秋期</span>
              </div>
            </div>

            {/* インサイト */}
            <div className="bg-white/90 rounded-2xl p-4 space-y-2 text-xs">
              <h2 className="text-sm font-bold text-purple-800 mb-2">💡 試験傾向のポイント</h2>
              <div className="flex gap-2 p-2 bg-green-50 rounded-xl">
                <span>🌸</span>
                <div><strong className="text-green-700">春期（奇数回）</strong><br/>{SEASON_NOTES.spring}</div>
              </div>
              <div className="flex gap-2 p-2 bg-amber-50 rounded-xl">
                <span>🍂</span>
                <div><strong className="text-amber-700">秋期（偶数回）</strong><br/>{SEASON_NOTES.fall}</div>
              </div>
            </div>
          </div>
        )}

        {/* 春秋比較 */}
        {activeTab === 'compare' && (
          <div className="space-y-4">
            <div className="bg-white/90 rounded-2xl p-4">
              <h2 className="text-sm font-bold text-purple-800 mb-1">春期 vs 秋期 合格率比較</h2>
              <p className="text-xs text-gray-400 mb-3">直近の試験を比較</p>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3e8ff" />
                  <XAxis dataKey="exam" type="category" allowDuplicatedCategory={false}
                    data={[...springData, ...fallData].sort((a,b) => b.exam.localeCompare(a.exam)).slice(0,14).reverse()}
                    tick={{ fontSize: 9 }} interval={1} angle={-30} textAnchor="end" height={40} />
                  <YAxis domain={[40, 100]} tick={{ fontSize: 10 }} unit="%" />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={80} stroke="#e5e7eb" strokeDasharray="4 4" />
                  <Line data={springData} type="monotone" dataKey="rate" name="春期" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                  <Line data={fallData} type="monotone" dataKey="rate" name="秋期" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* 最新の春秋カード */}
            <div className="grid grid-cols-2 gap-3">
              {[latestSpring, latestFall].filter(Boolean).map((e) => (
                <div key={e.exam} className="bg-white/90 rounded-2xl p-4">
                  <p className="text-xs font-bold" style={{ color: e.season === '春' ? '#10b981' : '#f59e0b' }}>
                    {e.season === '春' ? '🌸' : '🍂'} {e.season}期 最新
                  </p>
                  <p className="text-lg font-bold text-gray-800">{e.exam}</p>
                  <p className="text-3xl font-bold mt-1" style={{ color: e.rate >= 80 ? '#059669' : '#d97706' }}>
                    {e.rate}%
                  </p>
                  <div className="mt-2 text-xs text-gray-500 space-y-1">
                    <p>受験: {e.takers.toLocaleString()}人</p>
                    <p>合格: {e.passed.toLocaleString()}人</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 差分サマリー */}
            <div className="bg-white/90 rounded-2xl p-4 text-xs">
              <h3 className="font-bold text-purple-800 mb-2">📊 春秋の差まとめ</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>春期 平均合格率</span>
                  <span className="font-bold text-green-600">{springAvg}%</span>
                </div>
                <div className="flex justify-between">
                  <span>秋期 平均合格率</span>
                  <span className="font-bold text-amber-600">{fallAvg}%</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-bold">春秋の差</span>
                  <span className="font-bold text-pink-600">+{Math.round((springAvg - fallAvg) * 10) / 10}%（春が高い）</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 一覧 */}
        {activeTab === 'list' && (
          <div className="space-y-3">
            <div className="bg-white/90 rounded-2xl overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-purple-100">
                  <tr>
                    <th className="text-left p-3 text-purple-700">試験</th>
                    <th className="text-center p-3 text-purple-700">季</th>
                    <th className="text-right p-3 text-purple-700">受験者</th>
                    <th className="text-right p-3 text-purple-700">合格率</th>
                  </tr>
                </thead>
                <tbody>
                  {EXAM_RESULTS.map((e, i) => (
                    <tr key={e.exam} className={i % 2 === 0 ? 'bg-white' : 'bg-purple-50/30'}>
                      <td className="p-3 font-medium text-gray-800">{e.exam}</td>
                      <td className="p-3 text-center">{e.season === '春' ? '🌸' : '🍂'}</td>
                      <td className="p-3 text-right text-gray-600">{e.takers.toLocaleString()}</td>
                      <td className="p-3 text-right font-bold"
                        style={{ color: e.rate >= 85 ? '#059669' : e.rate >= 70 ? '#d97706' : '#dc2626' }}>
                        {e.rate}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 学校別ランキング告知 */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs">
              <p className="font-bold text-amber-700 mb-1">📌 養成施設別合格率について</p>
              <p className="text-amber-600">
                厚生労働省が各試験後に発表する養成施設別合格率データ（全国の美容学校ごとの合格率）は、
                データソースの更新後に追加予定です。
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

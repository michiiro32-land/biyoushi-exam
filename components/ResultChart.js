'use client';

import { CATEGORIES, CATEGORY_ICONS } from '@/lib/questions';

// SVGベースのレーダーチャート（recharts不要で軽量）
export default function ResultChart({ categoryStats }) {
  const categories = CATEGORIES.filter((c) => categoryStats[c]);
  if (categories.length < 3) return null;

  const size = 280;
  const center = size / 2;
  const radius = 100;
  const levels = 5;

  // 各カテゴリの正答率を計算
  const values = categories.map((cat) => {
    const s = categoryStats[cat];
    return s.total > 0 ? (s.correct / s.total) * 100 : 0;
  });

  const angleStep = (Math.PI * 2) / categories.length;

  // 座標計算
  const getPoint = (index, value) => {
    const angle = angleStep * index - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // グリッドライン
  const gridLines = [];
  for (let level = 1; level <= levels; level++) {
    const points = categories.map((_, i) => {
      const p = getPoint(i, (level / levels) * 100);
      return `${p.x},${p.y}`;
    });
    gridLines.push(points.join(' '));
  }

  // データポイント
  const dataPoints = values.map((v, i) => getPoint(i, v));
  const dataPath = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  // 軸ライン
  const axisLines = categories.map((_, i) => {
    const p = getPoint(i, 100);
    return { x1: center, y1: center, x2: p.x, y2: p.y };
  });

  // ラベル位置
  const labelPoints = categories.map((_, i) => {
    const p = getPoint(i, 120);
    return p;
  });

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* グリッド */}
        {gridLines.map((points, i) => (
          <polygon
            key={i}
            points={points}
            fill="none"
            stroke="#e9d5ff"
            strokeWidth="1"
            opacity={0.6}
          />
        ))}

        {/* 軸 */}
        {axisLines.map((line, i) => (
          <line
            key={i}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="#e9d5ff"
            strokeWidth="1"
          />
        ))}

        {/* データエリア */}
        <polygon
          points={dataPath}
          fill="rgba(236, 72, 153, 0.2)"
          stroke="#ec4899"
          strokeWidth="2"
        />

        {/* データポイント */}
        {dataPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill="#ec4899" />
        ))}

        {/* ラベル */}
        {labelPoints.map((p, i) => (
          <text
            key={i}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="9"
            fill="#6b21a8"
            fontWeight="600"
          >
            {CATEGORY_ICONS[categories[i]]} {categories[i].replace('美容の', '')}
          </text>
        ))}
      </svg>

      {/* 凡例 */}
      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        {categories.map((cat) => {
          const s = categoryStats[cat];
          const rate = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
          return (
            <div key={cat} className="flex items-center gap-1">
              <span>{CATEGORY_ICONS[cat]}</span>
              <span className="text-gray-600">{rate}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

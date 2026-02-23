'use client';

import { useState } from 'react';

export default function QuizCard({ question, onAnswer }) {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const isAnswered = selectedIndex !== null;
  const isCorrect = selectedIndex === question.correctIndex;

  const handleSelect = (idx) => {
    if (isAnswered) return;
    setSelectedIndex(idx);
    onAnswer({ questionId: question.id, selected: idx, correct: idx === question.correctIndex });
  };

  return (
    <div>
      {/* 問題文 */}
      <div className="p-5 rounded-2xl bg-white/90 mb-6">
        <p className="text-base font-medium leading-relaxed text-indigo-950">
          {question.question}
        </p>
      </div>

      {/* 選択肢 */}
      <div className="space-y-3">
        {question.choices.map((choice, idx) => {
          let bg = 'bg-white/85';
          let border = 'border-2 border-transparent';
          let textColor = 'text-indigo-950';

          if (isAnswered) {
            if (idx === question.correctIndex) {
              bg = 'bg-green-50';
              border = 'border-2 border-green-500';
              textColor = 'text-green-900';
            } else if (idx === selectedIndex && !isCorrect) {
              bg = 'bg-red-50';
              border = 'border-2 border-red-500';
              textColor = 'text-red-900';
            }
          }

          const labels = ['A', 'B', 'C', 'D'];
          const labelBg = isAnswered && idx === question.correctIndex
            ? 'bg-green-500 text-white'
            : isAnswered && idx === selectedIndex
              ? 'bg-red-500 text-white'
              : 'bg-purple-100 text-purple-600';

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={isAnswered}
              className={`w-full p-4 rounded-2xl text-left transition-all duration-200 active:scale-[0.98] ${bg} ${border} ${textColor}`}
            >
              <div className="flex items-start gap-3">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5 ${labelBg}`}>
                  {labels[idx]}
                </span>
                <span className="text-sm leading-relaxed font-medium">{choice}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 解説 */}
      {isAnswered && (
        <div className={`mt-4 p-4 rounded-2xl ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className={`font-bold text-sm mb-1 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
            {isCorrect ? '⭕ 正解！' : '❌ 不正解'}
          </div>
          <p className="text-xs leading-relaxed text-gray-700">
            {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
}

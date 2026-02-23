'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoginButton from '@/components/LoginButton';
import Link from 'next/link';

export default function LoginPage() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      router.push('/');
    }
  }, [session, router]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #f5f3ff 100%)' }}
    >
      <div className="w-full max-w-sm">
        {/* ロゴ */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">✨</div>
          <h1 className="text-2xl font-bold text-pink-700">美容師国試対策</h1>
          <p className="text-sm text-purple-500 mt-2">
            ログインして学習記録を保存しよう
          </p>
        </div>

        {/* メリット */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 mb-6 space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-lg">📊</span>
            <div>
              <p className="text-sm font-bold text-indigo-950">学習進捗の記録</p>
              <p className="text-xs text-gray-500">分野別の正答率や学習履歴を保存</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">📱</span>
            <div>
              <p className="text-sm font-bold text-indigo-950">どこでも学習</p>
              <p className="text-xs text-gray-500">別の端末からも成績を確認できます</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">🎯</span>
            <div>
              <p className="text-sm font-bold text-indigo-950">苦手分野の分析</p>
              <p className="text-xs text-gray-500">弱点を可視化して効率的に学習</p>
            </div>
          </div>
        </div>

        {/* LINEログインボタン */}
        <LoginButton />

        {/* ゲストモード */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-sm text-purple-400 underline hover:text-purple-600 transition-colors"
          >
            ログインせずに始める（成績は保存されません）
          </Link>
        </div>
      </div>
    </div>
  );
}

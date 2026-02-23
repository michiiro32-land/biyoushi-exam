'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/70 border-b border-pink-100">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-pink-700">
          ✨ 美容師国試対策
        </Link>

        <div className="flex items-center gap-2">
          {session?.user ? (
            <>
              <Link
                href="/mypage"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-50 hover:bg-pink-100 transition-colors"
              >
                {session.user.image ? (
                  <img
                    src={session.user.image}
                    alt=""
                    className="w-7 h-7 rounded-full border-2 border-pink-200"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold">
                    {(session.user.name || 'U')[0]}
                  </div>
                )}
                <span className="text-xs font-medium text-pink-800 max-w-[80px] truncate">
                  {session.user.name}
                </span>
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1"
              >
                ログアウト
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="px-4 py-1.5 rounded-full text-xs font-bold text-white"
              style={{ background: '#06C755' }}
            >
              LINEでログイン
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

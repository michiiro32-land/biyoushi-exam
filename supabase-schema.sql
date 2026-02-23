-- ============================================================
-- 美容師国試対策 Supabase テーブル作成SQL
-- Supabase Dashboard > SQL Editor にペーストして実行してください
-- ============================================================

-- UUID拡張を有効化
create extension if not exists "uuid-ossp";

-- ユーザーテーブル
create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  line_id text unique not null,
  display_name text not null default 'ユーザー',
  avatar_url text default '',
  created_at timestamptz default now()
);

-- クイズ結果テーブル
create table if not exists quiz_results (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade not null,
  category text not null,
  total_questions int not null default 0,
  correct_answers int not null default 0,
  wrong_question_ids int[] default '{}',
  completed_at timestamptz default now()
);

-- インデックス
create index if not exists idx_quiz_results_user_id on quiz_results(user_id);
create index if not exists idx_quiz_results_completed_at on quiz_results(completed_at desc);
create index if not exists idx_users_line_id on users(line_id);

-- Row Level Security（RLS）を有効化
alter table users enable row level security;
alter table quiz_results enable row level security;

-- RLSポリシー: anon キーでもサーバーサイドAPI経由ではアクセス可能にする
-- （NextAuth経由のAPI Routeからのアクセスを想定）
create policy "Allow all for service role" on users
  for all using (true) with check (true);

create policy "Allow all for service role" on quiz_results
  for all using (true) with check (true);

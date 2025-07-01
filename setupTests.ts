import '@testing-library/jest-dom';

// Jest実行時に使用するSupabaseの環境変数を設定
process.env.VITE_SUPABASE_URL = 'http://localhost:54321'; // テスト用のダミーURL
process.env.VITE_SUPABASE_ANON_KEY = 'test_anon_key';     // テスト用のダミーキー

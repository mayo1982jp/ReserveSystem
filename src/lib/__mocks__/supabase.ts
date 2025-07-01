// src/lib/__mocks__/supabase.ts

// Supabaseクライアントの基本的なモックを作成します。
// 実際のテストシナリオに応じて、各関数 (auth, from など) のモックをより詳細に実装する必要があります。

const mockAuth = {
  getSession: jest.fn(() => Promise.resolve({ data: { session: null }, error: null })),
  onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
  signUp: jest.fn(() => Promise.resolve({ data: { user: { id: 'mock-user-id', email: 'test@example.com' }, session: {} }, error: null })),
  signInWithPassword: jest.fn(() => Promise.resolve({ data: { user: { id: 'mock-user-id', email: 'test@example.com' }, session: {} }, error: null })),
  signOut: jest.fn(() => Promise.resolve({ error: null })),
  resetPasswordForEmail: jest.fn(() => Promise.resolve({ error: null })),
  // 必要に応じて他のauthメソッドをモック
};

const mockQueryBuilder = {
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  neq: jest.fn().mockReturnThis(),
  single: jest.fn().mockResolvedValue({ data: {}, error: null }), // 単一の結果を返すメソッドのモック
  order: jest.fn().mockReturnThis(),
  // 他のクエリビルダメソッドも必要に応じてモック
  // .then(), .catch() のようなPromiseインターフェースもモックできるとより良いが、
  // 通常は select().single() のような最終的な結果取得メソッドをモックする
};

const mockSupabase = {
  auth: mockAuth,
  from: jest.fn(() => mockQueryBuilder),
  channel: jest.fn(() => ({
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn(() => ({ unsubscribe: jest.fn() })),
  })),
  // 他のSupabaseクライアントプロパティやメソッドも必要に応じてモック
};

// export const supabase = mockSupabase; // 名前付きエクスポート
// export default mockSupabase; // デフォルトエクスポートは削除

// createClient関数自体をモックすることも考えられるが、
// 通常は作成されたクライアントインスタンスをモックする
// export const createClient = jest.fn(() => mockSupabase);

// supabase という名前でエクスポートするのが元のファイルと合わせるために最も適切
export const supabase = mockSupabase;

import React from 'react';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import UserMenu from '../UserMenu';
import { AuthProvider, useAuth } from '../../contexts/AuthContext'; // AuthContextからuseAuthもインポート

jest.mock('../../lib/supabase'); // supabase を明示的にモック

// useAuthフックのモック
jest.mock('../../contexts/AuthContext', () => ({
  ...jest.requireActual('../../contexts/AuthContext'), // 実際のAuthProviderはそのまま使用
  useAuth: jest.fn(),
}));

const mockSignOut = jest.fn();

describe('UserMenu Component', () => {
  const mockUser = {
    email: 'test@example.com',
    user_metadata: { name: 'Test User' },
    // 他にもUser型に必要なプロパティがあれば追加
  };

  beforeEach(() => {
    // 各テストの前にuseAuthモックをリセット・設定
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser, // この値はテストケースごとに上書きされることがある
      signOut: mockSignOut,
      loading: false, // AuthProviderからのloading更新警告を避けるためfalseに設定
      // 他のAuthContextの値も必要に応じてモック
    });
    mockSignOut.mockClear();
  });

  test('renders user name and email when logged in', async () => {
    render(<AuthProvider><UserMenu /></AuthProvider>);
    const userButton = await screen.findByRole('button', { name: /Test User/i });
    fireEvent.click(userButton);
    const dropdown = await screen.findByTestId('user-menu-dropdown');
    expect(within(dropdown).getByText('Test User')).toBeInTheDocument();
    expect(within(dropdown).getByText('test@example.com')).toBeInTheDocument();
  });

  test('displays menu items when button is clicked', async () => {
    render(<AuthProvider><UserMenu /></AuthProvider>);
    const userButton = await screen.findByRole('button', { name: /Test User/i });
    fireEvent.click(userButton);
    const dropdown = await screen.findByTestId('user-menu-dropdown');
    expect(within(dropdown).getByText('予約履歴')).toBeInTheDocument();
    expect(within(dropdown).getByText('設定')).toBeInTheDocument();
    expect(within(dropdown).getByText('ログアウト')).toBeInTheDocument();
  });

  test('calls signOut when logout button is clicked', async () => {
    render(<AuthProvider><UserMenu /></AuthProvider>);
    const userButton = await screen.findByRole('button', { name: /Test User/i });
    fireEvent.click(userButton);
    const logoutButton = await screen.findByText('ログアウト');
    fireEvent.click(logoutButton);
    await waitFor(() => expect(mockSignOut).toHaveBeenCalledTimes(1));
    expect(screen.queryByTestId('user-menu-dropdown')).not.toBeInTheDocument();
  });

  test('menu closes when an item is clicked', async () => {
    render(<AuthProvider><UserMenu /></AuthProvider>);
    const userButton = await screen.findByRole('button', { name: /Test User/i });
    fireEvent.click(userButton);
    const menuItem = await screen.findByText('予約履歴');
    fireEvent.click(menuItem);
    await waitFor(() => expect(screen.queryByTestId('user-menu-dropdown')).not.toBeInTheDocument());
  });

  test('menu closes when clicking outside', async () => {
    render(<AuthProvider><UserMenu /></AuthProvider>);
    const userButton = await screen.findByRole('button', { name: /Test User/i });
    fireEvent.click(userButton);
    await screen.findByTestId('user-menu-dropdown'); // ドロップダウンが表示されるのを待つ
    const overlay = screen.getByTestId('user-menu-overlay');
    fireEvent.click(overlay);
    await waitFor(() => expect(screen.queryByTestId('user-menu-dropdown')).not.toBeInTheDocument());
  });

  test('does not render if user is null', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      signOut: mockSignOut,
      loading: false,
    });
    const { container } = render(<AuthProvider><UserMenu /></AuthProvider>);
    expect(container.firstChild).toBeNull();
  });

  test('displays default name if user_metadata.name is not available', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { email: 'test@example.com' },
      signOut: mockSignOut,
      loading: false,
    });
    render(<AuthProvider><UserMenu /></AuthProvider>);
    const userButton = await screen.findByRole('button', { name: /test/i });
    fireEvent.click(userButton);
    const dropdown = await screen.findByTestId('user-menu-dropdown');
    expect(within(dropdown).getByText('test')).toBeInTheDocument();
    expect(within(dropdown).getByText('test@example.com')).toBeInTheDocument();
  });

});

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Plus,
  BarChart3,
  Users,
  CalendarDays,
  DollarSign,
  AlertCircle,
  Eye,
  Download
} from 'lucide-react';
import CalendarView from './CalendarView';
import { getAllBookings, updateBooking, deleteBooking, BookingWithDetails, subscribeToBookings } from '../lib/database';

interface AdminDashboardProps {
  onBackToPublic: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToPublic }) => {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<BookingWithDetails[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'calendar'>('dashboard');
  const [loading, setLoading] = useState(true);

  // 予約データを取得
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      const bookingsData = await getAllBookings();
      setBookings(bookingsData);
      setFilteredBookings(bookingsData);
      setLoading(false);
    };

    fetchBookings();

    // リアルタイム更新の購読
    const subscription = subscribeToBookings((updatedBookings) => {
      setBookings(updatedBookings);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // フィルタリング機能
  useEffect(() => {
    let filtered = bookings;

    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.profile?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.profile?.phone?.includes(searchTerm) ||
        booking.chart_number?.includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    if (dateFilter) {
      filtered = filtered.filter(booking => booking.booking_date === dateFilter);
    }

    setFilteredBookings(filtered);
  }, [bookings, searchTerm, statusFilter, dateFilter]);

  const updateBookingStatus = async (bookingId: string, newStatus: BookingWithDetails['status']) => {
    const updatedBooking = await updateBooking(bookingId, { status: newStatus });
    if (updatedBooking) {
      setBookings(prev => prev.map(booking =>
        booking.id === bookingId ? { ...booking, status: newStatus } : booking
      ));
    }
  };

  const handleUpdateBooking = async (bookingId: string, updates: Partial<BookingWithDetails>) => {
    const updatedBooking = await updateBooking(bookingId, updates);
    if (updatedBooking) {
      setBookings(prev => prev.map(booking =>
        booking.id === bookingId ? { ...booking, ...updates } : booking
      ));
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    const success = await deleteBooking(bookingId);
    if (success) {
      setBookings(prev => prev.filter(booking => booking.id !== bookingId));
    }
  };

  const getStatusColor = (status: BookingWithDetails['status']) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-stone-100 text-stone-800';
    }
  };

  const getStatusText = (status: BookingWithDetails['status']) => {
    switch (status) {
      case 'confirmed': return '確定';
      case 'pending': return '保留';
      case 'cancelled': return 'キャンセル';
      case 'completed': return '完了';
      default: return '不明';
    }
  };

  // 統計データの計算
  const stats = {
    totalBookings: bookings.length,
    confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
    pendingBookings: bookings.filter(b => b.status === 'pending').length,
    todayBookings: bookings.filter(b => b.booking_date === new Date().toISOString().split('T')[0]).length,
    totalRevenue: bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + (b.service?.price || 0), 0)
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-stone-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-stone-600">総予約数</p>
              <p className="text-2xl font-bold text-amber-900">{stats.totalBookings}</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <CalendarDays className="w-6 h-6 text-amber-700" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-stone-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-stone-600">確定予約</p>
              <p className="text-2xl font-bold text-green-600">{stats.confirmedBookings}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-stone-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-stone-600">保留中</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingBookings}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-stone-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-stone-600">売上</p>
              <p className="text-2xl font-bold text-amber-700">¥{stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-amber-700" />
            </div>
          </div>
        </div>
      </div>

      {/* 今日の予約 */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-stone-200">
        <h3 className="text-lg font-semibold text-amber-900 mb-4">今日の予約</h3>
        <div className="space-y-3">
          {bookings
            .filter(booking => booking.booking_date === new Date().toISOString().split('T')[0])
            .sort((a, b) => a.booking_time.localeCompare(b.booking_time))
            .map(booking => (
              <div key={booking.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-sm font-medium text-amber-900">{booking.booking_time}</div>
                  <div className="text-sm text-stone-600">{booking.profile?.name}</div>
                  <div className="text-sm text-stone-500">{booking.service?.name}</div>
                  {booking.chart_number && (
                    <div className="text-xs text-stone-400">#{booking.chart_number}</div>
                  )}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                  {getStatusText(booking.status)}
                </span>
              </div>
            ))}
          {bookings.filter(booking => booking.booking_date === new Date().toISOString().split('T')[0]).length === 0 && (
            <p className="text-stone-500 text-center py-4">今日の予約はありません</p>
          )}
        </div>
      </div>

      {/* 予約管理セクション */}
      <div className="space-y-6">
        {/* 検索・フィルター */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-stone-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-amber-900">予約管理</h3>
            <button className="bg-amber-700 text-white px-4 py-2 rounded-lg hover:bg-amber-800 transition-colors flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>エクスポート</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
              <input
                type="text"
                placeholder="名前、電話番号、カルテ番号で検索"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="all">全てのステータス</option>
              <option value="pending">保留</option>
              <option value="confirmed">確定</option>
              <option value="completed">完了</option>
              <option value="cancelled">キャンセル</option>
            </select>

            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* 予約リスト */}
        <div className="bg-white rounded-xl shadow-lg border border-stone-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="text-amber-700">読み込み中...</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-stone-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">患者情報</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">カルテ番号</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">サービス</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">日時</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">ステータス</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">料金</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-stone-200">
                  {filteredBookings.slice(0, 10).map((booking) => (
                    <tr key={booking.id} className="hover:bg-stone-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-amber-900">{booking.profile?.name}</div>
                          <div className="text-sm text-stone-500">{booking.profile?.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-amber-900">#{booking.chart_number}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-amber-900">{booking.service?.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-amber-900">{booking.booking_date}</div>
                        <div className="text-sm text-stone-500">{booking.booking_time}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {getStatusText(booking.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-900">
                        ¥{booking.service?.price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowBookingModal(true);
                            }}
                            className="text-amber-600 hover:text-amber-900"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                            className="text-green-600 hover:text-green-900"
                            disabled={booking.status === 'confirmed'}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                            className="text-red-600 hover:text-red-900"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBooking(booking.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {filteredBookings.length > 10 && (
            <div className="bg-stone-50 px-6 py-3 text-center">
              <p className="text-sm text-stone-600">
                {filteredBookings.length - 10}件の予約が他にあります
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-amber-700 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-amber-900">予約管理システム</h1>
                <p className="text-sm text-amber-700">健康整骨院</p>
              </div>
            </div>
            <button
              onClick={onBackToPublic}
              className="bg-stone-600 text-white px-4 py-2 rounded-lg hover:bg-stone-700 transition-colors"
            >
              公開サイトに戻る
            </button>
          </div>
        </div>
      </header>

      {/* ナビゲーション */}
      <nav className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                currentView === 'dashboard'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
              }`}
            >
              ダッシュボード
            </button>
            <button
              onClick={() => setCurrentView('calendar')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                currentView === 'calendar'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
              }`}
            >
              カレンダー
            </button>
          </div>
        </div>
      </nav>

      {/* メインコンテンツ */}
      <main className={`${currentView === 'calendar' ? 'w-full px-2 py-4' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}`}>
        {currentView === 'dashboard' && renderDashboard()}
        {currentView === 'calendar' && (
          <CalendarView 
            bookings={bookings} 
            onUpdateBooking={handleUpdateBooking}
          />
        )}
      </main>

      {/* 予約詳細モーダル */}
      {showBookingModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-amber-900">予約詳細</h3>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="text-stone-400 hover:text-stone-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-amber-900 mb-3">患者情報</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-amber-700" />
                        <span className="text-stone-700">{selectedBooking.profile?.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-amber-700" />
                        <span className="text-stone-700">{selectedBooking.profile?.phone}</span>
                      </div>
                      {selectedBooking.chart_number && (
                        <div className="text-stone-700">
                          <strong>カルテ番号:</strong> #{selectedBooking.chart_number}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-amber-900 mb-3">予約情報</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-amber-700" />
                        <span className="text-stone-700">{selectedBooking.booking_date}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-amber-700" />
                        <span className="text-stone-700">{selectedBooking.booking_time}</span>
                      </div>
                      <div className="text-stone-700">
                        <strong>サービス:</strong> {selectedBooking.service?.name}
                      </div>
                      <div className="text-stone-700">
                        <strong>料金:</strong> ¥{selectedBooking.service?.price.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {selectedBooking.notes && (
                  <div>
                    <h4 className="font-semibold text-amber-900 mb-3">症状・ご要望</h4>
                    <div className="bg-stone-50 rounded-lg p-4">
                      <p className="text-stone-700">{selectedBooking.notes}</p>
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-amber-900 mb-3">ステータス変更</h4>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        updateBookingStatus(selectedBooking.id, 'confirmed');
                        setShowBookingModal(false);
                      }}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      確定
                    </button>
                    <button
                      onClick={() => {
                        updateBookingStatus(selectedBooking.id, 'completed');
                        setShowBookingModal(false);
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      完了
                    </button>
                    <button
                      onClick={() => {
                        updateBookingStatus(selectedBooking.id, 'cancelled');
                        setShowBookingModal(false);
                      }}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
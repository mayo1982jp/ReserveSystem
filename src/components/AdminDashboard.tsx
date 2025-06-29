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

interface Booking {
  id: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  serviceName: string;
  date: string;
  time: string;
  notes: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  price: string;
  createdAt: string;
  chartNumber?: string;
}

interface AdminDashboardProps {
  onBackToPublic: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToPublic }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'calendar'>('dashboard');

  const services = [
    { id: 'general', name: '一般整骨治療', price: '¥3,000' },
    { id: 'sports', name: 'スポーツ整骨', price: '¥4,500' },
    { id: 'massage', name: 'マッサージ治療', price: '¥5,000' },
    { id: 'acupuncture', name: '鍼灸治療', price: '¥4,000' }
  ];

  // カルテ番号を生成する関数
  const generateChartNumber = () => {
    return Math.floor(Math.random() * 9000) + 1000; // 1000-9999の範囲
  };

  // サンプルデータの生成（2025年7月15日以降）
  useEffect(() => {
    const sampleBookings: Booking[] = [
      {
        id: '1',
        name: '田中花子',
        phone: '090-1234-5678',
        email: 'tanaka@example.com',
        service: 'general',
        serviceName: '一般整骨治療',
        date: '2025-07-15',
        time: '10:00',
        notes: '肩こりがひどく、頭痛もあります',
        status: 'confirmed',
        price: '¥3,000',
        createdAt: '2025-07-10T09:00:00Z',
        chartNumber: '1001'
      },
      {
        id: '2',
        name: '佐藤太郎',
        phone: '080-9876-5432',
        email: 'sato@example.com',
        service: 'sports',
        serviceName: 'スポーツ整骨',
        date: '2025-07-16',
        time: '14:30',
        notes: 'テニスで腰を痛めました',
        status: 'pending',
        price: '¥4,500',
        createdAt: '2025-07-12T14:30:00Z',
        chartNumber: '1002'
      },
      {
        id: '3',
        name: '山田美咲',
        phone: '070-5555-1111',
        email: 'yamada@example.com',
        service: 'massage',
        serviceName: 'マッサージ治療',
        date: '2025-07-17',
        time: '11:00',
        notes: 'デスクワークによる首と肩の疲労',
        status: 'confirmed',
        price: '¥5,000',
        createdAt: '2025-07-11T16:20:00Z',
        chartNumber: '1003'
      },
      {
        id: '4',
        name: '鈴木一郎',
        phone: '090-7777-8888',
        email: 'suzuki@example.com',
        service: 'acupuncture',
        serviceName: '鍼灸治療',
        date: '2025-07-18',
        time: '16:00',
        notes: '慢性的な腰痛で悩んでいます',
        status: 'confirmed',
        price: '¥4,000',
        createdAt: '2025-07-08T11:15:00Z',
        chartNumber: '1004'
      },
      {
        id: '5',
        name: '高橋恵子',
        phone: '080-3333-4444',
        email: 'takahashi@example.com',
        service: 'general',
        serviceName: '一般整骨治療',
        date: '2025-07-19',
        time: '09:30',
        notes: '首の痛みと手のしびれ',
        status: 'confirmed',
        price: '¥3,000',
        createdAt: '2025-07-13T10:45:00Z',
        chartNumber: '1005'
      },
      {
        id: '6',
        name: '伊藤健太',
        phone: '090-2222-3333',
        email: 'ito@example.com',
        service: 'sports',
        serviceName: 'スポーツ整骨',
        date: '2025-07-21',
        time: '15:00',
        notes: 'サッカーでの膝の怪我',
        status: 'confirmed',
        price: '¥4,500',
        createdAt: '2025-07-14T12:00:00Z',
        chartNumber: '1006'
      },
      {
        id: '7',
        name: '渡辺由美',
        phone: '080-4444-5555',
        email: 'watanabe@example.com',
        service: 'massage',
        serviceName: 'マッサージ治療',
        date: '2025-07-22',
        time: '14:00',
        notes: 'デスクワークによる肩こり',
        status: 'confirmed',
        price: '¥5,000',
        createdAt: '2025-07-15T09:30:00Z',
        chartNumber: '1007'
      },
      {
        id: '8',
        name: '中村雅子',
        phone: '070-6666-7777',
        email: 'nakamura@example.com',
        service: 'acupuncture',
        serviceName: '鍼灸治療',
        date: '2025-07-23',
        time: '10:30',
        notes: '更年期による体調不良',
        status: 'pending',
        price: '¥4,000',
        createdAt: '2025-07-16T14:20:00Z',
        chartNumber: '1008'
      },
      {
        id: '9',
        name: '小林達也',
        phone: '090-8888-9999',
        email: 'kobayashi@example.com',
        service: 'sports',
        serviceName: 'スポーツ整骨',
        date: '2025-07-24',
        time: '17:00',
        notes: 'ランニングによる足首の痛み',
        status: 'confirmed',
        price: '¥4,500',
        createdAt: '2025-07-17T11:45:00Z',
        chartNumber: '1009'
      },
      {
        id: '10',
        name: '松本香織',
        phone: '080-1111-2222',
        email: 'matsumoto@example.com',
        service: 'general',
        serviceName: '一般整骨治療',
        date: '2025-07-25',
        time: '15:30',
        notes: '家事による手首の痛み',
        status: 'confirmed',
        price: '¥3,000',
        createdAt: '2025-07-18T16:30:00Z',
        chartNumber: '1010'
      },
      {
        id: '11',
        name: '森田慎一',
        phone: '070-3333-4444',
        email: 'morita@example.com',
        service: 'massage',
        serviceName: 'マッサージ治療',
        date: '2025-07-26',
        time: '11:30',
        notes: '長時間運転による腰の疲労',
        status: 'confirmed',
        price: '¥5,000',
        createdAt: '2025-07-19T13:15:00Z',
        chartNumber: '1011'
      },
      {
        id: '12',
        name: '石川美穂',
        phone: '090-5555-6666',
        email: 'ishikawa@example.com',
        service: 'acupuncture',
        serviceName: '鍼灸治療',
        date: '2025-07-28',
        time: '09:00',
        notes: '不眠症と肩こり',
        status: 'pending',
        price: '¥4,000',
        createdAt: '2025-07-20T10:00:00Z',
        chartNumber: '1012'
      }
    ];
    setBookings(sampleBookings);
    setFilteredBookings(sampleBookings);
  }, []);

  // フィルタリング機能
  useEffect(() => {
    let filtered = bookings;

    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.phone.includes(searchTerm) ||
        booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.chartNumber?.includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    if (dateFilter) {
      filtered = filtered.filter(booking => booking.date === dateFilter);
    }

    setFilteredBookings(filtered);
  }, [bookings, searchTerm, statusFilter, dateFilter]);

  const updateBookingStatus = (bookingId: string, newStatus: Booking['status']) => {
    setBookings(prev => prev.map(booking =>
      booking.id === bookingId ? { ...booking, status: newStatus } : booking
    ));
  };

  const updateBooking = (bookingId: string, updates: Partial<Booking>) => {
    setBookings(prev => prev.map(booking =>
      booking.id === bookingId ? { ...booking, ...updates } : booking
    ));
  };

  const deleteBooking = (bookingId: string) => {
    setBookings(prev => prev.filter(booking => booking.id !== bookingId));
  };

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-stone-100 text-stone-800';
    }
  };

  const getStatusText = (status: Booking['status']) => {
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
    todayBookings: bookings.filter(b => b.date === new Date().toISOString().split('T')[0]).length,
    totalRevenue: bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + parseInt(b.price.replace('¥', '').replace(',', '')), 0)
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
            .filter(booking => booking.date === new Date().toISOString().split('T')[0])
            .sort((a, b) => a.time.localeCompare(b.time))
            .map(booking => (
              <div key={booking.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-sm font-medium text-amber-900">{booking.time}</div>
                  <div className="text-sm text-stone-600">{booking.name}</div>
                  <div className="text-sm text-stone-500">{booking.serviceName}</div>
                  {booking.chartNumber && (
                    <div className="text-xs text-stone-400">#{booking.chartNumber}</div>
                  )}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                  {getStatusText(booking.status)}
                </span>
              </div>
            ))}
          {bookings.filter(booking => booking.date === new Date().toISOString().split('T')[0]).length === 0 && (
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
                placeholder="名前、電話番号、メール、カルテ番号で検索"
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
                        <div className="text-sm font-medium text-amber-900">{booking.name}</div>
                        <div className="text-sm text-stone-500">{booking.phone}</div>
                        <div className="text-sm text-stone-500">{booking.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-amber-900">#{booking.chartNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-amber-900">{booking.serviceName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-amber-900">{booking.date}</div>
                      <div className="text-sm text-stone-500">{booking.time}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-900">
                      {booking.price}
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
                          onClick={() => deleteBooking(booking.id)}
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
            onUpdateBooking={updateBooking}
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
                        <span className="text-stone-700">{selectedBooking.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-amber-700" />
                        <span className="text-stone-700">{selectedBooking.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-amber-700" />
                        <span className="text-stone-700">{selectedBooking.email}</span>
                      </div>
                      {selectedBooking.chartNumber && (
                        <div className="text-stone-700">
                          <strong>カルテ番号:</strong> #{selectedBooking.chartNumber}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-amber-900 mb-3">予約情報</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-amber-700" />
                        <span className="text-stone-700">{selectedBooking.date}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-amber-700" />
                        <span className="text-stone-700">{selectedBooking.time}</span>
                      </div>
                      <div className="text-stone-700">
                        <strong>サービス:</strong> {selectedBooking.serviceName}
                      </div>
                      <div className="text-stone-700">
                        <strong>料金:</strong> {selectedBooking.price}
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
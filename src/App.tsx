import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, Mail, MapPin, CheckCircle, ArrowRight, Stethoscope, Heart, Shield, Star, Settings, LogIn, AlertCircle } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthModal from './components/AuthModal';
import UserMenu from './components/UserMenu';
import AdminDashboard from './components/AdminDashboard';
import { getServices, createBooking, getProfile, updateProfile, checkBookingConflict, Service } from './lib/database';

interface BookingForm {
  name: string;
  phone: string;
  email: string;
  service: string;
  date: string;
  time: string;
  notes: string;
}

function AppContent() {
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    name: '',
    phone: '',
    email: '',
    service: '',
    date: '',
    time: '',
    notes: ''
  });
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user, loading: authLoading } = useAuth();

  // フォームの初期状態を定義
  const initialBookingFormState = {
    name: '',
    phone: '',
    email: '',
    service: '',
    date: '',
    time: '',
    notes: ''
  };

  // ユーザープロファイルに基づいてフォームを初期化または更新する関数
  const initializeFormWithUser = async (currentUser: typeof user) => {
    let baseForm = { ...initialBookingFormState, email: currentUser?.email || '' };
    if (currentUser) {
      const profile = await getProfile(currentUser.id);
      if (profile) {
        baseForm.name = profile.name || '';
        baseForm.phone = profile.phone || '';
      }
    }
    setBookingForm(baseForm);
  };


  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30'
  ];

  // サービス一覧を取得
  useEffect(() => {
    const fetchServices = async () => {
      const servicesData = await getServices();
      setServices(servicesData);
    };
    fetchServices();
  }, []);

  // ユーザー情報が変更された場合、フォームを初期化
  useEffect(() => {
    if (user) {
      initializeFormWithUser(user);
    } else {
      setBookingForm(initialBookingFormState); // ログアウト時などは完全に初期化
    }
  }, [user]);

  const handleInputChange = (field: keyof BookingForm, value: string) => {
    setBookingForm(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setAuthModalMode('signin');
      setShowAuthModal(true);
      return;
    }

    setError(null); // エラーメッセージをクリア
    setLoading(true);

    try {
      // 予約の重複チェック
      const hasConflict = await checkBookingConflict(bookingForm.date, bookingForm.time);
      if (hasConflict) {
        setError('選択された日時は既に予約が入っています。別の時間をお選びください。');
        setLoading(false);
        return;
      }

      // プロフィール情報を更新
      if (bookingForm.name || bookingForm.phone) {
        await updateProfile(user.id, {
          name: bookingForm.name,
          phone: bookingForm.phone
        });
      }

      // 予約を作成
      const booking = await createBooking({
        service_id: bookingForm.service,
        booking_date: bookingForm.date,
        booking_time: bookingForm.time,
        notes: bookingForm.notes || undefined
      });

      if (booking) {
        setIsSubmitted(true);
      } else {
        // createBookingがnullを返すがエラーをスローしない場合（例：ユーザー未認証で内部的にnullを返すなど）
        setError('予約の作成に失敗しました。入力内容をご確認の上、もう一度お試しください。');
      }
    } catch (err) { // error を err に変更
      console.error('Booking process error:', err);
      if (err instanceof Error && err.message === '予約の空き状況確認中にエラーが発生しました。') {
        setError('予約の空き状況の確認中にエラーが発生しました。しばらくしてからもう一度お試しください。');
      } else if (err instanceof Error) {
        setError(`予約処理中にエラーが発生しました: ${err.message}`);
      } else {
        setError('予約の作成中に予期せぬエラーが発生しました。');
      }
    }

    setLoading(false);
  };

  const handleAuthRequired = (mode: 'signin' | 'signup') => {
    setAuthModalMode(mode);
    setShowAuthModal(true);
  };

  const handleAdminAccess = () => {
    setShowAdmin(true);
  };

  const isServiceComplete = bookingForm.service !== '';
  const isDateTimeComplete = bookingForm.date !== '' && bookingForm.time !== '';
  const isPersonalComplete = bookingForm.name !== '' && bookingForm.phone !== '' && bookingForm.email !== '';
  const isFormComplete = isServiceComplete && isDateTimeComplete && isPersonalComplete;

  // 管理画面を表示
  if (showAdmin) {
    return <AdminDashboard onBackToPublic={() => setShowAdmin(false)} />;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-amber-700 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Stethoscope className="w-6 h-6 text-white animate-pulse" />
          </div>
          <p className="text-amber-700">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    const selectedService = services.find(s => s.id === bookingForm.service);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-amber-900 mb-4">予約完了</h2>
          <p className="text-amber-700 mb-6">
            ご予約ありがとうございます。確認メールをお送りいたします。
          </p>
          <div className="bg-amber-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold mb-2 text-amber-900">予約詳細</h3>
            <div className="space-y-1 text-sm text-amber-700">
              <p><span className="font-medium">治療:</span> {selectedService?.name}</p>
              <p><span className="font-medium">日時:</span> {bookingForm.date} {bookingForm.time}</p>
              <p><span className="font-medium">お名前:</span> {bookingForm.name}</p>
              <p><span className="font-medium">料金:</span> ¥{selectedService?.price?.toLocaleString()}</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsSubmitted(false); // フォーム表示に戻る
              if (user) {
                initializeFormWithUser(user); // ユーザー情報に基づいてフォームを再初期化
              } else {
                setBookingForm(initialBookingFormState); // ユーザーがいなければ完全に初期化
              }
            }}
            className="bg-amber-700 text-white px-6 py-3 rounded-lg hover:bg-amber-800 transition-colors w-full"
          >
            新しい予約をする
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-amber-700 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-amber-900">健康整骨院</h1>
                <p className="text-sm text-amber-700">Health Chiropractic Clinic</p>
              </div>
            </div>
            
            {/* 中央のオンライン予約 */}
            <div className="flex-1 flex justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-amber-900">オンライン予約</h2>
                <p className="text-sm text-amber-700">Online Booking</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              {user ? (
                <UserMenu />
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleAuthRequired('signin')}
                    className="text-amber-700 hover:text-amber-900 transition-colors p-2 rounded-lg hover:bg-amber-50 flex items-center space-x-1"
                  >
                    <LogIn className="w-4 h-4" />
                    <span className="hidden md:block text-sm">ログイン</span>
                  </button>
                  <button
                    onClick={() => handleAuthRequired('signup')}
                    className="bg-amber-700 text-white px-3 py-2 rounded-lg hover:bg-amber-800 transition-colors text-sm"
                  >
                    新規登録
                  </button>
                </div>
              )}
              
              {/* 管理者ボタン - mayo810246@gmail.com でログインしている時のみ表示 */}
              {user && user.email === 'mayo810246@gmail.com' && (
                <button
                  onClick={handleAdminAccess}
                  className="text-amber-700 hover:text-amber-900 transition-colors p-2"
                  title="管理画面"
                >
                  <Settings className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Booking Section - Three Column Layout */}
      <section id="booking" className="py-16 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <p className="text-xl text-amber-700">3つのステップで簡単予約</p>
            {!user && (
              <p className="text-sm text-amber-600 mt-2">
                予約にはログインが必要です。
                <button
                  onClick={() => handleAuthRequired('signup')}
                  className="text-amber-700 hover:text-amber-900 underline ml-1"
                >
                  新規登録
                </button>
                または
                <button
                  onClick={() => handleAuthRequired('signin')}
                  className="text-amber-700 hover:text-amber-900 underline ml-1"
                >
                  ログイン
                </button>
                してください。
              </p>
            )}
          </div>

          {/* エラーメッセージ */}
          {error && (
            <div className="mb-6 max-w-2xl mx-auto">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-3 gap-8 mb-8">
              {/* Column 1: Service Selection */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-stone-200">
                <div className="flex items-center space-x-3 mb-6">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isServiceComplete ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {isServiceComplete ? <CheckCircle className="w-5 h-5" /> : '1'}
                  </div>
                  <h3 className="text-xl font-bold text-amber-900">治療メニュー選択</h3>
                </div>
                
                <div className="space-y-4">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        bookingForm.service === service.id
                          ? 'border-amber-600 bg-amber-50'
                          : 'border-stone-200 hover:border-amber-300'
                      }`}
                      onClick={() => handleInputChange('service', service.id)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-sm text-amber-900">{service.name}</h4>
                        <span className="text-amber-700 font-bold text-sm">¥{service.price.toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-amber-600 mb-2">{service.description}</p>
                      <span className="text-xs text-stone-500 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {service.duration}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 2: Date & Time Selection */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-stone-200">
                <div className="flex items-center space-x-3 mb-6">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isDateTimeComplete ? 'bg-green-100 text-green-600' : 
                    isServiceComplete ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-400'
                  }`}>
                    {isDateTimeComplete ? <CheckCircle className="w-5 h-5" /> : '2'}
                  </div>
                  <h3 className="text-xl font-bold text-amber-900">日時選択</h3>
                </div>
                
                {isServiceComplete ? (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-amber-800 mb-3">
                        <Calendar className="inline w-4 h-4 mr-2" />
                        日付を選択
                      </label>
                      <input
                        type="date"
                        value={bookingForm.date}
                        onChange={(e) => handleInputChange('date', e.target.value)}
                        className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-amber-800 mb-3">
                        <Clock className="inline w-4 h-4 mr-2" />
                        時間を選択
                      </label>
                      <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                        {timeSlots.map((time) => (
                          <button
                            key={time}
                            type="button"
                            className={`p-2 text-sm rounded-lg border transition-colors ${
                              bookingForm.time === time
                                ? 'bg-amber-700 text-white border-amber-700'
                                : 'bg-white text-amber-800 border-stone-300 hover:border-amber-300'
                            }`}
                            onClick={() => handleInputChange('time', time)}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-stone-400">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>まず治療メニューを選択してください</p>
                  </div>
                )}
              </div>

              {/* Column 3: Personal Information */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-stone-200">
                <div className="flex items-center space-x-3 mb-6">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isPersonalComplete ? 'bg-green-100 text-green-600' : 
                    isDateTimeComplete ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-400'
                  }`}>
                    {isPersonalComplete ? <CheckCircle className="w-5 h-5" /> : '3'}
                  </div>
                  <h3 className="text-xl font-bold text-amber-900">お客様情報</h3>
                </div>
                
                {isDateTimeComplete ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-amber-800 mb-2">
                        <User className="inline w-4 h-4 mr-2" />
                        お名前
                      </label>
                      <input
                        type="text"
                        value={bookingForm.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="山田太郎"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-amber-800 mb-2">
                        <Phone className="inline w-4 h-4 mr-2" />
                        電話番号
                      </label>
                      <input
                        type="tel"
                        value={bookingForm.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="090-1234-5678"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-amber-800 mb-2">
                        <Mail className="inline w-4 h-4 mr-2" />
                        メールアドレス
                      </label>
                      <input
                        type="email"
                        value={bookingForm.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-stone-50"
                        placeholder="example@email.com"
                        disabled
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-amber-800 mb-2">
                        症状・ご要望（任意）
                      </label>
                      <textarea
                        value={bookingForm.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        rows={3}
                        className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="症状や気になることをお聞かせください"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-stone-400">
                    <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>まず日時を選択してください</p>
                  </div>
                )}
              </div>
            </div>

            {/* Booking Summary & Submit */}
            {isFormComplete && (
              <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-stone-200">
                <h4 className="text-xl font-bold text-amber-900 mb-4 text-center">予約内容確認</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-amber-800">治療:</span>
                      <span className="text-amber-900">{services.find(s => s.id === bookingForm.service)?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-amber-800">日時:</span>
                      <span className="text-amber-900">{bookingForm.date} {bookingForm.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-amber-800">料金:</span>
                      <span className="text-amber-700 font-bold">¥{services.find(s => s.id === bookingForm.service)?.price.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-amber-800">お名前:</span>
                      <span className="text-amber-900">{bookingForm.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-amber-800">電話番号:</span>
                      <span className="text-amber-900">{bookingForm.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-amber-800">メール:</span>
                      <span className="text-amber-900">{bookingForm.email}</span>
                    </div>
                  </div>
                  {bookingForm.notes && (
                    <div className="md:col-span-2 pt-3 border-t border-stone-200">
                      <span className="font-medium text-amber-800">ご要望:</span>
                      <p className="text-amber-900 mt-1">{bookingForm.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="text-center">
              <button
                type="submit"
                className="bg-amber-700 text-white px-12 py-4 rounded-xl hover:bg-amber-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 mx-auto text-lg font-semibold shadow-lg"
                disabled={!isFormComplete || loading}
              >
                <CheckCircle className="w-6 h-6" />
                <span>{loading ? '予約中...' : (user ? '予約を確定する' : 'ログインして予約する')}</span>
              </button>
              {!isFormComplete && (
                <p className="text-stone-500 mt-3 text-sm">
                  全ての項目を入力してください
                </p>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-amber-700 to-orange-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              あなたの健康を<br />
              <span className="text-amber-200">サポートします</span>
            </h2>
            <p className="text-xl md:text-2xl mb-8 text-amber-100">
              Professional care for your body and mind
            </p>
            <a href="#booking" className="inline-flex items-center bg-white text-amber-700 px-8 py-4 rounded-lg font-semibold hover:bg-amber-50 transition-colors transform hover:scale-105 shadow-lg">
              今すぐ予約する
              <ArrowRight className="ml-2 w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-amber-700" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-amber-900">専門的治療</h3>
              <p className="text-amber-700">経験豊富な専門家による個別治療プラン</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-orange-700" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-amber-900">安全な環境</h3>
              <p className="text-amber-700">清潔で快適な治療環境を提供</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-yellow-700" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-amber-900">高い満足度</h3>
              <p className="text-amber-700">患者様の95%が治療に満足</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-16 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-amber-900 mb-4">治療メニュー</h2>
            <p className="text-xl text-amber-700">あなたの症状に合わせた最適な治療を提供</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <div key={service.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow transform hover:-translate-y-1 border border-stone-200">
                <h3 className="text-lg font-semibold text-amber-900 mb-2">{service.name}</h3>
                <p className="text-sm text-amber-600 mb-3">{service.name_en}</p>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-amber-700 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {service.duration}
                  </span>
                  <span className="text-lg font-bold text-amber-700">¥{service.price.toLocaleString()}</span>
                </div>
                <p className="text-sm text-amber-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-16 bg-amber-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-6">お問い合わせ</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-amber-300" />
                  <span>〒123-4567 東京都新宿区健康町1-2-3</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-amber-300" />
                  <span>03-1234-5678</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-amber-300" />
                  <span>info@health-clinic.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-amber-300" />
                  <div>
                    <p>平日: 9:00-19:00</p>
                    <p>土曜: 9:00-17:00</p>
                    <p>日祝: 休診</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">アクセス</h3>
              <div className="bg-amber-800 rounded-lg p-6">
                <p className="mb-2">最寄り駅：JR新宿駅東口より徒歩5分</p>
                <p className="text-amber-200">駐車場完備（3台）</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="bg-stone-800 text-stone-300 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 健康整骨院. All rights reserved.</p>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authModalMode}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
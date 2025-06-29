import React, { useState, useRef, useEffect } from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Clock,
  User,
  FileText,
  Plus
} from 'lucide-react';

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

interface CalendarViewProps {
  bookings: Booking[];
  onUpdateBooking: (bookingId: string, updates: Partial<Booking>) => void;
}

interface DragState {
  isDragging: boolean;
  draggedBooking: Booking | null;
  dragOffset: { x: number; y: number };
  originalPosition: { date: string; time: string };
}

const CalendarView: React.FC<CalendarViewProps> = ({ bookings, onUpdateBooking }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedBooking: null,
    dragOffset: { x: 0, y: 0 },
    originalPosition: { date: '', time: '' }
  });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const calendarRef = useRef<HTMLDivElement>(null);

  // 時間スロット（30分間隔）
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30'
  ];

  // 週の日付を取得
  const getWeekDates = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // 月曜日を週の始まりに
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + i);
      week.push(currentDate);
    }
    return week;
  };

  const weekDates = getWeekDates(currentDate);

  // 日付フォーマット
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // 特定の日付と時間の予約を取得
  const getBookingForSlot = (date: string, time: string) => {
    return bookings.find(booking => 
      booking.date === date && 
      booking.time === time && 
      booking.status !== 'cancelled'
    );
  };

  // ドラッグ開始
  const handleDragStart = (e: React.MouseEvent, booking: Booking) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setDragState({
      isDragging: true,
      draggedBooking: booking,
      dragOffset: {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      },
      originalPosition: {
        date: booking.date,
        time: booking.time
      }
    });
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  // ドラッグ中
  const handleMouseMove = (e: MouseEvent) => {
    if (dragState.isDragging) {
      setMousePosition({ x: e.clientX, y: e.clientY });
    }
  };

  // ドラッグ終了
  const handleMouseUp = (e: MouseEvent) => {
    if (dragState.isDragging && dragState.draggedBooking && calendarRef.current) {
      const calendarRect = calendarRef.current.getBoundingClientRect();
      const x = e.clientX - calendarRect.left;
      const y = e.clientY - calendarRect.top;

      // どのセルにドロップされたかを計算
      const headerHeight = 60; // ヘッダーの高さ
      const dayColumnWidth = 120; // 曜日列の幅
      const cellWidth = (calendarRect.width - dayColumnWidth) / timeSlots.length;
      const cellHeight = 80; // 各日の行の高さ

      const timeIndex = Math.floor((x - dayColumnWidth) / cellWidth);
      const dayIndex = Math.floor((y - headerHeight) / cellHeight);

      if (timeIndex >= 0 && timeIndex < timeSlots.length && dayIndex >= 0 && dayIndex < 7) {
        const newDate = formatDate(weekDates[dayIndex]);
        const newTime = timeSlots[timeIndex];

        // 既に予約があるかチェック
        const existingBooking = getBookingForSlot(newDate, newTime);
        
        if (!existingBooking || existingBooking.id === dragState.draggedBooking.id) {
          // 予約を更新
          onUpdateBooking(dragState.draggedBooking.id, {
            date: newDate,
            time: newTime
          });
        }
      }
    }

    setDragState({
      isDragging: false,
      draggedBooking: null,
      dragOffset: { x: 0, y: 0 },
      originalPosition: { date: '', time: '' }
    });
  };

  // マウスイベントリスナーの設定
  useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState.isDragging]);

  // 週を移動
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  // 今日に戻る
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // 日本語の曜日名
  const dayNames = ['月', '火', '水', '木', '金', '土', '日'];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-stone-200 overflow-hidden w-full">
      {/* カレンダーヘッダー */}
      <div className="bg-amber-50 px-2 py-3 border-b border-stone-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-xl font-semibold text-amber-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              週間カレンダー
            </h3>
            <div className="text-amber-700">
              {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateWeek('prev')}
              className="p-2 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors text-sm"
            >
              今日
            </button>
            <button
              onClick={() => navigateWeek('next')}
              className="p-2 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* カレンダーグリッド */}
      <div 
        ref={calendarRef}
        className="relative overflow-x-auto w-full"
        style={{ minHeight: '600px' }}
      >
        {/* ヘッダー行（時間） */}
        <div className="flex bg-stone-50 border-b border-stone-200 sticky top-0 z-10 w-full">
          <div className="w-32 px-2 py-3 border-r border-stone-200 bg-stone-50 flex items-center flex-shrink-0">
            <Calendar className="w-4 h-4 text-stone-500 mr-2" />
            <span className="text-sm font-medium text-stone-700">曜日/時間</span>
          </div>
          {timeSlots.map((time, index) => (
            <div
              key={time}
              className="flex-1 px-1 py-3 text-center border-r border-stone-200 bg-stone-50"
              style={{ minWidth: `${(100 - 15) / timeSlots.length}%` }}
            >
              <div className="font-medium text-stone-700 text-sm">
                {time}
              </div>
            </div>
          ))}
        </div>

        {/* 各曜日の行 */}
        {weekDates.map((date, dayIndex) => {
          const dateStr = formatDate(date);
          const isToday = dateStr === formatDate(new Date());
          
          return (
            <div key={dateStr} className="flex border-b border-stone-200 h-20 w-full">
              {/* 曜日・日付列 */}
              <div className={`w-32 px-2 py-3 border-r border-stone-200 flex flex-col justify-center flex-shrink-0 ${
                isToday ? 'bg-amber-100' : 'bg-stone-50'
              }`}>
                <div className={`font-medium text-sm ${isToday ? 'text-amber-900' : 'text-stone-700'}`}>
                  {dayNames[dayIndex]}曜日
                </div>
                <div className={`text-xs ${isToday ? 'text-amber-700' : 'text-stone-500'}`}>
                  {date.getMonth() + 1}/{date.getDate()}
                </div>
              </div>
              
              {/* 各時間のセル */}
              {timeSlots.map((time, timeIndex) => {
                const booking = getBookingForSlot(dateStr, time);
                const isBeingDragged = dragState.isDragging && 
                  dragState.draggedBooking?.id === booking?.id;

                return (
                  <div
                    key={`${dateStr}-${time}`}
                    className={`flex-1 border-r border-stone-200 relative ${
                      booking && !isBeingDragged ? 'p-1' : 'p-2'
                    } ${isToday ? 'bg-amber-50' : 'bg-white'}`}
                    style={{ minWidth: `${(100 - 15) / timeSlots.length}%` }}
                  >
                    {booking && !isBeingDragged && (
                      <div
                        className={`w-full h-full rounded-lg p-2 cursor-move transition-all hover:shadow-md ${
                          booking.status === 'confirmed' ? 'bg-green-100 border border-green-300' :
                          booking.status === 'pending' ? 'bg-yellow-100 border border-yellow-300' :
                          booking.status === 'completed' ? 'bg-blue-100 border border-blue-300' :
                          'bg-stone-100 border border-stone-300'
                        }`}
                        onMouseDown={(e) => handleDragStart(e, booking)}
                        title={`${booking.name} - ${booking.serviceName}`}
                      >
                        <div className="text-xs font-medium text-stone-800 flex items-start leading-tight">
                          <User className="w-3 h-3 mr-1 flex-shrink-0 mt-0.5" />
                          <span className="break-words">{booking.name}</span>
                        </div>
                        {booking.chartNumber && (
                          <div className="text-xs text-stone-600 flex items-center mt-1">
                            <FileText className="w-3 h-3 mr-1 flex-shrink-0" />
                            <span>#{booking.chartNumber}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* ドラッグ中の予約表示 */}
        {dragState.isDragging && dragState.draggedBooking && (
          <div
            className="fixed pointer-events-none z-50 bg-amber-200 border border-amber-400 rounded-lg p-2 shadow-lg"
            style={{
              left: mousePosition.x - dragState.dragOffset.x,
              top: mousePosition.y - dragState.dragOffset.y,
              width: '120px'
            }}
          >
            <div className="text-xs font-medium text-amber-900 flex items-start leading-tight">
              <User className="w-3 h-3 mr-1 flex-shrink-0 mt-0.5" />
              <span className="break-words">{dragState.draggedBooking.name}</span>
            </div>
            {dragState.draggedBooking.chartNumber && (
              <div className="text-xs text-amber-700 flex items-center mt-1">
                <FileText className="w-3 h-3 mr-1 flex-shrink-0" />
                <span>#{dragState.draggedBooking.chartNumber}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 凡例 */}
      <div className="bg-stone-50 px-2 py-3 border-t border-stone-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
              <span className="text-stone-600">確定</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
              <span className="text-stone-600">保留</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
              <span className="text-stone-600">完了</span>
            </div>
          </div>
          <div className="text-xs text-stone-500">
            予約をドラッグして移動できます（30分単位）
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
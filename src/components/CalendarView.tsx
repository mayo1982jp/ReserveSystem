import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  User,
  FileText
} from 'lucide-react';
import { BookingWithDetails, checkBookingConflict } from '../lib/database';

interface CalendarViewProps {
  bookings: BookingWithDetails[];
  onUpdateBooking: (bookingId: string, updates: Partial<BookingWithDetails>) => void;
}

interface DragState {
  isDragging: boolean;
  draggedBooking: BookingWithDetails | null;
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

  // 時間スロット（30分間隔）を useMemo でメモ化
  const timeSlots = useMemo(() => [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30'
  ], []);

  // 週の日付を取得
  const getWeekDates = useCallback((date: Date) => {
    const week: Date[] = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // 月曜日を週の始まりに
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek); // ループ内で新しいDateオブジェクトを作成
      d.setDate(startOfWeek.getDate() + i);
      week.push(d);
    }
    return week;
  }, []); // 依存配列は空でOK (date引数にのみ依存するため)

  const weekDates = getWeekDates(currentDate); // currentDateが変更されるたびに再計算

  // 日付フォーマット
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // 特定の日付と時間の予約を取得
  const getBookingForSlot = useCallback((date: string, time: string) => {
    return bookings.find(booking =>
      booking.booking_date === date &&
      booking.booking_time === time &&
      booking.status !== 'cancelled'
    );
  }, [bookings]);

  // ドラッグ開始
  const handleDragStart = useCallback((e: React.MouseEvent, booking: BookingWithDetails) => {
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
        date: booking.booking_date,
        time: booking.booking_time
      }
    });
    setMousePosition({ x: e.clientX, y: e.clientY });
  }, []); // 依存配列は空

  // ドラッグ中
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (dragState.isDragging) {
      setMousePosition({ x: e.clientX, y: e.clientY });
    }
  }, [dragState.isDragging]);

  // ドラッグ終了
  const handleMouseUp = useCallback(async (e: MouseEvent) => {
    if (dragState.isDragging && dragState.draggedBooking && calendarRef.current) {
      const calendarRect = calendarRef.current.getBoundingClientRect();
      const xPos = e.clientX - calendarRect.left;
      const yPos = e.clientY - calendarRect.top;

      const headerHeight = 60;
      const dayColumnWidth = 120;
      const cellWidth = (calendarRect.width - dayColumnWidth) / timeSlots.length;
      const cellHeight = 80;

      const droppedTimeIndex = Math.floor((xPos - dayColumnWidth) / cellWidth);
      const droppedDayIndex = Math.floor((yPos - headerHeight) / cellHeight);

      // getWeekDatesを呼び出して最新の週の日付を取得
      const currentWeekDates = getWeekDates(currentDate);

      if (droppedTimeIndex >= 0 && droppedTimeIndex < timeSlots.length && droppedDayIndex >= 0 && droppedDayIndex < currentWeekDates.length) {
        const newDate = formatDate(currentWeekDates[droppedDayIndex]);
        const newTime = timeSlots[droppedTimeIndex];

        // 移動元と移動先が同じ場合は何もしない
        if (newDate === dragState.draggedBooking.booking_date && newTime === dragState.draggedBooking.booking_time) {
          // 位置が変わらないので、特別な処理は不要 (setDragStateは最後に呼ばれる)
        } else {
          const existingBooking = getBookingForSlot(newDate, newTime);

          if (existingBooking && existingBooking.id !== dragState.draggedBooking.id) {
            alert('移動先の時間には既に別の予約が存在します。');
          } else {
            try {
              const hasConflict = await checkBookingConflict(newDate, newTime, dragState.draggedBooking.id);
              if (hasConflict) {
                alert('選択された日時は他の予約と競合しています。別の時間をお選びください。');
              } else {
                // 競合がない場合のみ予約を更新
                onUpdateBooking(dragState.draggedBooking.id, {
                  booking_date: newDate,
                  booking_time: newTime
                });
              }
            } catch (error) {
              console.error("Error checking booking conflict or updating booking:", error);
              alert('予約の移動中にエラーが発生しました。');
            }
          }
        }
      }
    }

    setDragState({ // ドラッグ状態をリセット
      isDragging: false,
      draggedBooking: null,
      dragOffset: { x: 0, y: 0 },
      originalPosition: { date: '', time: '' }
    });
  }, [dragState.isDragging, dragState.draggedBooking, getBookingForSlot, onUpdateBooking, timeSlots, currentDate, getWeekDates]);


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
  }, [dragState.isDragging, handleMouseMove, handleMouseUp]); // 依存配列に handleMouseMove と handleMouseUp を追加

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
          {timeSlots.map((time) => ( // indexを削除
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
              {timeSlots.map((time) => { // timeIndexを削除
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
                        title={`${booking.profile?.name} - ${booking.service?.name}`}
                      >
                        <div className="text-xs font-medium text-stone-800 flex items-start leading-tight">
                          <User className="w-3 h-3 mr-1 flex-shrink-0 mt-0.5" />
                          <span className="break-words">{booking.profile?.name}</span>
                        </div>
                        {booking.chart_number && (
                          <div className="text-xs text-stone-600 flex items-center mt-1">
                            <FileText className="w-3 h-3 mr-1 flex-shrink-0" />
                            <span>#{booking.chart_number}</span>
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
              <span className="break-words">{dragState.draggedBooking.profile?.name}</span>
            </div>
            {dragState.draggedBooking.chart_number && (
              <div className="text-xs text-amber-700 flex items-center mt-1">
                <FileText className="w-3 h-3 mr-1 flex-shrink-0" />
                <span>#{dragState.draggedBooking.chart_number}</span>
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
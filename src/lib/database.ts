import { supabase } from './supabase'

export interface Profile {
  id: string
  name: string
  phone?: string
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  name: string
  name_en?: string
  duration: string
  price: number
  description?: string
  active: boolean
  created_at: string
}

export interface Booking {
  id: string
  user_id: string
  service_id: string
  booking_date: string
  booking_time: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  notes?: string
  chart_number?: string
  created_at: string
  updated_at: string
  // Relations
  service?: Service
  profile?: Profile
}

export interface BookingWithDetails extends Booking {
  service: Service
  profile: Profile
}

// プロフィール関連の関数
export const getProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }

  return data
}

export const updateProfile = async (userId: string, updates: Partial<Profile>): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating profile:', error)
    return null
  }

  return data
}

// サービス関連の関数
export const getServices = async (): Promise<Service[]> => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('active', true)
    .order('created_at')

  if (error) {
    console.error('Error fetching services:', error)
    return []
  }

  return data || []
}

export const getService = async (serviceId: string): Promise<Service | null> => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', serviceId)
    .single()

  if (error) {
    console.error('Error fetching service:', error)
    return null
  }

  return data
}

// 予約関連の関数
export const createBooking = async (bookingData: {
  service_id: string
  booking_date: string
  booking_time: string
  notes?: string
}): Promise<Booking | null> => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    console.error('User not authenticated')
    return null
  }

  const { data, error } = await supabase
    .from('bookings')
    .insert({
      user_id: user.id,
      ...bookingData
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating booking:', error)
    return null
  }

  return data
}

export const getUserBookings = async (): Promise<BookingWithDetails[]> => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    console.error('User not authenticated')
    return []
  }

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      service:services(*),
      profile:profiles(*)
    `)
    .eq('user_id', user.id)
    .order('booking_date', { ascending: true })
    .order('booking_time', { ascending: true })

  if (error) {
    console.error('Error fetching user bookings:', error)
    return []
  }

  return data || []
}

export const getAllBookings = async (): Promise<BookingWithDetails[]> => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      service:services(*),
      profile:profiles(*)
    `)
    .order('booking_date', { ascending: true })
    .order('booking_time', { ascending: true })

  if (error) {
    console.error('Error fetching all bookings:', error)
    return []
  }

  return data || []
}

export const updateBooking = async (bookingId: string, updates: Partial<Booking>): Promise<Booking | null> => {
  const { data, error } = await supabase
    .from('bookings')
    .update(updates)
    .eq('id', bookingId)
    .select()
    .single()

  if (error) {
    console.error('Error updating booking:', error)
    return null
  }

  return data
}

export const deleteBooking = async (bookingId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', bookingId)

  if (error) {
    console.error('Error deleting booking:', error)
    return false
  }

  return true
}

// 管理者用の関数
export const isAdmin = async (): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.email === 'mayo810246@gmail.com'
}

// 予約の重複チェック
export const checkBookingConflict = async (
  date: string, 
  time: string, 
  excludeBookingId?: string
): Promise<boolean> => {
  let query = supabase
    .from('bookings')
    .select('id')
    .eq('booking_date', date)
    .eq('booking_time', time)
    .neq('status', 'cancelled')

  if (excludeBookingId) {
    query = query.neq('id', excludeBookingId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error checking booking conflict:', error);
    throw new Error('予約の空き状況確認中にエラーが発生しました。'); // エラーをスローする
  }

  return (data?.length || 0) > 0;
}

// リアルタイム更新の購読
export const subscribeToBookings = (callback: (bookings: BookingWithDetails[]) => void) => {
  const subscription = supabase
    .channel('bookings_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'bookings'
      },
      () => {
        // 変更があった場合、最新のデータを取得
        getAllBookings().then(callback)
      }
    )
    .subscribe()

  return subscription
}
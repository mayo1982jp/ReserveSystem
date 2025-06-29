import React, { useState } from 'react'
import { User, LogOut, Settings, Calendar, ChevronDown } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    setIsOpen(false)
  }

  if (!user) return null

  const displayName = user.user_metadata?.name || user.email?.split('@')[0] || 'ユーザー'

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-amber-700 hover:text-amber-900 transition-colors p-2 rounded-lg hover:bg-amber-50"
      >
        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-amber-700" />
        </div>
        <span className="hidden md:block text-sm font-medium">{displayName}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-stone-200 z-20">
            <div className="py-2">
              <div className="px-4 py-2 border-b border-stone-200">
                <p className="text-sm font-medium text-amber-900">{displayName}</p>
                <p className="text-xs text-stone-500">{user.email}</p>
              </div>
              
              <button
                onClick={() => setIsOpen(false)}
                className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 flex items-center space-x-2"
              >
                <Calendar className="w-4 h-4" />
                <span>予約履歴</span>
              </button>
              
              <button
                onClick={() => setIsOpen(false)}
                className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 flex items-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>設定</span>
              </button>
              
              <hr className="my-1" />
              
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>ログアウト</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default UserMenu
import React, { useState } from 'react'
import { X, Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'signin' | 'signup'
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'signin' }) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null)

  const { signIn, signUp, resetPassword } = useAuth()

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setName('')
    setMessage(null)
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password)
        if (error) {
          setMessage({ type: 'error', text: 'ログインに失敗しました。メールアドレスとパスワードを確認してください。' })
        } else {
          setMessage({ type: 'success', text: 'ログインしました。' })
          setTimeout(handleClose, 1000)
        }
      } else if (mode === 'signup') {
        if (password !== confirmPassword) {
          setMessage({ type: 'error', text: 'パスワードが一致しません。' })
          setLoading(false)
          return
        }
        if (password.length < 6) {
          setMessage({ type: 'error', text: 'パスワードは6文字以上で入力してください。' })
          setLoading(false)
          return
        }
        const { error } = await signUp(email, password, { name })
        if (error) {
          setMessage({ type: 'error', text: 'アカウント作成に失敗しました。' })
        } else {
          setMessage({ type: 'success', text: 'アカウントを作成しました。ログインしてください。' })
          setTimeout(() => {
            setMode('signin')
            setMessage(null)
          }, 2000)
        }
      } else if (mode === 'reset') {
        const { error } = await resetPassword(email)
        if (error) {
          setMessage({ type: 'error', text: 'パスワードリセットメールの送信に失敗しました。' })
        } else {
          setMessage({ type: 'success', text: 'パスワードリセットメールを送信しました。' })
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'エラーが発生しました。もう一度お試しください。' })
    }

    setLoading(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-amber-900">
              {mode === 'signin' && 'ログイン'}
              {mode === 'signup' && 'アカウント作成'}
              {mode === 'reset' && 'パスワードリセット'}
            </h2>
            <button
              onClick={handleClose}
              className="text-stone-400 hover:text-stone-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Message */}
          {message && (
            <div className={`mb-4 p-3 rounded-lg flex items-center space-x-2 ${
              message.type === 'error' 
                ? 'bg-red-50 text-red-700 border border-red-200' 
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {message.type === 'error' ? (
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
              ) : (
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <span className="text-sm">{message.text}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-amber-800 mb-2">
                  <User className="inline w-4 h-4 mr-2" />
                  お名前
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="山田太郎"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-amber-800 mb-2">
                <Mail className="inline w-4 h-4 mr-2" />
                メールアドレス
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="example@email.com"
                required
              />
            </div>

            {mode !== 'reset' && (
              <div>
                <label className="block text-sm font-medium text-amber-800 mb-2">
                  <Lock className="inline w-4 h-4 mr-2" />
                  パスワード
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 pr-12 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="パスワードを入力"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-amber-800 mb-2">
                  <Lock className="inline w-4 h-4 mr-2" />
                  パスワード確認
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-3 pr-12 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="パスワードを再入力"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-700 text-white py-3 rounded-lg hover:bg-amber-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? '処理中...' : (
                mode === 'signin' ? 'ログイン' :
                mode === 'signup' ? 'アカウント作成' :
                'リセットメール送信'
              )}
            </button>
          </form>

          {/* Mode switching */}
          <div className="mt-6 text-center space-y-2">
            {mode === 'signin' && (
              <>
                <button
                  onClick={() => {
                    setMode('signup')
                    setMessage(null)
                  }}
                  className="text-amber-700 hover:text-amber-900 text-sm"
                >
                  アカウントをお持ちでない方はこちら
                </button>
                <br />
                <button
                  onClick={() => {
                    setMode('reset')
                    setMessage(null)
                  }}
                  className="text-stone-500 hover:text-stone-700 text-sm"
                >
                  パスワードを忘れた方はこちら
                </button>
              </>
            )}
            {mode === 'signup' && (
              <button
                onClick={() => {
                  setMode('signin')
                  setMessage(null)
                }}
                className="text-amber-700 hover:text-amber-900 text-sm"
              >
                既にアカウントをお持ちの方はこちら
              </button>
            )}
            {mode === 'reset' && (
              <button
                onClick={() => {
                  setMode('signin')
                  setMessage(null)
                }}
                className="text-amber-700 hover:text-amber-900 text-sm"
              >
                ログイン画面に戻る
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthModal
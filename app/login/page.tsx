'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import FloatingBackground from '@/components/FloatingBackground'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isSignup, setIsSignup] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        
        if (data.user) {
          await supabase.from('user_profiles').insert({
            id: data.user.id,
            name: name
          })
          alert('Check your email for verification link')
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        
        if (data.session) {
          document.cookie = `sb-access-token=${data.session.access_token}; path=/; max-age=3600`
          router.push('/dashboard')
        }
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <FloatingBackground />
      
      <div className="relative z-10 glass rounded-2xl p-8 w-full max-w-md glow-red">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black mb-2" style={{
            background: 'linear-gradient(135deg, #fbbf24, #dc2626, #fbbf24)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            backgroundSize: '200% auto',
            animation: 'shine 3s linear infinite'
          }}>
            🏏 PSL
          </h1>
          <p className="text-gray-400 text-sm uppercase tracking-widest">Predictor League</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignup && (
            <div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-black/60 border-2 border-gray-700 rounded-xl focus:border-psl-yellow focus:outline-none backdrop-blur-sm transition-all"
                required
                placeholder="Your name"
              />
            </div>
          )}
          
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-black/60 border-2 border-gray-700 rounded-xl focus:border-psl-yellow focus:outline-none backdrop-blur-sm transition-all"
              required
              placeholder="Email"
            />
          </div>

          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-black/60 border-2 border-gray-700 rounded-xl focus:border-psl-yellow focus:outline-none backdrop-blur-sm transition-all"
              required
              placeholder="Password"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-900/30 p-3 rounded-lg border border-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-lg"
          >
            {loading ? '⏳ Loading...' : isSignup ? '🚀 Sign Up' : '⚡ Login'}
          </button>
        </form>

        <button
          onClick={() => setIsSignup(!isSignup)}
          className="w-full mt-4 text-sm text-gray-400 hover:text-psl-yellow transition-all py-2 rounded-lg hover:bg-white/5"
        >
          {isSignup ? '← Already have an account?' : "Don't have an account? Sign up →"}
        </button>
      </div>
    </div>
  )
}

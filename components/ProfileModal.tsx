'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '@/lib/supabase'

type ProfileModalProps = {
  isOpen: boolean
  onClose: () => void
  userId: string
}

export default function ProfileModal({ isOpen, onClose, userId }: ProfileModalProps) {
  const [name, setName] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (isOpen) {
      loadProfile()
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setError('')
      setSuccess('')
    }
  }, [isOpen])

  const loadProfile = async () => {
    const { data } = await supabase
      .from('user_profiles')
      .select('name')
      .eq('id', userId)
      .single()
    
    if (data) {
      setName(data.name)
    }
  }

  const handleSaveName = async () => {
    if (!name.trim()) return
    
    setLoading(true)
    setError('')
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({ id: userId, name: name.trim() })
      
      if (error) throw error
      
      setSuccess('Name updated successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    setError('')
    
    if (!newPassword || !confirmPassword) {
      setError('Please fill all password fields')
      return
    }
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      
      if (error) throw error
      
      setSuccess('Password changed successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !mounted) return null

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] overflow-y-auto bg-black/90"
      onClick={onClose}
    >
      <div className="min-h-screen flex items-center justify-center p-4">
        <div 
          className="bg-gray-900 border-2 border-psl-red rounded-lg p-4 sm:p-6 w-full max-w-md my-8" 
          onClick={(e) => e.stopPropagation()}
        >
        {/* Header */}
        <div className="flex justify-between items-start mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-psl-yellow">Profile Settings</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white text-3xl sm:text-4xl leading-none -mt-2"
          >
            ×
          </button>
        </div>
        
        {/* Messages */}
        {success && (
          <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-green-900/50 border border-green-500 rounded text-green-400 text-xs sm:text-sm">
            ✅ {success}
          </div>
        )}
        
        {error && (
          <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-red-900/50 border border-red-500 rounded text-red-400 text-xs sm:text-sm">
            ❌ {error}
          </div>
        )}
        
        {/* Name Section */}
        <div className="mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-gray-700">
          <h3 className="text-sm sm:text-base font-semibold text-white mb-2 sm:mb-3">Display Name</h3>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 mb-2 sm:mb-3 bg-black border border-gray-600 rounded focus:border-psl-yellow focus:outline-none text-white text-sm sm:text-base"
            placeholder="Enter your name"
          />
          <button
            onClick={handleSaveName}
            disabled={loading || !name.trim()}
            className="btn-primary w-full text-sm sm:text-base py-2"
          >
            {loading ? 'Saving...' : 'Update Name'}
          </button>
        </div>

        {/* Password Section */}
        <div className="mb-4 sm:mb-6">
          <h3 className="text-sm sm:text-base font-semibold text-white mb-2 sm:mb-3">Change Password</h3>
          
          <div className="space-y-2 sm:space-y-3 mb-2 sm:mb-3">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 bg-black border border-gray-600 rounded focus:border-psl-yellow focus:outline-none text-white text-sm sm:text-base"
              placeholder="New password (min 6 chars)"
            />
            
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 bg-black border border-gray-600 rounded focus:border-psl-yellow focus:outline-none text-white text-sm sm:text-base"
              placeholder="Confirm password"
            />
          </div>
          
          <button
            onClick={handleChangePassword}
            disabled={loading || !newPassword || !confirmPassword}
            className="btn-primary w-full text-sm sm:text-base py-2"
          >
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full px-3 sm:px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition text-white text-sm sm:text-base"
        >
          Close
        </button>
      </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

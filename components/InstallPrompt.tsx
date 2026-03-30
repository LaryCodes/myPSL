'use client'

import { useState, useEffect } from 'react'

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(iOS)

    // Check if already installed
    const standalone = window.matchMedia('(display-mode: standalone)').matches
    setIsStandalone(standalone)

    if (standalone) {
      setShowPrompt(false)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      
      // Check if user already dismissed
      const dismissed = localStorage.getItem('pwa-dismissed')
      if (!dismissed) {
        setShowPrompt(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handler)

    // For iOS or if no prompt event, show manual instructions after 3 seconds
    if (iOS) {
      const dismissed = localStorage.getItem('pwa-dismissed')
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 3000)
      }
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // Show instructions for manual install
      if (isIOS) {
        alert('To install:\n1. Tap the Share button (□↑)\n2. Scroll down\n3. Tap "Add to Home Screen"')
      } else {
        alert('To install:\n1. Open browser menu (⋮)\n2. Select "Install app" or "Add to Home Screen"')
      }
      return
    }

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setShowPrompt(false)
    }
    
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-dismissed', 'true')
  }

  if (!showPrompt || isStandalone) return null

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-[100] animate-slide-up">
      <div className="glass border-2 border-psl-yellow rounded-lg p-4 shadow-2xl shadow-psl-yellow/20">
        <div className="flex items-start gap-3">
          <div className="text-3xl">📱</div>
          <div className="flex-1">
            <h3 className="font-bold text-white mb-1">Install PSL Predict</h3>
            <p className="text-sm text-gray-300 mb-3">
              {isIOS 
                ? 'Add to Home Screen for the best experience!' 
                : 'Get the app experience! Quick access, offline support, and notifications.'}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-psl-red to-red-700 text-white rounded-lg font-semibold text-sm hover:shadow-lg hover:shadow-psl-red/50 transition-all"
              >
                {deferredPrompt ? 'Install' : 'How to Install'}
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600 transition-all"
              >
                Later
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-white text-xl leading-none"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  )
}

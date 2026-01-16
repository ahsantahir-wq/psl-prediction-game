'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { name: 'Predictions', href: '/dashboard', icon: '🎯' },
    { name: 'Matches', href: '/matches', icon: '🏏' },
    { name: 'Table', href: '/table', icon: '📊' },
    { name: 'Statistics', href: '/statistics', icon: '📈' },
    { name: 'Players', href: '/players', icon: '👥' },
    { name: 'News', href: '/news', icon: '📰' },
    { name: 'Leaderboard', href: '/leaderboard', icon: '🏆' },
  ]

  return (
    <nav className="bg-gradient-to-r from-purple-700 via-blue-600 to-green-600 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition">
              <div className="text-3xl">🏏</div>
              <div>
                <div className="font-bold text-xl">PSL Fantasy</div>
                <div className="text-xs opacity-90">Prediction League</div>
              </div>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  pathname === item.href
                    ? 'bg-white bg-opacity-20 text-white'
                    : 'text-white hover:bg-white hover:bg-opacity-10'
                }`}
              >
                <span className="mr-1">{item.icon}</span>
                {item.name}
              </a>
            ))}
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="/credits"
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-lg font-bold text-sm transition"
            >
              💰 Load Credits
            </a>
            <a
              href="/notifications"
              className="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition relative"
            >
              <span className="text-2xl">🔔</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </a>
            <button
              onClick={() => {
                localStorage.clear()
                window.location.href = '/'
              }}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-semibold text-sm transition"
            >
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white hover:bg-opacity-10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`block px-4 py-3 rounded-lg font-semibold transition ${
                  pathname === item.href
                    ? 'bg-white bg-opacity-20 text-white'
                    : 'text-white hover:bg-white hover:bg-opacity-10'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </a>
            ))}
            <div className="pt-4 border-t border-white border-opacity-20 space-y-2">
              <a
                href="/credits"
                className="block px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-lg font-bold text-center"
              >
                💰 Load Credits
              </a>
              <a
                href="/notifications"
                className="block px-4 py-3 bg-white bg-opacity-10 rounded-lg font-semibold text-center"
              >
                🔔 Notifications
              </a>
              <button
                onClick={() => {
                  localStorage.clear()
                  window.location.href = '/'
                }}
                className="w-full px-4 py-3 bg-red-500 hover:bg-red-600 rounded-lg font-semibold"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

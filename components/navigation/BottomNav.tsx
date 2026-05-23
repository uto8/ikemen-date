'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLikeBadge } from './LikeBadgeProvider'
import { formatBadgeCount } from '@/lib/utils/badge'

const tabs = [
  {
    href: '/users',
    label: 'さがす',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
      </svg>
    ),
  },
  {
    href: '/likes',
    label: 'いいね',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    ),
  },
  {
    href: '/matches',
    label: 'マッチング',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
      </svg>
    ),
  },
  {
    href: '/settings',
    label: '設定',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
        <path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const pathname = usePathname()
  const { count } = useLikeBadge()
  const onLikesPage = pathname === '/likes'

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-gray-100 bg-white">
      <ul className="flex">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href)
          const showLikeBadge = tab.href === '/likes' && !onLikesPage && count > 0

          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                className={`relative flex flex-col items-center gap-0.5 py-2 text-xs ${
                  isActive ? 'text-pink-500' : 'text-gray-400'
                }`}
              >
                <span className="relative">
                  {tab.icon}
                  {showLikeBadge && (
                    <span className="absolute -right-2 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white leading-none">
                      {formatBadgeCount(count)}
                    </span>
                  )}
                </span>
                <span>{tab.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

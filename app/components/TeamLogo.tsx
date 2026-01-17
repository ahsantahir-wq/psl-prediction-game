'use client'

import Image from 'next/image'
import { getTeamLogo, getTeamColor, getTeamInitials } from '@/lib/teamLogos'
import { useState } from 'react'

interface TeamLogoProps {
  teamName: string
  size?: number
  className?: string
}

export default function TeamLogo({ teamName, size = 48, className = '' }: TeamLogoProps) {
  const [imageError, setImageError] = useState(false)
  const logoUrl = getTeamLogo(teamName)
  const teamColor = getTeamColor(teamName)
  const initials = getTeamInitials(teamName)

  if (imageError) {
    // Fallback: Show team initials with color
    return (
      <div
        className={`flex items-center justify-center rounded-full ${className}`}
        style={{
          width: size,
          height: size,
          backgroundColor: teamColor,
        }}
      >
        <span className="text-white font-bold" style={{ fontSize: size / 3 }}>
          {initials}
        </span>
      </div>
    )
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full overflow-hidden bg-slate-700 ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={logoUrl}
        alt={teamName}
        width={size}
        height={size}
        className="object-contain"
        onError={() => setImageError(true)}
        unoptimized
      />
    </div>
  )
}

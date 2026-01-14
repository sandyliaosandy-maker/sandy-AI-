'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavLink {
  href: string
  label: string
}

interface NavbarProps {
  links?: NavLink[]
  className?: string
}

export function Navbar({ 
  links = [
    { href: '/', label: 'Home' },
    { href: '/notes', label: 'Notes' },
    { href: '/about', label: 'About' },
  ],
  className = '' 
}: NavbarProps) {
  const pathname = usePathname()

  return (
    <nav className={className}>
      <div className="flex items-center gap-6">
        {links.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors ${
                isActive
                  ? 'text-neutral-800 font-semibold'
                  : 'text-neutral-600 hover:text-neutral-800'
              }`}
            >
              {link.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}




'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

const navItems = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/nominate', label: 'Nominate', icon: '🏅' },
  { href: '/profile', label: 'Profile', icon: '👤' },
];

const adminItem = { href: '/admin', label: 'Admin', icon: '⚙️' };

export default function BottomNav() {
  const pathname = usePathname();
  const { player } = useAuth();

  const items = player?.role === 'admin' ? [...navItems, adminItem] : navItems;

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 480,
        background: '#1a1a1d',
        borderTop: '2px solid #3a3a40',
        display: 'flex',
        padding: '8px 0 12px',
        zIndex: 100,
      }}
    >
      {items.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== '/' && pathname?.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              textDecoration: 'none',
              padding: '4px 0',
            }}
          >
            <span style={{ fontSize: 22 }}>{item.icon}</span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: active ? '#FFB300' : '#52525a',
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              {item.label}
            </span>
            {active && (
              <div
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: '#FFB300',
                  marginTop: 1,
                }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

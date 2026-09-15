export function DashboardIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5 12 4l9 9.5M5.5 11v8a1 1 0 0 0 1 1H10v-5a2 2 0 0 1 4 0v5h3.5a1 1 0 0 0 1-1v-8" />
    </svg>
  )
}

export function IngredientIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v3m6-3v3M6 8h12l-1 11.2a2 2 0 0 1-2 1.8H9a2 2 0 0 1-2-1.8L6 8Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6M9 15.5h6" />
    </svg>
  )
}

export function ProductIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 8 12 3.5 20.5 8M3.5 8v8L12 20.5m-8.5-8L12 12m0 8.5 8.5-4.5V8M12 12v8.5" />
    </svg>
  )
}

export function SettingsIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.3 3.5h3.4l.6 2.4a7 7 0 0 1 1.7 1l2.4-.8 1.7 2.9-1.9 1.6a7 7 0 0 1 0 2l1.9 1.6-1.7 2.9-2.4-.8a7 7 0 0 1-1.7 1l-.6 2.4h-3.4l-.6-2.4a7 7 0 0 1-1.7-1l-2.4.8-1.7-2.9 1.9-1.6a7 7 0 0 1 0-2L3.9 8l1.7-2.9 2.4.8a7 7 0 0 1 1.7-1l.6-2.4Z" />
      <circle cx="12" cy="12" r="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function LogoutIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.5 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7.5a2 2 0 0 0 2-2v-2M9 12h11m0 0-3-3m3 3-3 3" />
    </svg>
  )
}

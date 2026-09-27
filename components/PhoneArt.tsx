/** Ilustração genérica de smartphone usada na arte da rifa (sem marcas de terceiros). */
export function PhoneArt({className = ""}: {className?: string}) {
  return <svg className={className} viewBox="0 0 320 420" role="img" aria-label="Ilustração do celular sorteado">
    <defs>
      <linearGradient id="phone-back" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#e9e4da"/><stop offset=".55" stopColor="#cfc8b7"/><stop offset="1" stopColor="#a79f8c"/></linearGradient>
      <linearGradient id="phone-front" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#23272d"/><stop offset="1" stopColor="#0b0c0e"/></linearGradient>
      <linearGradient id="phone-screen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3a4150"/><stop offset=".5" stopColor="#1b1f27"/><stop offset="1" stopColor="#5b5446"/></linearGradient>
    </defs>
    <g transform="rotate(8 225 190)">
      <rect x="150" y="40" width="150" height="300" rx="30" fill="url(#phone-back)"/>
      <rect x="196" y="54" width="90" height="90" rx="24" fill="#b9b19e" opacity=".85"/>
      <circle cx="220" cy="78" r="15" fill="#2b2f36"/><circle cx="220" cy="78" r="7" fill="#48505c"/>
      <circle cx="220" cy="120" r="15" fill="#2b2f36"/><circle cx="220" cy="120" r="7" fill="#48505c"/>
      <circle cx="262" cy="99" r="6" fill="#efe9dd"/>
    </g>
    <g transform="rotate(-6 110 235)">
      <rect x="30" y="72" width="164" height="330" rx="34" fill="url(#phone-front)"/>
      <rect x="40" y="82" width="144" height="310" rx="26" fill="url(#phone-screen)"/>
      <rect x="88" y="94" width="48" height="14" rx="7" fill="#0b0c0e"/>
      <text x="112" y="230" textAnchor="middle" fill="#fff" fontFamily="Inter, system-ui, sans-serif" fontWeight="800" fontSize="64" letterSpacing="-2">17</text>
      <text x="112" y="260" textAnchor="middle" fill="#cfc8b7" fontFamily="Inter, system-ui, sans-serif" fontWeight="600" fontSize="11" letterSpacing="2">RIFA SOLIDÁRIA</text>
      <rect x="82" y="376" width="60" height="4" rx="2" fill="#ffffff80"/>
    </g>
  </svg>;
}

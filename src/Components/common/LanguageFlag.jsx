export default function LanguageFlag({ isKhmer }) {
  if (isKhmer) {
    return (
      <svg viewBox="0 0 32 20" width="24" height="15" aria-hidden="true" className="shrink-0 rounded-sm shadow-sm">
        <rect width="32" height="20" fill="#012169" />
        <path d="M0 0 32 20M32 0 0 20" stroke="#fff" strokeWidth="5" />
        <path d="M0 0 32 20M32 0 0 20" stroke="#C8102E" strokeWidth="2" />
        <path d="M16 0v20M0 10h32" stroke="#fff" strokeWidth="7" />
        <path d="M16 0v20M0 10h32" stroke="#C8102E" strokeWidth="4" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 32 20" width="24" height="15" aria-hidden="true" className="shrink-0 rounded-sm shadow-sm">
      <rect width="32" height="20" fill="#032EA1" />
      <rect y="5" width="32" height="10" fill="#E00025" />
      <path d="M5 14h22v1H5zm2-2h18v2H7zm2-3h14v3H9zm3-3h2v3h-2zm6 0h2v3h-2zm-3-2h2v8h-2zM8 10l2-2 2 2m8 0 2-2 2 2m-9-4 1-3 1 3" fill="#fff" />
    </svg>
  );
}

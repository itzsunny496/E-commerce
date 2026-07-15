export default function Logo() {
  return (
    <div className="w-11 h-11 rounded-3xl bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center shadow-lg shadow-sky-200/30">
      <svg viewBox="0 0 48 48" className="w-7 h-7 text-white" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 6L10 18V42H38V18L24 6Z" fill="currentColor" opacity="0.2" />
        <path d="M24 6L10 18V42H38V18L24 6Z" stroke="white" strokeWidth="3" strokeLinejoin="round" />
        <path d="M18 27L24 33L30 27" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M24 33V18" stroke="white" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
}

import { useState } from "react";

// Drop-in replacement for <input type="password" className="field-input" />
// that adds a show/hide toggle. Accepts and forwards every normal input
// prop (value, onChange, name, required, minLength, placeholder, etc.).
export default function PasswordInput({ className = "", ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? "text" : "password"}
        className={`field-input pr-10 ${className}`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        className="absolute right-0 top-0 h-full w-10 flex items-center justify-center text-text-muted hover:text-text-secondary transition-colors"
        aria-label={visible ? "Hide password" : "Show password"}
        title={visible ? "Hide password" : "Show password"}
      >
        {visible ? (
          // Eye-off
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 3l18 18M10.6 10.7a2.5 2.5 0 0 0 3.5 3.5M6.6 6.7C4.5 8.1 2.9 10 2 12c1.7 3.9 5.7 7 10 7 1.8 0 3.5-.5 5-1.4M9.9 4.2A10.6 10.6 0 0 1 12 4c4.3 0 8.3 3.1 10 7-.5 1.2-1.3 2.5-2.3 3.6"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          // Eye
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M2 12c1.7-3.9 5.7-7 10-7s8.3 3.1 10 7c-1.7 3.9-5.7 7-10 7s-8.3-3.1-10-7Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="12" r="2.75" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        )}
      </button>
    </div>
  );
}

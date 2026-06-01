// src/components/chat/TypingIndicator.jsx
export function TypingIndicator({ usernames = [] }) {
  if (usernames.length === 0) return null;

  const text = usernames.length === 1 
    ? `${usernames[0]} yozmoqda...` 
    : `${usernames.slice(0, 2).join(', ')} va boshqalar yozmoqda...`;

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-xs text-edu-muted animate-fade-in">
      <div className="flex gap-1 items-center">
        <span className="w-1.5 h-1.5 bg-edu-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 bg-edu-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 bg-edu-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span>{text}</span>
    </div>
  );
}

export default TypingIndicator;

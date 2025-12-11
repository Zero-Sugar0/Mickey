
import React, { useMemo } from 'react';

interface CardProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
  isLoading?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick, style, isLoading = false }) => {
  // Generate stable random particles
  const particles = useMemo(() => {
    return Array.from({ length: 8 }).map((_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() * 4 + 3, // 3px to 7px
      opacity: Math.random() * 0.3 + 0.1, // 0.1 to 0.4
      duration: Math.random() * 15 + 10, // 10s to 25s
      delay: Math.random() * 10,
    }));
  }, []);

  if (isLoading) {
    return (
      <div 
        className={`relative overflow-hidden rounded-[32px] shadow-sm bg-gray-200 ${className}`}
        style={style}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
      </div>
    );
  }

  return (
    <div 
      onClick={onClick}
      style={style}
      className={`
        relative overflow-hidden
        rounded-[32px] p-5 sm:p-6 shadow-sm 
        transition-all duration-300 ease-out
        ${onClick ? 'cursor-pointer active:scale-95 hover:brightness-95' : ''}
        ${className}
      `}
    >
      {/* Background Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute bg-white rounded-full mix-blend-overlay"
            style={{
              top: `${p.top}%`,
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: p.opacity,
              animation: `float ${p.duration}s ease-in-out infinite alternate`,
              animationDelay: `-${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Children rendered directly to maintain flex layout context if used in className */}
      {children}
    </div>
  );
};

export default Card;

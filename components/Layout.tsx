import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, className = '' }) => {
  return (
    <div className={`h-[100dvh] w-full bg-appBackground font-sen text-deepBlack overflow-hidden relative flex flex-col ${className}`}>
      {children}
    </div>
  );
};

export default Layout;
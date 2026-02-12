
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto bg-white shadow-xl relative">
      <main className="flex-grow overflow-y-auto pb-20">
        {children}
      </main>
    </div>
  );
};

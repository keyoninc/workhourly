"use client";

import React from 'react';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-container">
      <Sidebar />
      {children}
      <style jsx global>{`
        .dashboard-container {
          display: flex;
          min-height: 100vh;
          background: var(--bg-main);
        }
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          height: 100vh;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

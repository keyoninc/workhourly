"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import Sidebar from '@/components/Sidebar';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [tenant, setTenant] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedTenant = localStorage.getItem('tenant');
    const token = localStorage.getItem('token');

    if (!token || !storedUser) {
      router.push('/login');
      return;
    }

    setUser(JSON.parse(storedUser));
    setTenant(JSON.parse(storedTenant));
  }, [router]);

  if (!user) return <div className="loading">Loading...</div>;

  return (
    <>
      <section className="main-content">
        <header className="top-header glass">
          <div className="tenant-info">
            <span className="tenant-name">{tenant?.name}</span>
          </div>
          <div className="user-profile">
            <span className="user-name">{user?.name}님</span>
            <span className="user-role">{user?.role}</span>
          </div>
        </header>

        <div className="content-body">
          <h1>안녕하세요, {user?.name}님!</h1>
          <p>워크아월리 그룹웨어에 오신 것을 환영합니다.</p>
          
          <div className="stats-grid">
            <div className="stat-card glass">
              <h3>오늘의 근태</h3>
              <p>미출근</p>
            </div>
            <div className="stat-card glass">
              <h3>잔여 연차</h3>
              <p>15일</p>
            </div>
            <div className="stat-card glass">
              <h3>결재 대기</h3>
              <p>3건</p>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }

        .top-header {
          padding: 1rem 2.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 1rem 2rem;
          border-radius: 16px;
        }

        .tenant-name {
          font-weight: 700;
          color: var(--secondary);
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-name {
          font-weight: 600;
        }

        .user-role {
          font-size: 0.75rem;
          padding: 2px 8px;
          background: #e2e8f0;
          border-radius: 4px;
        }

        .content-body {
          padding: 2rem 2.5rem;
        }

        .content-body h1 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .stat-card {
          padding: 1.5rem;
          border-radius: 16px;
          text-align: center;
        }

        .stat-card h3 {
          font-size: 0.9rem;
          color: var(--text-muted);
          margin-bottom: 1rem;
        }

        .stat-card p {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--primary);
        }

        .loading {
          display: flex;
          height: 100vh;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
        }
      `}</style>
    </>
  );
}

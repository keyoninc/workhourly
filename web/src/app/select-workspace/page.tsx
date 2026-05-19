"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Membership {
  role: string;
  tenant: {
    id: string;
    name: string;
    businessNumber: string;
  };
}

export default function SelectWorkspacePage() {
  const router = useRouter();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const storedMemberships = localStorage.getItem('memberships');
    const storedUser = localStorage.getItem('user');

    if (storedMemberships) {
      setMemberships(JSON.parse(storedMemberships));
    } else {
      router.push('/login');
    }

    if (storedUser) {
      setUserName(JSON.parse(storedUser).name);
    }
  }, [router]);

  const handleSelect = (membership: Membership) => {
    localStorage.setItem('tenant', JSON.stringify(membership.tenant));
    localStorage.setItem('role', membership.role);
    router.push('/dashboard');
  };

  return (
    <div className="auth-layout">
      <div className="auth-background">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
      </div>

      <main className="auth-container">
        <div className="workspace-select-card animate-slide-up">
          <header className="ws-header">
            <h1>반갑습니다, {userName}님!</h1>
            <p>입장하실 워크스페이스를 선택해 주세요.</p>
          </header>

          <div className="workspace-list">
            {memberships.map((m) => (
              <button 
                key={m.tenant.id} 
                className="workspace-item"
                onClick={() => handleSelect(m)}
              >
                <div className="ws-icon">
                  {m.tenant.name.substring(0, 1)}
                </div>
                <div className="ws-info">
                  <h3>{m.tenant.name}</h3>
                  <span>{m.role === 'ADMIN' ? '관리자' : '일반 직원'}</span>
                </div>
                <div className="ws-arrow">→</div>
              </button>
            ))}
          </div>

          <div className="ws-actions">
            <button className="secondary-btn" onClick={() => router.push('/onboarding')}>
              + 새로운 워크스페이스 추가
            </button>
          </div>
        </div>
      </main>

      <style jsx>{`
        .workspace-select-card {
          width: 100%;
          max-width: 500px;
          padding: 3rem;
          border-radius: 28px;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(24px);
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1);
          border: 1px solid rgba(255,255,255,0.5);
        }
        .ws-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }
        .ws-header h1 {
          font-size: 1.6rem;
          color: var(--secondary);
          margin-bottom: 0.5rem;
        }
        .ws-header p {
          color: var(--text-muted);
        }
        .workspace-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .workspace-item {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 16px;
          background: white;
          border-radius: 16px;
          border: 1px solid var(--border);
          transition: all 0.2s ease;
          text-align: left;
        }
        .workspace-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px -5px rgba(0,0,0,0.05);
          border-color: var(--primary-light);
        }
        .ws-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: bold;
          margin-right: 16px;
        }
        .ws-info {
          flex: 1;
        }
        .ws-info h3 {
          font-size: 1.1rem;
          margin: 0 0 4px 0;
          color: var(--text-main);
        }
        .ws-info span {
          font-size: 0.85rem;
          color: var(--text-muted);
          background: var(--bg-main);
          padding: 2px 8px;
          border-radius: 20px;
        }
        .ws-arrow {
          color: var(--text-muted);
          font-size: 1.2rem;
          transition: transform 0.2s;
        }
        .workspace-item:hover .ws-arrow {
          transform: translateX(4px);
          color: var(--primary);
        }
        .secondary-btn {
          width: 100%;
          padding: 14px;
          background: rgba(59, 130, 246, 0.1);
          color: var(--primary-dark);
          font-weight: 600;
          border-radius: 12px;
        }
        .secondary-btn:hover {
          background: rgba(59, 130, 246, 0.15);
        }
      `}</style>
    </div>
  );
}

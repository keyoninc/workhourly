"use client";

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  
  const [tenant, setTenant] = useState<any>(null);
  const [memberships, setMemberships] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = localStorage.getItem('tenant');
    const m = localStorage.getItem('memberships');
    if (t) setTenant(JSON.parse(t));
    if (m) setMemberships(JSON.parse(m));

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSwitchWorkspace = (m: any) => {
    localStorage.setItem('tenant', JSON.stringify(m.tenant));
    localStorage.setItem('role', m.role);
    setShowDropdown(false);
    // Reload to ensure all components fetch data for the new tenant
    window.location.reload();
  };

  const menuItems = [
    { name: '대시보드', path: '/dashboard' },
    { name: '조직도 설정', path: '/dashboard/organization' },
    { name: '메일', path: '/dashboard/mail' },
    { name: '근태관리', path: '/dashboard/attendance' },
    { name: '휴가관리', path: '/dashboard/vacation' },
    { name: '전자결재', path: '/dashboard/approval' },
  ];

  const role = typeof window !== 'undefined' ? localStorage.getItem('role') : null;
  if (role === 'ADMIN') {
    menuItems.push({ name: '관리자 설정', path: '/dashboard/settings' });
  }

  return (
    <aside className="sidebar glass">
      <div className="sidebar-header">
        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
          <h2>WorkHourly</h2>
        </Link>
      </div>

      <div className="workspace-switcher-wrapper" ref={dropdownRef}>
        <div className="workspace-switcher" onClick={() => setShowDropdown(!showDropdown)}>
          <div className="ws-current-info">
            <span className="ws-icon">{tenant ? tenant.name.substring(0, 1) : 'W'}</span>
            <div className="ws-text">
              <span className="ws-name">{tenant ? tenant.name : '워크스페이스'}</span>
              <span className="ws-role">▼ 변경하기</span>
            </div>
          </div>
        </div>

        {showDropdown && (
          <div className="ws-dropdown animate-slide-down">
            <div className="ws-dropdown-list">
              {memberships.map((m) => (
                <div 
                  key={m.tenant.id} 
                  className={`ws-dropdown-item ${tenant?.id === m.tenant.id ? 'active' : ''}`}
                  onClick={() => handleSwitchWorkspace(m)}
                >
                  <div className="ws-icon-small">{m.tenant.name.substring(0, 1)}</div>
                  <div className="ws-item-info">
                    <span className="ws-item-name">{m.tenant.name}</span>
                    <span className="ws-item-role">{m.role === 'ADMIN' ? '관리자' : '직원'}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="ws-dropdown-footer">
              <button onClick={() => router.push('/onboarding')}>
                + 워크스페이스 추가/참여
              </button>
            </div>
          </div>
        )}
      </div>

      <nav>
        <ul>
          {menuItems.map((item) => (
            <li 
              key={item.path} 
              className={pathname === item.path ? 'active' : ''}
              onClick={() => router.push(item.path)}
            >
              {item.name}
            </li>
          ))}
        </ul>
      </nav>
      <div className="sidebar-footer">
        <button onClick={() => {
          localStorage.clear();
          router.push('/login');
        }}>로그아웃</button>
      </div>

      <style jsx>{`
        .sidebar {
          width: 260px;
          height: 100vh;
          padding: 2rem 1.5rem;
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .sidebar-header h2 {
          color: var(--primary);
          margin-bottom: 1.5rem;
          font-family: var(--font-heading);
          text-align: center;
        }

        /* Workspace Switcher Styles */
        .workspace-switcher-wrapper {
          position: relative;
          margin-bottom: 2rem;
        }
        .workspace-switcher {
          background: white;
          border: 1px solid var(--border);
          padding: 10px 14px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .workspace-switcher:hover {
          border-color: var(--primary-light);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .ws-current-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .ws-icon {
          width: 32px; height: 32px;
          background: linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%);
          color: white; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          font-weight: bold; font-size: 1.1rem;
        }
        .ws-text { display: flex; flex-direction: column; }
        .ws-name { font-weight: 600; font-size: 0.95rem; color: var(--text-main); }
        .ws-role { font-size: 0.75rem; color: var(--text-muted); margin-top: 2px; }

        .ws-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 0; width: 100%;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);
          border: 1px solid var(--border);
          z-index: 100;
          overflow: hidden;
        }
        .ws-dropdown-list { max-height: 200px; overflow-y: auto; }
        .ws-dropdown-item {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 14px; cursor: pointer; border-bottom: 1px solid #f1f5f9;
          transition: background 0.2s;
        }
        .ws-dropdown-item:hover { background: #f8fafc; }
        .ws-dropdown-item.active { background: #eff6ff; }
        .ws-icon-small {
          width: 28px; height: 28px; background: #e2e8f0; color: #475569;
          border-radius: 6px; display: flex; align-items: center; justify-content: center;
          font-weight: 600; font-size: 0.9rem;
        }
        .ws-dropdown-item.active .ws-icon-small { background: var(--primary); color: white; }
        .ws-item-info { display: flex; flex-direction: column; }
        .ws-item-name { font-size: 0.9rem; font-weight: 500; color: var(--text-main); }
        .ws-item-role { font-size: 0.75rem; color: var(--text-muted); }

        .ws-dropdown-footer {
          padding: 8px; background: #f8fafc;
        }
        .ws-dropdown-footer button {
          width: 100%; padding: 10px; background: transparent;
          color: var(--primary); font-weight: 600; font-size: 0.9rem;
          border-radius: 8px; transition: background 0.2s;
        }
        .ws-dropdown-footer button:hover { background: #e0e7ff; }

        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-down { animation: slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

        /* Navigation Styles */
        nav ul { list-style: none; }
        nav li {
          padding: 12px 16px; border-radius: 12px; margin-bottom: 8px;
          cursor: pointer; font-weight: 500; color: var(--text-muted); transition: all 0.2s;
        }
        nav li.active, nav li:hover {
          background: var(--primary); color: white; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
        }

        .sidebar-footer { margin-top: auto; }
        .sidebar-footer button {
          width: 100%; padding: 12px; background: #fef2f2; color: #b91c1c;
          font-weight: 600; border-radius: 12px; transition: background 0.2s;
        }
        .sidebar-footer button:hover { background: #fee2e2; }
      `}</style>
    </aside>
  );
}

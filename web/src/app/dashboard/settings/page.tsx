"use client";

import React, { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';

export default function SettingsPage() {
  const [domain, setDomain] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTenantInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await apiRequest('/tenants/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDomain(res.domain || '');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTenantInfo();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      await apiRequest('/tenants/me', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ domain })
      });
      alert('설정이 성공적으로 저장되었습니다.');
    } catch (err: any) {
      alert(err.message || '설정 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <section className="main-content">
        <header className="top-header glass">
          <div className="header-info">
            <h1>관리자 설정</h1>
            <p>워크스페이스의 환경설정 및 도메인 연동을 관리합니다.</p>
          </div>
        </header>

        <div className="content-body">
          <div className="settings-card glass">
            <h2 className="section-title">회사 메일 도메인 설정</h2>
            <p className="section-desc">회사의 자체 도메인을 등록하여 사내 메일 주소로 연동할 수 있습니다. (예: keyoninc.com)</p>
            
            <div className="form-group">
              <label>연동 도메인 주소</label>
              <div className="input-group">
                <span className="input-prefix">@</span>
                <input 
                  type="text" 
                  placeholder="example.com" 
                  value={domain} 
                  onChange={(e) => setDomain(e.target.value)} 
                />
              </div>
            </div>

            <div className="form-actions">
              <button className="save-btn" onClick={handleSave} disabled={saving}>
                {saving ? '저장 중...' : '변경사항 저장'}
              </button>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .settings-card {
          padding: 2.5rem;
          border-radius: 20px;
          background: white;
          border: 1px solid var(--border);
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);
          max-width: 800px;
        }

        .section-title {
          font-size: 1.25rem;
          color: #0f172a;
          margin-bottom: 0.5rem;
        }

        .section-desc {
          color: #64748b;
          font-size: 0.95rem;
          margin-bottom: 2rem;
        }

        .form-group {
          margin-bottom: 2rem;
        }

        .form-group label {
          display: block;
          font-weight: 600;
          font-size: 0.95rem;
          color: #1e293b;
          margin-bottom: 0.75rem;
        }

        .input-group {
          display: flex;
          align-items: center;
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          overflow: hidden;
          transition: border-color 0.2s;
        }

        .input-group:focus-within {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .input-prefix {
          background: #f8fafc;
          padding: 14px 18px;
          color: #64748b;
          font-weight: 600;
          border-right: 1px solid #cbd5e1;
        }

        .input-group input {
          flex: 1;
          border: none;
          padding: 14px 16px;
          outline: none;
          font-size: 1rem;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          padding-top: 1.5rem;
          border-top: 1px solid #f1f5f9;
        }

        .save-btn {
          padding: 12px 28px;
          background: var(--primary);
          color: white;
          font-weight: 600;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.2s;
        }

        .save-btn:hover:not(:disabled) {
          background: var(--primary-dark);
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(59, 130, 246, 0.3);
        }

        .save-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </>
  );
}

"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';

export default function JoinWorkspacePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [businessNumber, setBusinessNumber] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      await apiRequest('/auth/join-tenant', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ businessNumber }),
      });
      
      alert('조직 참여가 완료되었습니다.');
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || '초대 코드가 유효하지 않거나 이미 참여 중인 조직입니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <header className="mobile-header">
        <button className="back-btn" onClick={() => router.back()}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          뒤로
        </button>
      </header>

      <div className="auth-background">
        <div className="shape shape-2"></div>
      </div>

      <main className="auth-container">
        <div className="onboarding-form-card animate-slide-up">
          <div className="auth-header">
            <h1>기존 조직 참여</h1>
            <p>초대 코드를 입력하여 팀에 합류하세요.</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && <div className="error-alert">{error}</div>}
            
            <div className="form-group">
              <label htmlFor="businessNumber">초대 코드 (사업자번호)</label>
              <div className="input-wrapper">
                <input 
                  type="text" 
                  id="businessNumber" 
                  placeholder="예: 000-00-00000" 
                  value={businessNumber} 
                  onChange={(e) => setBusinessNumber(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <button type="submit" className="primary-btn" disabled={loading} style={{ marginTop: '2rem' }}>
              {loading ? '참여 중...' : '조직 참여하기'}
            </button>
          </form>
        </div>
      </main>

      <style jsx>{`
        .onboarding-form-card {
          width: 100%;
          max-width: 440px;
          padding: 3rem;
          border-radius: 28px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(24px);
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1);
        }
        .auth-header { text-align: center; margin-bottom: 2rem; }
        .auth-header h1 { font-size: 1.6rem; color: var(--secondary); margin-bottom: 0.5rem; }
        .auth-header p { color: var(--text-muted); font-size: 0.95rem; }
        .form-group { margin-bottom: 1.25rem; }
        .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.9rem; }
        .input-wrapper input {
          width: 100%; padding: 14px 16px; border-radius: 12px; border: 1px solid var(--border);
          font-size: 1.05rem; text-align: center; letter-spacing: 2px;
        }
        .error-alert { background: #fef2f2; color: #b91c1c; padding: 12px; border-radius: 12px; margin-bottom: 1.5rem; text-align: center; }
      `}</style>
    </div>
  );
}

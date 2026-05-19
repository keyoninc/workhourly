"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('memberships', JSON.stringify(data.memberships));

      if (data.memberships.length === 0) {
        router.push('/onboarding');
      } else if (data.memberships.length === 1) {
        localStorage.setItem('tenant', JSON.stringify(data.memberships[0].tenant));
        router.push('/dashboard');
      } else {
        router.push('/select-workspace');
      }
    } catch (err: any) {
      setError(err.message);
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
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <main className="auth-container">
        <div className="auth-card animate-slide-up">
          <div className="auth-header">
            <div className="logo-box">
               <Image src="/logo.png" alt="WorkHourly Logo" width={48} height={48} />
            </div>
            <h1>다시 오신 것을 환영합니다</h1>
            <p>WorkHourly로 스마트한 업무를 시작하세요</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="error-alert">{error}</div>}
            
            <div className="form-group">
              <label htmlFor="email">이메일 계정</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                <input 
                  type="email" 
                  id="email" 
                  placeholder="name@company.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">비밀번호</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                <input 
                  type="password" 
                  id="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="auth-options">
              <label className="checkbox-container">
                <input type="checkbox" />
                <span className="checkmark"></span>
                자동 로그인
              </label>
              <a href="#" className="forgot-link">비밀번호 찾기</a>
            </div>

            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          <div className="auth-footer">
            <p>계정이 없으신가요? <Link href="/signup">회원가입</Link></p>
          </div>
        </div>
      </main>

      <style jsx>{`
        .auth-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }
        .logo-box {
          display: inline-flex;
          padding: 14px;
          background: white;
          border-radius: 18px;
          box-shadow: 0 8px 16px -4px rgba(0,0,0,0.1);
          margin-bottom: 1.5rem;
        }
        .auth-header h1 {
          font-size: 1.8rem;
          color: var(--secondary);
          letter-spacing: -0.5px;
          margin-bottom: 0.5rem;
        }
        .auth-header p {
          color: var(--text-muted);
          font-size: 0.95rem;
        }
        .form-group {
          margin-bottom: 1.25rem;
        }
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--secondary);
        }
        .error-alert {
          background: #fef2f2;
          color: #b91c1c;
          padding: 12px;
          border-radius: 12px;
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
          border: 1px solid #fee2e2;
          text-align: center;
        }
        .auth-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 1.5rem 0 2rem;
          font-size: 0.9rem;
        }
        .checkbox-container {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-muted);
          cursor: pointer;
        }
        .forgot-link {
          color: var(--primary);
          font-weight: 600;
          text-decoration: none;
        }
        .auth-footer {
          margin-top: 2.5rem;
          text-align: center;
          font-size: 0.95rem;
          color: var(--text-muted);
        }
        .auth-footer a {
          color: var(--primary);
          font-weight: 700;
          text-decoration: none;
          margin-left: 0.5rem;
        }
      `}</style>
    </div>
  );
}

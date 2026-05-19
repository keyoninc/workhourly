"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function OnboardingPage() {
  const router = useRouter();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (window.location.search.includes('welcome=true')) {
      setShowWelcome(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

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
        <div className="shape shape-3"></div>
      </div>

      <main className="auth-container">
        <div className="onboarding-card animate-slide-up">
          <div className="auth-header">
            <h1>워크스페이스 설정</h1>
            <p>어떻게 시작하시겠습니까?</p>
          </div>

          <div className="options-grid">
            <button className="option-btn" onClick={() => router.push('/onboarding/create-workspace')}>
              <div className="icon-wrapper bg-blue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h3>새로운 회사 등록 (관리자)</h3>
              <p>사업자등록증을 인증하고 워크스페이스를 개설합니다.</p>
            </button>

            <button className="option-btn" onClick={() => router.push('/onboarding/join-workspace')}>
              <div className="icon-wrapper bg-green">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
              </div>
              <h3>기존 조직 참여 (직원)</h3>
              <p>초대 코드(사업자번호)를 입력하여 합류합니다.</p>
            </button>
          </div>
        </div>
      </main>

      {showWelcome && (
        <div className="modal-overlay">
          <div className="modal-content animate-slide-up" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <div className="welcome-icon" style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
            <h2 style={{ fontSize: '1.8rem', color: 'var(--secondary)', marginBottom: '1rem' }}>가입을 환영합니다!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.6' }}>
              WorkHourly의 회원이 되신 것을 진심으로 환영합니다.<br/>
              이제 워크스페이스(회사)를 생성하거나 기존 조직에 참여해 보세요.
            </p>
            <button className="primary-btn" onClick={() => setShowWelcome(false)} style={{ width: '100%', maxWidth: '200px' }}>
              시작하기
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .onboarding-card {
          width: 100%;
          max-width: 600px;
          padding: 3rem;
          border-radius: 28px;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(24px);
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1);
        }
        .auth-header {
          text-align: center;
          margin-bottom: 3rem;
        }
        .auth-header h1 {
          font-size: 1.8rem;
          color: var(--secondary);
        }
        .options-grid {
          display: grid;
          gap: 1.5rem;
        }
        .option-btn {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding: 1.5rem;
          background: white;
          border: 1px solid var(--border);
          border-radius: 20px;
          transition: all 0.2s ease;
          text-align: left;
        }
        .option-btn:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px -8px rgba(0,0,0,0.1);
          border-color: var(--primary-light);
        }
        .icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
          color: white;
        }
        .bg-blue { background: linear-gradient(135deg, #3b82f6, #2563eb); }
        .bg-green { background: linear-gradient(135deg, #10b981, #059669); }
        
        .option-btn h3 {
          font-size: 1.2rem;
          margin-bottom: 0.5rem;
          color: var(--text-main);
        }
        .option-btn p {
          font-size: 0.95rem;
          color: var(--text-muted);
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex; align-items: center; justify-content: center;
          z-index: 100;
          backdrop-filter: blur(4px);
        }
        .modal-content {
          background: white;
          border-radius: 24px;
          width: 90%; max-width: 450px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
}

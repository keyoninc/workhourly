"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <main className="landing-container gradient-bg">
      <nav className="nav-bar glass">
        <div className="nav-logo">
          <Image src="/logo.png" alt="WorkHourly Logo" width={32} height={32} />
          <span>WorkHourly</span>
        </div>
        <div className="nav-links">
          <Link href="/login" className="nav-btn-text">로그인</Link>
          <Link href="/signup" className="nav-btn-primary">무료로 시작하기</Link>
        </div>
      </nav>

      <section className="hero-section animate-fade-in">
        <div className="hero-content">
          <span className="badge">New Era of Work</span>
          <h1>비즈니스의 속도를 <br /><span>시간당 가치</span>로 증명하세요</h1>
          <p>근태관리부터 전자결재까지, <br />우리 회사에 꼭 필요한 기능을 하나의 플랫폼에서 경험하세요.</p>
          
          <div className="hero-btns">
            <Link href="/signup" className="hero-btn-primary">워크아월리 시작하기</Link>
            <button className="hero-btn-secondary">데모 보기</button>
          </div>
        </div>

        <div className="hero-visual">
          <div className="visual-card glass">
            <div className="card-header">
              <div className="dot red"></div>
              <div className="dot yellow"></div>
              <div className="dot green"></div>
            </div>
            <div className="card-body">
              <div className="skeleton title"></div>
              <div className="skeleton text"></div>
              <div className="skeleton text-short"></div>
              <div className="grid">
                 <div className="skeleton item"></div>
                 <div className="skeleton item"></div>
                 <div className="skeleton item"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .landing-container {
          min-height: 100vh;
        }

        .nav-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 5%;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 1.25rem;
          color: var(--secondary);
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .nav-btn-text {
          text-decoration: none;
          color: var(--text-main);
          font-weight: 500;
          font-size: 0.95rem;
        }

        .nav-btn-primary {
          text-decoration: none;
          background: var(--secondary);
          color: white;
          padding: 10px 20px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.95rem;
        }

        .hero-section {
          padding: 180px 10% 100px;
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 4rem;
          align-items: center;
        }

        .badge {
          display: inline-block;
          padding: 6px 16px;
          background: #dbeafe;
          color: var(--primary);
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
        }

        .hero-content h1 {
          font-size: 4rem;
          line-height: 1.1;
          color: var(--secondary);
          margin-bottom: 1.5rem;
          letter-spacing: -1.5px;
        }

        .hero-content h1 span {
          color: var(--primary);
        }

        .hero-content p {
          font-size: 1.25rem;
          color: var(--text-muted);
          margin-bottom: 3rem;
          line-height: 1.6;
        }

        .hero-btns {
          display: flex;
          gap: 1.25rem;
        }

        .hero-btn-primary {
          text-decoration: none;
          background: var(--primary);
          color: white;
          padding: 18px 36px;
          border-radius: 14px;
          font-size: 1.1rem;
          font-weight: 700;
          box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
        }

        .hero-btn-secondary {
          background: white;
          color: var(--secondary);
          padding: 18px 36px;
          border-radius: 14px;
          font-size: 1.1rem;
          font-weight: 700;
          border: 1px solid var(--border);
        }

        .hero-visual {
          position: relative;
        }

        .visual-card {
          width: 100%;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 30px 60px rgba(0,0,0,0.1);
        }

        .card-header {
          background: rgba(0,0,0,0.03);
          padding: 12px 16px;
          display: flex;
          gap: 6px;
        }

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .dot.red { background: #ff5f56; }
        .dot.yellow { background: #ffbd2e; }
        .dot.green { background: #27c93f; }

        .card-body {
          padding: 30px;
        }

        .skeleton {
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: loading 2s infinite;
          border-radius: 4px;
        }

        .skeleton.title { height: 24px; width: 60%; margin-bottom: 20px; }
        .skeleton.text { height: 12px; width: 90%; margin-bottom: 10px; }
        .skeleton.text-short { height: 12px; width: 40%; margin-bottom: 30px; }

        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 15px;
        }

        .skeleton.item { height: 120px; border-radius: 12px; }

        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @media (max-width: 1024px) {
          .hero-section {
            grid-template-columns: 1fr;
            text-align: center;
            padding-top: 140px;
          }
          .hero-content h1 { font-size: 3rem; }
          .hero-btns { justify-content: center; }
          .hero-visual { display: none; }
          .nav-links { display: none; }
        }
      `}</style>
    </main>
  );
}

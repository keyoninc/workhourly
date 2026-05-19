"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';

export default function CreateWorkspacePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    businessNumber: '',
    representativeName: '',
  });

  const [file, setFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // In a real scenario, first upload the file to MinIO, get URL
      // const formDataObj = new FormData();
      // formDataObj.append('file', file);
      // const uploadRes = await uploadFileToMinio(formDataObj);
      // const businessLicenseUrl = uploadRes.url;
      
      const businessLicenseUrl = "mock-minio-url/license.jpg";

      const token = localStorage.getItem('token');
      await apiRequest('/auth/register-tenant', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...formData,
          businessLicenseUrl,
        }),
      });
      
      alert('워크스페이스가 성공적으로 생성되었습니다.');
      // Refresh user memberships from login or just push to dashboard
      // Typically we'd fetch me() or just redirect to login to refresh token
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || '처리 중 오류가 발생했습니다.');
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
      </div>

      <main className="auth-container">
        <div className="onboarding-form-card animate-slide-up">
          <div className="auth-header">
            <h1>회사 등록 (관리자)</h1>
            <p>사업자 정보를 입력하고 인증을 진행합니다.</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && <div className="error-alert">{error}</div>}
            
            <div className="form-group">
              <label htmlFor="name">회사명 (워크스페이스 이름)</label>
              <div className="input-wrapper">
                <input type="text" id="name" placeholder="(주)워크아월리" value={formData.name} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="businessNumber">사업자 등록번호</label>
              <div className="input-wrapper">
                <input type="text" id="businessNumber" placeholder="000-00-00000" value={formData.businessNumber} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="representativeName">대표자명</label>
              <div className="input-wrapper">
                <input type="text" id="representativeName" placeholder="홍길동" value={formData.representativeName} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="licenseFile">사업자등록증 업로드 (MinIO 연동용)</label>
              <div className="file-upload-wrapper">
                <input type="file" id="licenseFile" accept="image/*,.pdf" onChange={handleFileChange} required />
                <div className="file-upload-ui">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                  <span>{file ? file.name : '클릭하여 파일 선택'}</span>
                </div>
              </div>
            </div>

            <button type="submit" className="primary-btn" disabled={loading} style={{ marginTop: '2rem' }}>
              {loading ? '등록 처리 중...' : '관리자로 워크스페이스 개설'}
            </button>
          </form>
        </div>
      </main>

      <style jsx>{`
        .onboarding-form-card {
          width: 100%;
          max-width: 500px;
          padding: 3rem;
          border-radius: 28px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(24px);
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1);
        }
        .auth-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .auth-header h1 { font-size: 1.6rem; color: var(--secondary); margin-bottom: 0.5rem; }
        .auth-header p { color: var(--text-muted); font-size: 0.95rem; }
        
        .form-group { margin-bottom: 1.25rem; }
        .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.9rem; }
        .input-wrapper input {
          width: 100%; padding: 12px 16px; border-radius: 12px; border: 1px solid var(--border);
          font-size: 1rem;
        }
        
        .file-upload-wrapper {
          position: relative;
          width: 100%;
          height: 120px;
        }
        .file-upload-wrapper input[type="file"] {
          position: absolute; width: 100%; height: 100%; opacity: 0; cursor: pointer; z-index: 10;
        }
        .file-upload-ui {
          position: absolute; top: 0; left: 0; right: 0; bottom: 0;
          border: 2px dashed var(--primary-light);
          border-radius: 16px;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          background: rgba(59, 130, 246, 0.05);
          color: var(--primary);
          transition: all 0.2s;
        }
        .file-upload-wrapper:hover .file-upload-ui {
          background: rgba(59, 130, 246, 0.1);
        }
        .file-upload-ui svg { width: 32px; height: 32px; margin-bottom: 8px; }
        
        .error-alert { background: #fef2f2; color: #b91c1c; padding: 12px; border-radius: 12px; margin-bottom: 1.5rem; text-align: center; }
      `}</style>
    </div>
  );
}

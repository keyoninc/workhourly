"use client";

import React, { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';

type Mail = {
  id: string;
  subject: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender?: { name: string; email: string; profileImageUrl?: string };
  recipient?: { name: string; email: string; profileImageUrl?: string };
  recipientEmail: string;
};

export default function MailPage() {
  const [activeFolder, setActiveFolder] = useState<'inbox' | 'sent'>('inbox');
  const [mails, setMails] = useState<Mail[]>([]);
  const [selectedMail, setSelectedMail] = useState<Mail | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeContent, setComposeContent] = useState('');
  const [sending, setSending] = useState(false);

  const fetchMails = async (folder: 'inbox' | 'sent') => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await apiRequest(`/mail/${folder}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMails(res);
      setSelectedMail(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMails(activeFolder);
  }, [activeFolder]);

  const handleSelectMail = async (mail: Mail) => {
    setSelectedMail(mail);
    setIsComposing(false);
    
    // Mark as read if in inbox
    if (activeFolder === 'inbox' && !mail.isRead) {
      try {
        const token = localStorage.getItem('token');
        await apiRequest(`/mail/${mail.id}/read`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` }
        });
        setMails(mails.map(m => m.id === mail.id ? { ...m, isRead: true } : m));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSendMail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo || !composeSubject || !composeContent) return;

    try {
      setSending(true);
      const token = localStorage.getItem('token');
      await apiRequest('/mail', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          recipientEmail: composeTo,
          subject: composeSubject,
          content: composeContent
        })
      });
      
      alert('메일이 성공적으로 전송되었습니다.');
      setIsComposing(false);
      setComposeTo('');
      setComposeSubject('');
      setComposeContent('');
      
      if (activeFolder === 'sent') {
        fetchMails('sent');
      }
    } catch (err: any) {
      alert(err.message || '메일 전송에 실패했습니다.');
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <>
      <section className="mail-container">
        {/* Mail Sidebar */}
        <div className="mail-sidebar glass">
          <button className="compose-btn" onClick={() => { setIsComposing(true); setSelectedMail(null); }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
            새 메일 쓰기
          </button>
          
          <ul className="folder-list">
            <li className={activeFolder === 'inbox' ? 'active' : ''} onClick={() => { setActiveFolder('inbox'); setIsComposing(false); }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></svg>
              받은편지함
            </li>
            <li className={activeFolder === 'sent' ? 'active' : ''} onClick={() => { setActiveFolder('sent'); setIsComposing(false); }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
              보낸편지함
            </li>
          </ul>
        </div>

        {/* Mail List */}
        <div className="mail-list glass">
          <div className="list-header">
            <h2>{activeFolder === 'inbox' ? '받은편지함' : '보낸편지함'}</h2>
          </div>
          <div className="list-content">
            {loading ? (
              <div className="loading-state">로딩 중...</div>
            ) : mails.length === 0 ? (
              <div className="empty-state">메일이 없습니다.</div>
            ) : (
              mails.map(mail => (
                <div 
                  key={mail.id} 
                  className={`mail-item ${selectedMail?.id === mail.id ? 'selected' : ''} ${!mail.isRead && activeFolder === 'inbox' ? 'unread' : ''}`}
                  onClick={() => handleSelectMail(mail)}
                >
                  <div className="mail-sender">
                    {activeFolder === 'inbox' ? mail.sender?.name || mail.sender?.email || 'Unknown' : mail.recipient?.name || mail.recipientEmail}
                  </div>
                  <div className="mail-subject">{mail.subject}</div>
                  <div className="mail-date">{formatDate(mail.createdAt)}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Mail Content / Compose */}
        <div className="mail-content-area glass">
          {isComposing ? (
            <div className="compose-box">
              <div className="compose-header">새 메일 작성</div>
              <form onSubmit={handleSendMail} className="compose-form">
                <div className="compose-field">
                  <label>받는 사람</label>
                  <input type="email" value={composeTo} onChange={e => setComposeTo(e.target.value)} required placeholder="이메일 주소 입력" />
                </div>
                <div className="compose-field">
                  <label>제목</label>
                  <input type="text" value={composeSubject} onChange={e => setComposeSubject(e.target.value)} required placeholder="제목 입력" />
                </div>
                <div className="compose-field editor">
                  <textarea value={composeContent} onChange={e => setComposeContent(e.target.value)} required placeholder="내용을 입력하세요..." />
                </div>
                <div className="compose-actions">
                  <button type="submit" className="send-btn" disabled={sending}>
                    {sending ? '전송 중...' : '보내기'}
                  </button>
                </div>
              </form>
            </div>
          ) : selectedMail ? (
            <div className="read-box">
              <div className="read-header">
                <h2>{selectedMail.subject}</h2>
                <div className="mail-meta">
                  <div className="meta-info">
                    <span className="label">보낸사람:</span> 
                    <span className="value">{selectedMail.sender?.name || selectedMail.sender?.email || '알 수 없음'}</span>
                  </div>
                  <div className="meta-info">
                    <span className="label">받는사람:</span> 
                    <span className="value">{selectedMail.recipientEmail}</span>
                  </div>
                  <div className="meta-date">{formatDate(selectedMail.createdAt)}</div>
                </div>
              </div>
              <div className="read-body">
                {selectedMail.content.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-content">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
              <p>메일을 선택하거나 새 메일을 작성하세요</p>
            </div>
          )}
        </div>
      </section>

      <style jsx>{`
        .mail-container {
          flex: 1;
          display: flex;
          padding: 1.5rem;
          gap: 1.5rem;
          height: 100vh;
          overflow: hidden;
        }

        .mail-sidebar {
          width: 240px;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          padding: 1.5rem 1rem;
          flex-shrink: 0;
        }

        .compose-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 14px;
          background: var(--primary);
          color: white;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1rem;
          margin-bottom: 2rem;
          transition: all 0.2s;
        }

        .compose-btn:hover {
          background: var(--primary-dark);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .folder-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .folder-list li {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 10px;
          color: var(--text-muted);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .folder-list li:hover {
          background: rgba(0,0,0,0.03);
          color: var(--secondary);
        }

        .folder-list li.active {
          background: #eff6ff;
          color: var(--primary);
        }

        .mail-list {
          width: 320px;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          flex-shrink: 0;
        }

        .list-header {
          padding: 1.5rem;
          border-bottom: 1px solid var(--border);
        }

        .list-header h2 {
          font-size: 1.1rem;
          color: var(--secondary);
        }

        .list-content {
          flex: 1;
          overflow-y: auto;
        }

        .mail-item {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--border);
          cursor: pointer;
          transition: background 0.2s;
        }

        .mail-item:hover {
          background: rgba(0,0,0,0.02);
        }

        .mail-item.selected {
          background: #eff6ff;
          border-left: 3px solid var(--primary);
        }

        .mail-item.unread .mail-subject {
          font-weight: 700;
          color: var(--secondary);
        }

        .mail-sender {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 4px;
        }

        .mail-subject {
          font-size: 0.95rem;
          color: #334155;
          margin-bottom: 6px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .mail-date {
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .mail-content-area {
          flex: 1;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .empty-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          gap: 1rem;
        }

        .read-box {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .read-header {
          padding: 2rem;
          border-bottom: 1px solid var(--border);
        }

        .read-header h2 {
          font-size: 1.5rem;
          color: var(--secondary);
          margin-bottom: 1.5rem;
        }

        .mail-meta {
          background: #f8fafc;
          padding: 1rem;
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .meta-info {
          font-size: 0.9rem;
        }

        .meta-info .label {
          color: #64748b;
          width: 70px;
          display: inline-block;
        }

        .meta-info .value {
          color: var(--secondary);
          font-weight: 500;
        }

        .meta-date {
          font-size: 0.8rem;
          color: #94a3b8;
          margin-top: 0.5rem;
        }

        .read-body {
          padding: 2rem;
          flex: 1;
          overflow-y: auto;
          color: #334155;
          line-height: 1.7;
          font-size: 1rem;
        }
        
        .read-body p {
          margin-bottom: 1rem;
        }

        .compose-box {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .compose-header {
          padding: 1.5rem 2rem;
          font-weight: 700;
          font-size: 1.1rem;
          color: var(--secondary);
          border-bottom: 1px solid var(--border);
        }

        .compose-form {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .compose-field {
          display: flex;
          border-bottom: 1px solid var(--border);
          padding: 1rem 2rem;
          align-items: center;
        }

        .compose-field label {
          width: 80px;
          color: #64748b;
          font-weight: 600;
          font-size: 0.95rem;
        }

        .compose-field input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 1rem;
          padding: 8px 0;
        }

        .compose-field.editor {
          flex: 1;
          padding: 2rem;
          align-items: flex-start;
          border-bottom: none;
        }

        .compose-field textarea {
          width: 100%;
          height: 100%;
          border: none;
          outline: none;
          resize: none;
          font-size: 1rem;
          line-height: 1.6;
          font-family: inherit;
        }

        .compose-actions {
          padding: 1.5rem 2rem;
          border-top: 1px solid var(--border);
          display: flex;
          justify-content: flex-end;
          background: #f8fafc;
        }

        .send-btn {
          padding: 12px 32px;
          background: var(--primary);
          color: white;
          font-weight: 700;
          border-radius: 12px;
          transition: all 0.2s;
        }

        .send-btn:hover:not(:disabled) {
          background: var(--primary-dark);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .loading-state, .empty-state {
          padding: 2rem;
          text-align: center;
          color: #94a3b8;
          font-size: 0.9rem;
        }
      `}</style>
    </>
  );
}

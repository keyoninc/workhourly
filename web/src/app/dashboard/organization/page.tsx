"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { apiRequest } from '@/lib/api';
import * as XLSX from 'xlsx';

interface Department {
  id: string;
  name: string;
  parentId: string | null;
  level: number;
  children: Department[];
  memberships?: {
    id: string;
    status: string;
    joinDate?: string; birthDate?: string; resignationDate?: string; residentNumber?: string; phone?: string;
    address?: string; education?: string; certifications?: string; bankAccount?: string;
    user: { name: string; email: string; }
  }[];
  invitations?: { id: string; name: string; email: string; status: string }[];
}

export default function OrganizationPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSingleInviteModal, setShowSingleInviteModal] = useState(false);
  const [singleInviteData, setSingleInviteData] = useState({ name: '', email: '', departmentId: '' });

  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [empForm, setEmpForm] = useState<any>({});

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!token || !storedUser) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(storedUser));
    fetchDepartments(token);
  }, [router]);

  const fetchDepartments = async (token: string) => {
    try {
      const data = await apiRequest('/departments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDepartments(data);
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    } finally {
      setLoading(false);
    }
  };

  const addDepartment = async (parentId: string | null, name: string) => {
    const token = localStorage.getItem('token');
    try {
      await apiRequest('/departments', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, parentId }),
      });
      fetchDepartments(token!);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const deleteDepartment = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    const token = localStorage.getItem('token');
    try {
      await apiRequest(`/departments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDepartments(token!);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const moveItem = async (draggedId: string, targetId: string, type: 'DEPARTMENT' | 'EMPLOYEE', isInvitation: boolean = false) => {
    if (type === 'DEPARTMENT' && draggedId === targetId) return;
    if (!confirm(type === 'DEPARTMENT' ? '해당 부서를 선택한 위치로 이동하시겠습니까?' : '해당 직원을 선택한 조직으로 이동하시겠습니까?')) return;

    const token = localStorage.getItem('token');
    try {
      if (type === 'DEPARTMENT') {
        await apiRequest(`/departments/${draggedId}`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({ parentId: targetId }),
        });
      } else {
        await apiRequest(`/departments/move-employee`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({ employeeId: draggedId, targetDepartmentId: targetId, isInvitation }),
        });
      }
      fetchDepartments(token!);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const downloadExcelSample = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['이름', '이메일', '부서명'],
      ['홍길동', 'hong@example.com', '플랫폼사업팀'],
      ['김철수', 'kim@example.com', '영업팀'],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '초대_양식');
    XLSX.writeFile(wb, '직원일괄초대_샘플양식.xlsx');
  };

  const handleSingleInvite = async () => {
    if (!singleInviteData.name || !singleInviteData.email || !singleInviteData.departmentId) {
      alert('모든 필드를 입력해 주세요.');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      await apiRequest('/departments/invite', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(singleInviteData),
      });
      alert(`${singleInviteData.name}님에게 초대 이메일을 발송했습니다!`);
      setShowSingleInviteModal(false);
      setSingleInviteData({ name: '', email: '', departmentId: '' });
      fetchDepartments(token!);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const flattenDepartments = (depts: Department[], result: { id: string, name: string, level: number }[] = []) => {
    depts.forEach(d => {
      result.push({ id: d.id, name: d.name, level: d.level });
      if (d.children) flattenDepartments(d.children, result);
    });
    return result;
  };
  const flatDepts = flattenDepartments(departments);
  const handleSelectEmployee = (emp: any) => {
    setSelectedEmployee(emp);
    const today = new Date().toISOString().split('T')[0];
    setEmpForm({
      joinDate: emp.joinDate ? new Date(emp.joinDate).toISOString().split('T')[0] : today,
      birthDate: emp.birthDate ? new Date(emp.birthDate).toISOString().split('T')[0] : '',
      resignationDate: emp.resignationDate ? new Date(emp.resignationDate).toISOString().split('T')[0] : '',
      residentNumber: emp.residentNumber || '',
      phone: emp.phone || '',
      address: emp.address || '',
      education: emp.education || '',
      certifications: emp.certifications || '',
      bankAccount: emp.bankAccount || '',
    });
  };

  const handleSaveEmployee = async () => {
    const token = localStorage.getItem('token');
    try {
      await apiRequest(`/departments/employee/${selectedEmployee.id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(empForm),
      });
      alert('직원 정보가 저장되었습니다.');
      fetchDepartments(token!);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!confirm('정말 직원을 영구 삭제하시겠습니까?\n(기록 보존을 원하시면 [퇴사일]을 입력하세요.)')) return;
    const token = localStorage.getItem('token');
    try {
      await apiRequest(`/departments/employee/${selectedEmployee.id}?isInvitation=false`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      fetchDepartments(token!);
      setSelectedEmployee(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDownloadTemplate = () => {
    // Generate dummy CSV for now
    const headers = "이름,이메일,입사일,생년월일,주민번호앞6자리,연락처,주소지,최종학력,자격증정보,급여계좌\n홍길동,hong@example.com,2026-05-19,900101,900101,010-1234-5678,서울시 강남구,대학교 졸업,정보처리기사,국민은행 123-456-789";
    const blob = new Blob(['\ufeff' + headers], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', '직원일괄초대양식.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <section className="main-content">
        <header className="top-header glass">
          <div className="header-info">
            <h1>조직도 설정</h1>
            <p>회사의 조직 구조를 설계하고 직원을 초대합니다.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="invite-btn outline" onClick={() => setShowSingleInviteModal(true)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>
              직원 개별 초대
            </button>
            <button className="invite-btn" onClick={() => setShowInviteModal(true)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
              엑셀 일괄 초대
            </button>
          </div>
        </header>

        <div className="content-body">
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="layout-split">
              <div className="org-tree-container glass">
                <h3 className="section-title">부서(팀) 관리</h3>
                <div className="tree-root">
                  {departments.map((dept) => (
                    <TreeNode
                      key={dept.id}
                      dept={dept}
                      onAdd={addDepartment}
                      onDelete={deleteDepartment}
                      onMove={moveItem}
                      onSelectEmp={handleSelectEmployee}
                      selectedEmpId={selectedEmployee?.id}
                    />
                  ))}
                </div>
              </div>

              <div className="emp-detail-container glass">
                <h3 className="section-title">직원 상세 정보</h3>
                {selectedEmployee ? (
                  <div className="emp-form">
                    <div className="form-header">
                      <div className="emp-avatar">👤</div>
                      <div>
                        <h4>{selectedEmployee.user.name}</h4>
                        <p>{selectedEmployee.user.email}</p>
                      </div>
                    </div>

                    <div className="form-grid">
                      <div className="form-group">
                        <label>입사일</label>
                        <input type="date" value={empForm.joinDate || ''} onChange={e => setEmpForm({ ...empForm, joinDate: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>퇴사일</label>
                        <input type="date" value={empForm.resignationDate || ''} onChange={e => setEmpForm({ ...empForm, resignationDate: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>생년월일</label>
                        <input type="date" value={empForm.birthDate || ''} onChange={e => setEmpForm({ ...empForm, birthDate: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>주민등록번호</label>
                        <input type="text" placeholder="예: 900101-1234567" value={empForm.residentNumber || ''} onChange={e => setEmpForm({ ...empForm, residentNumber: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>연락처</label>
                        <input type="text" placeholder="예: 010-1234-5678" value={empForm.phone} onChange={e => setEmpForm({ ...empForm, phone: e.target.value })} />
                      </div>
                      <div className="form-group full-width">
                        <label>주소</label>
                        <input type="text" placeholder="거주지 주소" value={empForm.address} onChange={e => setEmpForm({ ...empForm, address: e.target.value })} />
                      </div>
                      <div className="form-group full-width">
                        <label>최종 학력</label>
                        <input type="text" placeholder="예: 한국대학교 컴퓨터공학과 졸업" value={empForm.education} onChange={e => setEmpForm({ ...empForm, education: e.target.value })} />
                      </div>
                      <div className="form-group full-width">
                        <label>자격증 정보</label>
                        <input type="text" placeholder="예: 정보처리기사, TOEIC 900" value={empForm.certifications} onChange={e => setEmpForm({ ...empForm, certifications: e.target.value })} />
                      </div>
                      <div className="form-group full-width">
                        <label>급여 계좌</label>
                        <input type="text" placeholder="예: 국민은행 123-456-789012" value={empForm.bankAccount || ''} onChange={e => setEmpForm({ ...empForm, bankAccount: e.target.value })} />
                      </div>
                    </div>

                    <div className="form-actions" style={{ gap: '10px' }}>
                      <button className="secondary-btn" onClick={handleDeleteEmployee} style={{ color: 'white', background: '#ef4444', borderColor: '#ef4444' }}>삭제</button>
                      <button className="save-btn" onClick={handleSaveEmployee}>정보 저장</button>
                    </div>
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>조직도에서 직원을 클릭하면<br />상세 정보가 표시됩니다.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {showInviteModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-slide-up">
            <h2>직원 일괄 초대</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
              <p style={{ margin: 0 }}>엑셀(XLSX) 파일을 업로드하여 여러 직원을 한 번에 조직에 초대합니다.</p>
              <button
                onClick={handleDownloadTemplate}
                style={{ background: 'none', border: 'none', padding: 0, color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', textDecoration: 'underline', width: 'fit-content', cursor: 'pointer' }}
              >
                📥 샘플 양식 다운로드 (.xlsx)
              </button>
            </div>

            <div className="file-upload-wrapper">
              <input type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />
              <div className="file-upload-ui">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
                <span>엑셀 파일(.xlsx, .csv) 드래그 또는 클릭하여 업로드</span>
              </div>
            </div>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowInviteModal(false)}>취소</button>
              <button className="upload-btn" onClick={() => { alert('업로드 완료 및 초대 이메일 발송됨'); setShowInviteModal(false); }}>업로드</button>
            </div>
          </div>
        </div>
      )}

      {showSingleInviteModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-slide-up">
            <h2>직원 개별 초대</h2>
            <p style={{ marginBottom: '2rem' }}>초대할 직원의 이름, 이메일과 소속될 조직을 선택해 주세요.</p>

            <div className="form-group">
              <label>이름</label>
              <input type="text" placeholder="홍길동" value={singleInviteData.name} onChange={e => setSingleInviteData({ ...singleInviteData, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>이메일</label>
              <input type="email" placeholder="hong@example.com" value={singleInviteData.email} onChange={e => setSingleInviteData({ ...singleInviteData, email: e.target.value })} />
            </div>
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label>소속 조직(부서)</label>
              <select value={singleInviteData.departmentId} onChange={e => setSingleInviteData({ ...singleInviteData, departmentId: e.target.value })}>
                <option value="">소속 부서 선택</option>
                {flatDepts.map(d => (
                  <option key={d.id} value={d.id}>
                    {'　'.repeat(d.level)} {d.level === 0 ? '🏢 ' : 'ㄴ '} {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowSingleInviteModal(false)}>취소</button>
              <button className="upload-btn" onClick={handleSingleInvite}>초대장 발송</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .top-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          margin: 1rem 2rem;
          border-radius: 16px;
          flex-shrink: 0;
        }
        .top-header h1 {
          font-size: 1.5rem;
          margin-bottom: 0.2rem;
        }
        .top-header p {
          color: var(--text-muted);
          font-size: 0.9rem;
        }
        .invite-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          background: linear-gradient(135deg, var(--primary) 0%, #4f46e5 100%);
          color: white;
          font-weight: 600;
          border-radius: 12px;
          border: 1px solid transparent;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          transition: all 0.2s;
        }
        .invite-btn.outline {
          background: white;
          color: var(--primary);
          border: 1px solid var(--primary);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        .invite-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
        }
        .invite-btn.outline:hover {
          background: #eff6ff;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
        }
        .content-body {
          padding: 0 2rem 1rem 2rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .compact-header {
          padding: 1rem 2rem 0.5rem 2rem;
          display: flex;
          justify-content: flex-end;
          border-bottom: none;
        }
        .layout-split {
          display: flex;
          gap: 1.5rem;
          flex: 1;
          height: 100%;
          overflow: hidden;
        }
        .org-tree-container {
          flex: 6;
          padding: 1.5rem;
          border-radius: 20px;
          background: #f8fafc;
          border: 1px solid var(--border);
          overflow-y: auto;
          min-width: 400px;
        }
        .emp-detail-container {
          flex: 4;
          padding: 1.5rem;
          border-radius: 20px;
          background: white;
          border: 1px solid var(--border);
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
          max-height: 100%;
          overflow: hidden;
        }
        .emp-form { 
          display: flex; 
          flex-direction: column; 
          gap: 1rem; 
          flex: 1;
          overflow: hidden;
        }
        .form-grid { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 0.75rem; 
          overflow-y: auto;
          padding-right: 5px;
          flex: 1;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .form-group label { font-size: 0.8rem; font-weight: 600; color: #475569; }
        .form-group input { padding: 8px 10px; font-size: 0.85rem; border: 1px solid #e2e8f0; border-radius: 6px; }
        .form-group.full-width { grid-column: span 2; }
        
        .section-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 1.5rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #e2e8f0;
        }
        
        /* Form Styles */
        .emp-form { display: flex; flex-direction: column; gap: 1.5rem; }
        .form-header { display: flex; align-items: center; gap: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #f1f5f9; }
        .emp-avatar { font-size: 2rem; background: #f1f5f9; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; border-radius: 12px; }
        .form-header h4 { font-size: 1.1rem; margin-bottom: 0.2rem; color: #0f172a; }
        .form-header p { font-size: 0.85rem; color: #64748b; }
        
        .form-actions { display: flex; justify-content: flex-end; margin-top: auto; padding-top: 1rem; border-top: 1px solid #f1f5f9; }
        .save-btn { padding: 8px 20px; background: var(--primary); color: white; border-radius: 8px; font-weight: 600; transition: background 0.2s; }
        .save-btn:hover { background: var(--primary-dark); }
        .empty-state { flex: 1; display: flex; align-items: center; justify-content: center; text-align: center; color: #94a3b8; font-size: 0.95rem; line-height: 1.6; }
        
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
          padding: 2.5rem;
          border-radius: 24px;
          width: 100%; max-width: 500px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        .modal-content h2 { font-size: 1.5rem; margin-bottom: 0.5rem; color: var(--text-main); }
        .modal-content p { color: var(--text-muted); font-size: 0.95rem; margin-bottom: 2rem; }
        
        .file-upload-wrapper { position: relative; width: 100%; height: 140px; margin-bottom: 2rem; }
        .file-upload-wrapper input[type="file"] { position: absolute; width: 100%; height: 100%; opacity: 0; cursor: pointer; z-index: 10; }
        .file-upload-ui {
          position: absolute; top: 0; left: 0; right: 0; bottom: 0;
          border: 2px dashed var(--primary-light); border-radius: 16px;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          background: rgba(59, 130, 246, 0.05); color: var(--primary); transition: all 0.2s;
        }
        .file-upload-wrapper:hover .file-upload-ui { background: rgba(59, 130, 246, 0.1); }
        .file-upload-ui svg { width: 32px; height: 32px; margin-bottom: 12px; }
        
        .form-group { margin-bottom: 1.2rem; }
        .form-group label { display: block; font-weight: 600; font-size: 0.9rem; margin-bottom: 0.5rem; color: #1e293b; }
        .form-group input, .form-group select { 
          width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 0.95rem; outline: none; transition: border 0.2s;
        }
        .form-group input:focus, .form-group select:focus { border-color: var(--primary); }
        
        .modal-actions { display: flex; gap: 1rem; justify-content: flex-end; }
        .cancel-btn { padding: 12px 24px; background: #f1f5f9; color: var(--text-main); font-weight: 600; border-radius: 12px; }
        .cancel-btn:hover { background: #e2e8f0; }
        .upload-btn { padding: 12px 24px; background: var(--primary); color: white; font-weight: 600; border-radius: 12px; }
        .upload-btn:hover { background: var(--primary-dark); }
        
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </>
  );
}

function TreeNode({ dept, onAdd, onDelete, onMove, onSelectEmp, selectedEmpId }: {
  dept: Department;
  onAdd: (parentId: string, name: string) => void;
  onDelete: (id: string) => void;
  onMove: (draggedId: string, targetId: string, type: 'DEPARTMENT' | 'EMPLOYEE', isInvitation?: boolean) => void;
  onSelectEmp: (emp: any) => void;
  selectedEmpId?: string;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const handleAdd = () => {
    if (!newName) return;
    onAdd(dept.id, newName);
    setNewName('');
    setIsAdding(false);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    e.dataTransfer.setData('application/json', JSON.stringify({ type: 'DEPARTMENT', id: dept.id }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (dataStr) {
        const payload = JSON.parse(dataStr);
        onMove(payload.id, dept.id, payload.type, payload.isInvitation);
      }
    } catch (err) {
      // old drag text format or internal error
    }
  };

  const handleEmpDragStart = (e: React.DragEvent, empId: string, isInvitation: boolean) => {
    e.stopPropagation();
    e.dataTransfer.setData('application/json', JSON.stringify({ type: 'EMPLOYEE', id: empId, isInvitation }));
  };

  return (
    <div className={`tree-node-wrapper ${dept.level === 0 ? 'root-node' : ''}`}>
      <div
        className={`tree-node ${dept.level === 0 ? 'root-style' : ''} ${isDragOver ? 'drag-over' : ''}`}
        draggable={dept.level > 0}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{ cursor: dept.level > 0 ? 'grab' : 'default' }}
      >
        <div className="node-info">
          <span className="node-icon">{dept.level === 0 ? '🏢' : '📁'}</span>
          <span className="node-name">
            {dept.name}
            {dept.level === 0 && <span className="default-badge">기본 조직</span>}
          </span>
        </div>
        <div className="node-actions">
          <button className="add-btn" onClick={() => setIsAdding(true)} title="하위 부서 추가">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
          </button>
          {dept.level > 0 && (
            <button className="del-btn" onClick={() => onDelete(dept.id)} title="부서 삭제">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
            </button>
          )}
        </div>
      </div>

      {isAdding && (
        <div className="add-form">
          <input
            type="text"
            placeholder="부서명 입력"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
          />
          <button onClick={handleAdd}>확인</button>
          <button onClick={() => setIsAdding(false)}>취소</button>
        </div>
      )}

      {/* Render Employees */}
      <div className="employee-list">
        {dept.memberships?.map((m, idx) => {
          const isResigned = m.resignationDate && new Date(m.resignationDate) <= new Date();
          const isPending = m.status === 'PENDING';
          const baseClass = isResigned ? 'resigned-employee' : (isPending ? 'pending-employee' : 'active-employee');
          return (
            <div
              key={`m-${idx}`}
              className={`employee-node ${baseClass} ${selectedEmpId === m.id ? 'selected' : ''}`}
              draggable
              onDragStart={(e) => handleEmpDragStart(e, m.id, false)}
              onClick={() => onSelectEmp(m)}
            >
              <span className="emp-icon">👤</span>
              <span className="emp-name" style={{ textDecoration: isResigned ? 'line-through' : 'none' }}>{m.user.name}</span>
              <span className="emp-email">{m.user.email}</span>
              {isResigned && <span className="emp-badge resigned-badge">퇴사자</span>}
              {isPending && !isResigned && <span className="emp-badge">초대됨(미가입)</span>}
            </div>
          );
        })}
      </div>

      {dept.children.length > 0 && (
        <div className="tree-children">
          {dept.children.map((child) => (
            <TreeNode key={child.id} dept={child} onAdd={onAdd} onDelete={onDelete} onMove={onMove} onSelectEmp={onSelectEmp} selectedEmpId={selectedEmpId} />
          ))}
        </div>
      )}

      <style jsx>{`
        .tree-node-wrapper {
          margin-left: 20px;
          border-left: 2px solid #cbd5e1;
          padding-left: 16px;
          position: relative;
        }
        .tree-node-wrapper::before {
          content: '';
          position: absolute;
          top: 18px;
          left: 0;
          width: 14px;
          height: 2px;
          background: #cbd5e1;
        }
        .tree-node-wrapper.root-node { margin-left: 0; border-left: none; padding-left: 0; }
        .tree-node-wrapper.root-node::before { display: none; }
        
        .tree-node {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          margin: 6px 0;
          border-radius: 8px;
          background: white;
          width: fit-content;
          min-width: 250px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          border: 1px solid #e2e8f0;
          transition: all 0.2s ease;
        }
        .tree-node:hover { border-color: #93c5fd; transform: translateY(-1px); }
        .tree-node.root-style { background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%); border-color: #86efac; }
        
        .node-info { display: flex; align-items: center; gap: 8px; }
        .node-icon { font-size: 1rem; }
        .node-name { font-weight: 600; color: #1e293b; font-size: 0.95rem; display: flex; align-items: center; gap: 8px; }
        .default-badge { font-size: 0.65rem; background: #dcfce7; color: #166534; padding: 2px 6px; border-radius: 8px; }
        
        .node-actions { display: flex; gap: 4px; opacity: 0; transition: opacity 0.2s; }
        .tree-node:hover .node-actions { opacity: 1; }
        .add-btn, .del-btn { width: 24px; height: 24px; border-radius: 6px; }
        .add-btn { background: #f0f9ff; color: #0284c7; }
        .del-btn { background: #fef2f2; color: #dc2626; }
        
        .add-form { margin: 6px 0 10px 16px; display: flex; gap: 6px; padding: 8px; border-radius: 8px; }
        .add-form input { padding: 6px 10px; font-size: 0.85rem; width: 140px; }
        .add-form button { padding: 6px 12px; font-size: 0.8rem; }
        .add-form button:first-of-type { background: var(--primary); color: white; }
        .add-form button:last-of-type { background: #f1f5f9; color: #475569; }

        .employee-list { margin-left: 14px; padding-left: 10px; display: flex; flex-direction: column; gap: 4px; margin-bottom: 6px; }
        .employee-node {
          display: flex;
          align-items: center;
          padding: 6px 10px;
          border-radius: 8px;
          font-size: 0.85rem;
          width: fit-content;
          min-width: 200px;
          background: white;
          border: 1px solid #e2e8f0;
          cursor: grab;
          transition: all 0.1s;
        }
        .employee-node:hover { background: #f8fafc; border-color: #cbd5e1; }
        .employee-node:active { cursor: grabbing; }
        .employee-node.selected { border: 2px solid var(--primary); background: #eff6ff; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15); }
        
        .active-employee { border-left: 3px solid var(--primary); }
        .resigned-employee { border-left: 3px solid #94a3b8; background: #f8fafc; opacity: 0.8; }
        .resigned-employee .emp-name { color: #64748b; }
        .pending-employee { border-left: 3px solid #cbd5e1; color: #94a3b8; background: #f8fafc; }
        .emp-icon { margin-right: 6px; font-size: 0.9rem; }
        .emp-name { font-weight: 600; margin-right: 6px; color: #334155; }
        .emp-email { color: #94a3b8; font-size: 0.75rem; }
        .emp-badge { margin-left: auto; font-size: 0.65rem; background: #e2e8f0; padding: 2px 4px; border-radius: 4px; }
        .resigned-badge { background: #e2e8f0; color: #64748b; font-weight: 600; }
        
        .tree-children { margin-top: 6px; }
      `}</style>
    </div>
  );
}

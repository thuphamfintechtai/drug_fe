import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { createDrug, getDrugById, updateDrug, deleteDrug } from '../../services/admin/drugService';

export default function AdminDrugForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', atcCode: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigationItems = useMemo(() => ([
    { path: '/admin', label: 'Trang chủ', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>), active: false },
    { path: '/admin/drugs', label: 'Quản lý thuốc', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-7 7-7-7" /></svg>), active: true },
  ]), []);

  useEffect(() => {
    const load = async () => {
      if (!isEdit) return;
      setLoading(true); setError('');
      try {
        const { data } = await getDrugById(id);
        const d = data?.data || data;
        setForm({ name: d?.name || '', atcCode: d?.atcCode || '', description: d?.description || '' });
      } catch (e) { setError(e?.response?.data?.message || 'Không tải được chi tiết thuốc'); }
      finally { setLoading(false); }
    };
    load();
  }, [id, isEdit]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      if (isEdit) {
        await updateDrug(id, form);
      } else {
        await createDrug(form);
      }
      navigate('/admin/drugs');
    } catch (e2) { setError(e2?.response?.data?.message || 'Không thể lưu thuốc'); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!isEdit) return;
    if (!confirm('Xóa thuốc này?')) return;
    setLoading(true); setError('');
    try { await deleteDrug(id); navigate('/admin/drugs'); }
    catch (e2) { setError(e2?.response?.data?.message || 'Không thể xóa thuốc'); }
    finally { setLoading(false); }
  };

  return (
    <DashboardLayout navigationItems={navigationItems}>
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">{isEdit ? 'Cập nhật thuốc' : 'Tạo thuốc mới'}</h2>
        {error && <div className="mb-3 text-red-600">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Tên thuốc</label>
            <input name="name" value={form.name} onChange={handleChange} className="border rounded px-3 py-2 w-full" required />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">ATC code</label>
            <input name="atcCode" value={form.atcCode} onChange={handleChange} className="border rounded px-3 py-2 w-full" required />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Mô tả</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="border rounded px-3 py-2 w-full" rows={4} />
          </div>
          <div className="flex items-center gap-3">
            <button disabled={loading} className="px-4 py-2 bg-cyan-600 text-white rounded">{isEdit ? 'Cập nhật' : 'Tạo mới'}</button>
            {isEdit && (
              <button type="button" disabled={loading} onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded">Xóa</button>
            )}
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}



import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { getDrugById } from '../../services/admin/drugService';

export default function PharmacyDrugDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigationItems = [
    { path: '/pharmacy', label: 'Trang chủ', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>) },
    { path: '/pharmacy/drugs', label: 'Danh sách thuốc', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7.5h18M7.5 3v18M6 12h12M12 6v12" /></svg>) },
  ];

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getDrugById(id);
        setData(res.data?.data || res.data || null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  return (
    <DashboardLayout navigationItems={navigationItems}>
      <div className="bg-white rounded-lg shadow p-4">
        {loading && <div>Đang tải...</div>}
        {data && (
          <div className="space-y-2 text-sm">
            <div className="text-xl font-semibold">{data.name}</div>
            <div className="text-gray-600">{data.genericName}</div>
            <div><span className="text-gray-500">ATC: </span>{data.atcCode}</div>
            <div><span className="text-gray-500">Mô tả: </span>{data.description}</div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}



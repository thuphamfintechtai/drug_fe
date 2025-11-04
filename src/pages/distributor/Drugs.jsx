import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import { getDrugs, searchDrugByATCCode } from '../../services/distributor/distributorService';

export default function Drugs() {
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchAtc, setSearchAtc] = useState('');

  const navigationItems = [
    { path: '/distributor', label: 'Tổng quan', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>), active: false },
    { path: '/distributor/invoices', label: 'Đơn từ nhà SX', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>), active: false },
    { path: '/distributor/transfer-pharmacy', label: 'Chuyển cho NT', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>), active: false },
    { path: '/distributor/distribution-history', label: 'Lịch sử phân phối', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>), active: false },
    { path: '/distributor/transfer-history', label: 'Lịch sử chuyển NT', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>), active: false },
    { path: '/distributor/drugs', label: 'Quản lý thuốc', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>), active: true },
    { path: '/distributor/nft-tracking', label: 'Tra cứu NFT', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>), active: false },
    { path: '/distributor/profile', label: 'Hồ sơ', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>), active: false },
  ];

  useEffect(() => {
    loadDrugs();
  }, []);

  const loadDrugs = async () => {
    setLoading(true);
    try {
      const response = await getDrugs();
      if (response.data.success && response.data.data) {
        setDrugs(Array.isArray(response.data.data.drugs) 
          ? response.data.data.drugs 
          : []);
      } else {
        setDrugs([]);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách thuốc:', error);
      setDrugs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchAtc.trim()) {
      loadDrugs();
      return;
    }

    setLoading(true);
    try {
      const response = await searchDrugByATCCode(searchAtc);
      if (response.data.success) {
        // Search có thể trả về mảng trực tiếp hoặc object với drugs
        const drugsData = response.data.data;
        setDrugs(Array.isArray(drugsData) 
          ? drugsData 
          : Array.isArray(drugsData?.drugs) 
            ? drugsData.drugs 
            : []);
      } else {
        setDrugs([]);
      }
    } catch (error) {
      console.error('Lỗi khi tìm kiếm:', error);
      alert('Không thể tìm kiếm thuốc');
      setDrugs([]);
    } finally {
      setLoading(false);
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  // Đảm bảo drugs luôn là array
  const safeDrugs = Array.isArray(drugs) ? drugs : [];

  return (
    <DashboardLayout navigationItems={navigationItems}>
      <div className="bg-white rounded-xl border border-cyan-200 shadow-sm p-5 mb-6">
        <h1 className="text-xl font-semibold text-[#007b91]">Danh sách thuốc</h1>
        <p className="text-slate-500 text-sm mt-1">Xem thông tin thuốc và tìm kiếm theo ATC code</p>
      </div>

      <motion.div
        className="rounded-2xl bg-white border border-cyan-200 shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-5 mb-5"
        variants={fadeUp}
        initial="hidden"
        animate="show"
      >
        <div className="flex gap-3 items-center">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
              </svg>
            </span>
            <input
              value={searchAtc}
              onChange={e => setSearchAtc(e.target.value)}
              placeholder="Tìm kiếm theo mã ATC code..."
              className="w-full h-12 pl-11 pr-40 rounded-full border border-gray-200 bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#48cae4] transition"
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              className="absolute right-1 top-1 bottom-1 px-6 rounded-full bg-[#3db6d9] hover:bg-[#2fa2c5] text-white font-medium transition"
            >
              Tìm Kiếm
            </button>
          </div>
          <button
            onClick={() => { setSearchAtc(''); loadDrugs(); }}
            className="px-4 h-12 rounded-full border border-[#90e0ef55] text-slate-700 hover:bg-[#90e0ef22] transition"
          >
            ↻ Reset
          </button>
        </div>
      </motion.div>

      <motion.div
        className="bg-white rounded-2xl border border-cyan-100 shadow-sm overflow-hidden"
        variants={fadeUp}
        initial="hidden"
        animate="show"
      >
        {loading ? (
          <div className="p-12 text-center text-slate-600">Đang tải...</div>
        ) : safeDrugs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-5xl mb-4">💊</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Chưa có thuốc nào</h3>
            <p className="text-slate-600">Danh sách thuốc sẽ hiển thị ở đây</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tên thương mại</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Tên hoạt chất</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Mã ATC</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Dạng bào chế</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Hàm lượng</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {safeDrugs.map((drug, index) => (
                  <tr key={drug._id || index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-[#003544]">{drug.tradeName}</td>
                    <td className="px-6 py-4 text-slate-700">{drug.genericName}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-cyan-50 text-cyan-700 border border-cyan-100">
                        {drug.atcCode}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{drug.dosageForm}</td>
                    <td className="px-6 py-4 text-slate-700">{drug.strength}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        drug.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {drug.status === 'active' ? '✓ Active' : '✗ Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}

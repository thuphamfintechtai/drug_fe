import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import TruckLoader from '../../components/TruckLoader';
import { getDrugs, searchDrugByATCCode } from '../../services/distributor/distributorService';

export default function Drugs() {
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchAtc, setSearchAtc] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const progressIntervalRef = useRef(null);

  const navigationItems = [
    { path: '/distributor', label: 'Tổng quan', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>), active: false },
    { path: '/distributor/invoices', label: 'Đơn từ nhà SX', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>), active: false },
    { path: '/distributor/transfer-pharmacy', label: 'Chuyển cho NT', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>), active: false },
    { path: '/distributor/distribution-history', label: 'Lịch sử phân phối', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>), active: false },
    { path: '/distributor/transfer-history', label: 'Lịch sử chuyển NT', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>), active: false },
    { path: '/distributor/drugs', label: 'Quản lý thuốc', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>), active: true },
    { path: '/distributor/nft-tracking', label: 'Tra cứu NFT', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>), active: false },
    { path: '/distributor/profile', label: 'Hồ sơ', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>), active: false },
  ];

  useEffect(() => {
    loadDrugs();
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, []);

  const startProgress = () => {
    setLoadingProgress(0);
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    progressIntervalRef.current = setInterval(() => {
      setLoadingProgress(prev => (prev < 0.9 ? Math.min(prev + 0.02, 0.9) : prev));
    }, 50);
  };

  const finishProgress = async () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    let current = 0;
    setLoadingProgress(prev => { current = prev; return prev; });
    if (current < 0.9) {
      await new Promise(resolve => {
        const speedUp = setInterval(() => {
          setLoadingProgress(prev => {
            if (prev < 1) {
              const np = Math.min(prev + 0.15, 1);
              if (np >= 1) { clearInterval(speedUp); resolve(); }
              return np;
            }
            clearInterval(speedUp); resolve(); return 1;
          });
        }, 30);
        setTimeout(() => { clearInterval(speedUp); setLoadingProgress(1); resolve(); }, 500);
      });
    } else {
      setLoadingProgress(1);
      await new Promise(r => setTimeout(r, 200));
    }
    await new Promise(r => setTimeout(r, 100));
  };

  const loadDrugs = async () => {
    try {
      setLoading(true);
      startProgress();
      const response = await getDrugs();
      if (response.data.success && response.data.data) {
        setDrugs(Array.isArray(response.data.data.drugs) ? response.data.data.drugs : []);
      } else {
        setDrugs([]);
      }
      await finishProgress();
    } catch (error) {
      if (progressIntervalRef.current) { clearInterval(progressIntervalRef.current); progressIntervalRef.current = null; }
      console.error('Lỗi khi tải danh sách thuốc:', error);
      setDrugs([]);
      setLoadingProgress(0);
    } finally {
      setLoading(false);
      setTimeout(() => setLoadingProgress(0), 500);
    }
  };

  const handleSearch = async () => {
    if (!searchAtc.trim()) {
      loadDrugs();
      return;
    }
    try {
      setLoading(true);
      startProgress();
      const response = await searchDrugByATCCode(searchAtc);
      if (response.data.success) {
        const drugsData = response.data.data;
        setDrugs(Array.isArray(drugsData) ? drugsData : Array.isArray(drugsData?.drugs) ? drugsData.drugs : []);
      } else {
        setDrugs([]);
      }
      await finishProgress();
    } catch (error) {
      if (progressIntervalRef.current) { clearInterval(progressIntervalRef.current); progressIntervalRef.current = null; }
      console.error('Lỗi khi tìm kiếm:', error);
      alert('Không thể tìm kiếm thuốc');
      setDrugs([]);
      setLoadingProgress(0);
    } finally {
      setLoading(false);
      setTimeout(() => setLoadingProgress(0), 500);
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  const safeDrugs = Array.isArray(drugs) ? drugs : [];

  return (
    <DashboardLayout navigationItems={navigationItems}>
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="w-full max-w-2xl">
            <TruckLoader height={72} progress={loadingProgress} showTrack />
          </div>
          <div className="text-lg text-slate-600 mt-6">Đang tải dữ liệu...</div>
        </div>
      ) : (
        <div className="space-y-6">
      <motion.section
        className="relative overflow-hidden rounded-2xl mb-6 border border-[#90e0ef33] shadow-[0_10px_30px_rgba(0,0,0,0.06)] bg-gradient-to-tr from-[#00b4d8] via-[#48cae4] to-[#90e0ef]"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.25),transparent_55%)]" />
        <div className="relative px-6 py-8 md:px-10 md:py-12 text-white">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight drop-shadow-sm">💊 Danh sách thuốc</h1>
          <p className="text-white/90 mt-2">Xem thông tin thuốc và tìm kiếm theo ATC code</p>
        </div>
      </motion.section>

      <motion.div
        className="rounded-2xl bg-white/85 backdrop-blur-xl border border-[#90e0ef55] shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-5 mb-5"
        variants={fadeUp}
        initial="hidden"
        animate="show"
      >
        <div className="flex gap-3">
          <input
            value={searchAtc}
            onChange={e => setSearchAtc(e.target.value)}
            placeholder="Tìm kiếm theo mã ATC code..."
            className="flex-1 border border-[#90e0ef55] bg-white/60 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#48cae4] focus:border-[#48cae4] transition"
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00b4d8] to-[#48cae4] text-white font-medium shadow-lg hover:shadow-xl transition"
          >
            🔍 Tìm kiếm
          </button>
          <button
            onClick={() => { setSearchAtc(''); loadDrugs(); }}
            className="px-4 py-2.5 rounded-xl border border-[#90e0ef55] text-slate-700 hover:bg-[#90e0ef22] transition"
          >
            ↻ Reset
          </button>
        </div>
      </motion.div>

      <motion.div
        className="bg-white/90 rounded-2xl border border-[#90e0ef55] shadow-[0_10px_30px_rgba(0,0,0,0.06)] overflow-hidden"
        variants={fadeUp}
        initial="hidden"
        animate="show"
      >
        {safeDrugs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-5xl mb-4">💊</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Chưa có thuốc nào</h3>
            <p className="text-slate-600">Danh sách thuốc sẽ hiển thị ở đây</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#00b4d8] to-[#48cae4]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase">Tên thương mại</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text_white uppercase">Tên hoạt chất</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase">Mã ATC</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase">Dạng bào chế</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase">Hàm lượng</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {safeDrugs.map((drug, index) => (
                  <tr key={drug._id || index} className="hover:bg-[#f5fcff] transition group">
                    <td className="px-6 py-4 font-semibold text-[#003544]">{drug.tradeName}</td>
                    <td className="px-6 py-4 text-slate-700">{drug.genericName}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-mono font-semibold bg-cyan-100 text-cyan-800">
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
      </div>
      )}
    </DashboardLayout>
  );
}

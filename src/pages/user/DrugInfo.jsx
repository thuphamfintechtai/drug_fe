import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import userService from '../../services/user/userService';

export default function UserDrugInfo() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [expandedItem, setExpandedItem] = useState(null);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';

  const navigationItems = [
    { path: '/user', label: 'Tổng quan', active: false },
    { path: '/user/nft-tracking', label: 'Tra cứu NFT', active: false },
    { path: '/user/drugs', label: 'Thông tin thuốc', active: true },
    { path: '/user/profile', label: 'Hồ sơ', active: false },
  ];

  useEffect(() => {
    loadData();
  }, [page, search]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;

      const response = search ? await userService.searchDrugs(params) : await userService.getDrugInfo(params);
      if (response.success) {
        setItems(response.data.drugs || []);
        setPagination(response.data.pagination || { page: 1, limit: 10, total: 0, pages: 0 });
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách thuốc:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (next) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([k, v]) => {
      if (v === '' || v === undefined || v === null) nextParams.delete(k);
      else nextParams.set(k, String(v));
    });
    setSearchParams(nextParams);
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <DashboardLayout navigationItems={navigationItems}>
      <motion.section
        className="relative overflow-hidden rounded-2xl mb-6 border border-[#90e0ef33] shadow-[0_10px_30px_rgba(0,0,0,0.06)] bg-gradient-to-tr from-emerald-600 via-green-500 to-teal-500"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.25),transparent_55%)]" />
        <div className="relative px-6 py-8 md:px-10 md:py-12 text-white">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight drop-shadow-sm">💊 Thông tin thuốc</h1>
          <p className="text-white/90 mt-2">Tìm kiếm và xem thông tin chi tiết các loại thuốc</p>
        </div>
      </motion.section>

      <motion.div className="rounded-2xl bg-white/85 backdrop-blur-xl border border-[#90e0ef55] shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-4 mb-5" variants={fadeUp} initial="hidden" animate="show">
        <div className="flex gap-3">
          <input
            value={search}
            onChange={e => updateFilter({ search: e.target.value, page: 1 })}
            placeholder="Tìm kiếm theo tên thuốc, hoạt chất, mã ATC..."
            className="flex-1 border border-[#90e0ef55] bg-white/60 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#48cae4] focus:border-[#48cae4] transition"
          />
          <button
            onClick={loadData}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-medium shadow-lg hover:shadow-xl transition"
          >
            🔍 Tìm kiếm
          </button>
        </div>
      </motion.div>

      <motion.div className="space-y-4" variants={fadeUp} initial="hidden" animate="show">
        {loading ? (
          <div className="bg-white/90 rounded-2xl border border-[#90e0ef55] p-10 text-center text-slate-600">Đang tải...</div>
        ) : items.length === 0 ? (
          <div className="bg-white/90 rounded-2xl border border-[#90e0ef55] p-10 text-center">
            <div className="text-5xl mb-4">💊</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Không tìm thấy thuốc</h3>
            <p className="text-slate-600">Thử tìm kiếm với từ khóa khác</p>
          </div>
        ) : (
          items.map((item, idx) => (
            <div key={idx} className="bg-white/90 backdrop-blur-xl rounded-2xl border border-[#90e0ef55] shadow-[0_10px_24px_rgba(0,0,0,0.05)] overflow-hidden hover:shadow-lg transition">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[#003544] mb-1">{item.commercialName || 'N/A'}</h3>
                    <div className="text-sm text-slate-600 space-y-1">
                      <div>🏷️ Hoạt chất: <span className="font-medium">{item.activePharmaIngredient || 'N/A'}</span></div>
                      <div>📋 Mã ATC: <span className="font-mono font-medium text-blue-600">{item.atcCode || 'N/A'}</span></div>
                      <div>💊 Dạng bào chế: <span className="font-medium">{item.dosageForm || 'N/A'}</span></div>
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedItem(expandedItem === idx ? null : idx)}
                    className="ml-4 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition"
                  >
                    {expandedItem === idx ? '▲ Thu gọn' : '▼ Chi tiết'}
                  </button>
                </div>

                {expandedItem === idx && (
                  <div className="mt-4 pt-4 border-t border-slate-200 space-y-2 text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-slate-50 rounded-lg p-3">
                        <div className="font-semibold text-slate-700">🔢 Hàm lượng:</div>
                        <div className="text-slate-600">{item.concentration || 'N/A'}</div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <div className="font-semibold text-slate-700">📦 Quy cách:</div>
                        <div className="text-slate-600">{item.packagingSpecification || 'N/A'}</div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <div className="font-semibold text-slate-700">🏢 Nhà sản xuất:</div>
                        <div className="text-slate-600">{item.manufacturer || 'N/A'}</div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <div className="font-semibold text-slate-700">🌍 Nước SX:</div>
                        <div className="text-slate-600">{item.countryOfOrigin || 'N/A'}</div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <div className="font-semibold text-slate-700">📜 Số đăng ký:</div>
                        <div className="text-slate-600 font-mono text-xs">{item.registrationNumber || 'N/A'}</div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <div className="font-semibold text-slate-700">⏰ Hạn sử dụng:</div>
                        <div className="text-slate-600">{item.shelfLife || 'N/A'}</div>
                      </div>
                    </div>

                    {item.proprietaryDrugName && (
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <div className="font-semibold text-blue-800">📝 Tên thuốc độc quyền:</div>
                        <div className="text-blue-700">{item.proprietaryDrugName}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </motion.div>

      <div className="flex items-center justify-between mt-5">
        <div className="text-sm text-slate-600">Hiển thị {items.length} / {pagination.total} thuốc</div>
        <div className="flex items-center gap-2">
          <button disabled={page <= 1} onClick={() => updateFilter({ page: page - 1 })} className={`px-3 py-2 rounded-xl ${page <= 1 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-white/90 border border-[#90e0ef55] hover:bg-[#f5fcff]'}`}>Trước</button>
          <span className="text-sm text-slate-700">Trang {page} / {pagination.pages || 1}</span>
          <button disabled={page >= pagination.pages} onClick={() => updateFilter({ page: page + 1 })} className={`px-3 py-2 rounded-xl ${page >= pagination.pages ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'text-white bg-gradient-to-r from-emerald-600 to-green-600 shadow-lg'}`}>Sau</button>
        </div>
      </div>
    </DashboardLayout>
  );
}


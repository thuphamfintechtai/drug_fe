import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import pharmacyService from '../../services/pharmacy/pharmacyService';

export default function PharmacyDrugs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [atcSearch, setAtcSearch] = useState('');
  const [expandedItem, setExpandedItem] = useState(null);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';

  const navigationItems = [
    { path: '/pharmacy', label: 'Tổng quan', active: false },
    { path: '/pharmacy/invoices', label: 'Đơn từ NPP', active: false },
    { path: '/pharmacy/distribution-history', label: 'Lịch sử phân phối', active: false },
    { path: '/pharmacy/drugs', label: 'Quản lý thuốc', active: true },
    { path: '/pharmacy/nft-tracking', label: 'Tra cứu NFT', active: false },
    { path: '/pharmacy/profile', label: 'Hồ sơ', active: false },
  ];

  useEffect(() => {
    loadData();
  }, [page, search]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;

      const response = await pharmacyService.getDrugs(params);
      if (response.data.success && response.data.data) {
        setItems(Array.isArray(response.data.data.drugs) 
          ? response.data.data.drugs 
          : []);
        setPagination(response.data.data.pagination || { page: 1, limit: 10, total: 0, pages: 0 });
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách thuốc:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleATCSearch = async () => {
    if (!atcSearch.trim()) {
      alert('Vui lòng nhập mã ATC');
      return;
    }

    setLoading(true);
    try {
      const response = await pharmacyService.searchDrugByATCCode(atcSearch.trim());
      if (response.data.success) {
        const drugsData = response.data.data;
        const drugs = Array.isArray(drugsData) 
          ? drugsData 
          : Array.isArray(drugsData?.drugs) 
            ? drugsData.drugs 
            : [];
        setItems(drugs);
        setPagination({ page: 1, limit: 10, total: drugs.length, pages: 1 });
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error('Lỗi:', error);
      alert('Không tìm thấy thuốc với mã ATC này');
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

  // Đảm bảo items luôn là array
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <DashboardLayout navigationItems={navigationItems}>
      <motion.section
        className="relative overflow-hidden rounded-2xl mb-6 border border-[#90e0ef33] shadow-[0_10px_30px_rgba(0,0,0,0.06)] bg-gradient-to-tr from-blue-600 via-cyan-500 to-teal-500"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.25),transparent_55%)]" />
        <div className="relative px-6 py-8 md:px-10 md:py-12 text-white">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight drop-shadow-sm">💊 Quản lý thuốc</h1>
          <p className="text-white/90 mt-2">Xem danh sách thuốc và tìm kiếm theo mã ATC</p>
        </div>
      </motion.section>

      <motion.div className="rounded-2xl bg-white/85 backdrop-blur-xl border border-[#90e0ef55] shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-4 mb-5" variants={fadeUp} initial="hidden" animate="show">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[#003544]/70 mb-1">Tìm kiếm theo tên</label>
            <input
              value={search}
              onChange={e => updateFilter({ search: e.target.value, page: 1 })}
              placeholder="Tìm theo tên thuốc..."
              className="w-full border border-[#90e0ef55] bg-white/60 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#48cae4] focus:border-[#48cae4] transition"
            />
          </div>
          <div>
            <label className="block text-sm text-[#003544]/70 mb-1">Tìm theo mã ATC</label>
            <div className="flex gap-2">
              <input
                value={atcSearch}
                onChange={e => setAtcSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleATCSearch()}
                placeholder="Nhập mã ATC..."
                className="flex-1 border border-[#90e0ef55] bg-white/60 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#48cae4] focus:border-[#48cae4] transition"
              />
              <button
                onClick={handleATCSearch}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00b4d8] to-[#48cae4] text-white font-medium shadow-lg hover:shadow-xl transition"
              >
                🔍 Tìm
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div className="space-y-4" variants={fadeUp} initial="hidden" animate="show">
        {loading ? (
          <div className="bg-white/90 rounded-2xl border border-[#90e0ef55] p-10 text-center text-slate-600">Đang tải...</div>
        ) : safeItems.length === 0 ? (
          <div className="bg-white/90 rounded-2xl border border-[#90e0ef55] p-10 text-center">
            <div className="text-5xl mb-4">💊</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Không tìm thấy thuốc</h3>
            <p className="text-slate-600">Thử tìm kiếm với từ khóa khác</p>
          </div>
        ) : (
          safeItems.map((item, idx) => (
            <div key={idx} className="bg-white/90 backdrop-blur-xl rounded-2xl border border-[#90e0ef55] shadow-[0_10px_24px_rgba(0,0,0,0.05)] overflow-hidden hover:shadow-lg transition">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[#003544] mb-1">{item.tradeName || 'N/A'}</h3>
                    <div className="text-sm text-slate-600 space-y-1">
                      <div>🏷️ Tên hoạt chất: <span className="font-medium">{item.genericName || 'N/A'}</span></div>
                      <div>📋 Mã ATC: <span className="font-mono font-medium text-blue-600">{item.atcCode || 'N/A'}</span></div>
                      <div>💊 Dạng bào chế: <span className="font-medium">{item.dosageForm || 'N/A'}</span></div>
                      {item.manufacturer && (
                        <div>🏢 Nhà sản xuất: <span className="font-medium">{item.manufacturer.name || 'N/A'}</span></div>
                      )}
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
                  <div className="mt-4 pt-4 border-t border-slate-200 space-y-3 text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-slate-50 rounded-lg p-3">
                        <div className="font-semibold text-slate-700 mb-1">🔢 Hàm lượng:</div>
                        <div className="text-slate-600">{item.strength || 'N/A'}</div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <div className="font-semibold text-slate-700 mb-1">📦 Quy cách đóng gói:</div>
                        <div className="text-slate-600">{item.packaging || 'N/A'}</div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <div className="font-semibold text-slate-700 mb-1">🏢 Nhà sản xuất:</div>
                        <div className="text-slate-600">{item.manufacturer?.name || 'N/A'}</div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <div className="font-semibold text-slate-700 mb-1">🛤️ Đường dùng:</div>
                        <div className="text-slate-600">{item.route || 'N/A'}</div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <div className="font-semibold text-slate-700 mb-1">📦 Bảo quản:</div>
                        <div className="text-slate-600">{item.storage || 'N/A'}</div>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <div className="font-semibold text-slate-700 mb-1">📊 Trạng thái:</div>
                        <div className="text-slate-600">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {item.status === 'active' ? '✓ Active' : '✗ Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Thành phần hoạt chất */}
                    {item.activeIngredients && item.activeIngredients.length > 0 && (
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <div className="font-semibold text-blue-800 mb-2">🧪 Thành phần hoạt chất:</div>
                        <div className="space-y-1">
                          {item.activeIngredients.map((ingredient, ingIdx) => (
                            <div key={ingIdx} className="text-blue-700 text-sm">
                              • {ingredient.name} {ingredient.concentration ? `(${ingredient.concentration})` : ''}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Cảnh báo */}
                    {item.warnings && (
                      <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                        <div className="font-semibold text-yellow-800 mb-1">⚠️ Cảnh báo:</div>
                        <div className="text-yellow-700">{item.warnings}</div>
                      </div>
                    )}

                    {/* Thông tin bổ sung */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                        <div className="font-semibold text-indigo-800 mb-1">📅 Ngày tạo:</div>
                        <div className="text-indigo-700 text-xs">
                          {item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : 'N/A'}
                        </div>
                      </div>
                      <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                        <div className="font-semibold text-indigo-800 mb-1">🔄 Cập nhật:</div>
                        <div className="text-indigo-700 text-xs">
                          {item.updatedAt ? new Date(item.updatedAt).toLocaleString('vi-VN') : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </motion.div>

      <div className="flex items-center justify-between mt-5">
        <div className="text-sm text-slate-600">Hiển thị {safeItems.length} / {pagination.total} thuốc</div>
        <div className="flex items-center gap-2">
          <button disabled={page <= 1} onClick={() => updateFilter({ page: page - 1 })} className={`px-3 py-2 rounded-xl ${page <= 1 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-white/90 border border-[#90e0ef55] hover:bg-[#f5fcff]'}`}>Trước</button>
          <span className="text-sm text-slate-700">Trang {page} / {pagination.pages || 1}</span>
          <button disabled={page >= pagination.pages} onClick={() => updateFilter({ page: page + 1 })} className={`px-3 py-2 rounded-xl ${page >= pagination.pages ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'text-white bg-gradient-to-r from-[#00b4d8] via-[#48cae4] to-[#90e0ef] shadow-[0_10px_24px_rgba(0,180,216,0.30)]'}`}>Sau</button>
        </div>
      </div>
    </DashboardLayout>
  );
}

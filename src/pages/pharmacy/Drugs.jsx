import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import pharmacyService from '../../services/pharmacy/pharmacyService';

export default function PharmacyDrugs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [atcSearch, setAtcSearch] = useState('');
  const [expandedItem, setExpandedItem] = useState(null);
  const [localSearch, setLocalSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchingATC, setIsSearchingATC] = useState(false);
  const [searchType, setSearchType] = useState(null); // 'name' hoặc 'atc'

  const page = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';

  // Đồng bộ localSearch với search params từ URL (khi component mount hoặc search thay đổi từ bên ngoài)
  useEffect(() => {
    if (search !== localSearch) {
      setLocalSearch(search);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Debounce search: đợi 1.5 giây sau khi người dùng dừng nhập
  useEffect(() => {
    // Bỏ qua nếu localSearch trống và search cũng trống
    if (localSearch === search) {
      setIsSearching(false);
      return;
    }

    // Nếu có giá trị localSearch khác search, bắt đầu debounce
    setIsSearching(true);

    const debounceTimer = setTimeout(() => {
      // Clear ATC search khi tìm kiếm theo tên
      setAtcSearch('');
      updateFilter({ search: localSearch, page: 1 });
      setIsSearching(false);
      setSearchType('name');
    }, 1500);

    return () => {
      clearTimeout(debounceTimer);
      setIsSearching(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSearch]);

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

    // Clear name search khi tìm kiếm theo ATC
    setLocalSearch('');
    updateFilter({ search: '', page: 1 });

    setIsSearchingATC(true);
    setLoading(true);
    setSearchType('atc');
    try {
      const response = await pharmacyService.searchDrugByATCCode(atcSearch.trim());
      console.log('ATC Search Response:', response.data); // Debug log
      
      if (response.data.success) {
        const drugsData = response.data.data;
        let drugs = [];
        
        // Xử lý nhiều trường hợp response
        if (Array.isArray(drugsData)) {
          // Trường hợp 1: data là array
          drugs = drugsData;
        } else if (drugsData?.drugs && Array.isArray(drugsData.drugs)) {
          // Trường hợp 2: data có property drugs là array
          drugs = drugsData.drugs;
        } else if (drugsData?.drug && typeof drugsData.drug === 'object') {
          // Trường hợp 3: data có property drug là object đơn lẻ
          drugs = [drugsData.drug];
        } else if (drugsData && typeof drugsData === 'object' && !Array.isArray(drugsData)) {
          // Trường hợp 4: data là object đơn lẻ (không phải array)
          // Kiểm tra xem có phải là drug object không (có các property như tradeName, atcCode, etc.)
          if (drugsData.tradeName || drugsData.atcCode || drugsData.genericName) {
            drugs = [drugsData];
          }
        }
        
        console.log('Processed drugs:', drugs); // Debug log
        setItems(drugs);
        setPagination({ page: 1, limit: 10, total: drugs.length, pages: 1 });
      } else {
        console.log('Response success is false:', response.data);
        setItems([]);
      }
    } catch (error) {
      console.error('Lỗi khi tìm kiếm ATC:', error);
      console.error('Error response:', error.response?.data); // Debug log
      setItems([]);
    } finally {
      setLoading(false);
      setIsSearchingATC(false);
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

  const safeItems = Array.isArray(items) ? items : [];

  const toggleExpand = (idx) => {
    setExpandedItem(expandedItem === idx ? null : idx);
  };

  return (
    <DashboardLayout navigationItems={navigationItems}>
      {/* Banner */}
      <motion.section
        className="relative overflow-hidden rounded-3xl mb-6 border-2 border-[#4BADD1] shadow-[0_8px_24px_rgba(75,173,209,0.2)] bg-[#4BADD1]"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative px-6 py-6 md:px-8 md:py-8">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">Quản lý thuốc</h1>
          <p className="text-white text-base font-medium">Xem danh sách thuốc và tìm kiếm theo mã ATC</p>
        </div>
      </motion.section>

      {/* Search Section */}
      <motion.div 
        className="bg-white rounded-xl border-2 border-slate-300 shadow-lg p-4 mb-5" 
        variants={fadeUp} 
        initial="hidden" 
        animate="show"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-800 mb-2 font-semibold">Tìm kiếm theo tên</label>
            <div className="relative">
            <input
                value={localSearch}
                onChange={e => setLocalSearch(e.target.value)}
              placeholder="Tìm theo tên thuốc..."
                className="w-full border-2 border-slate-300 bg-white rounded-lg px-4 py-2.5 pr-10 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#4BADD1] focus:border-[#4BADD1] transition"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#4BADD1] border-t-transparent"></div>
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-800 mb-2 font-semibold">Tìm theo mã ATC</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
              <input
                value={atcSearch}
                onChange={e => setAtcSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleATCSearch()}
                placeholder="Nhập mã ATC..."
                  className="w-full border-2 border-slate-300 bg-white rounded-lg px-4 py-2.5 pr-10 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#4BADD1] focus:border-[#4BADD1] transition"
                />
                {isSearchingATC && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#4BADD1] border-t-transparent"></div>
                  </div>
                )}
              </div>
              <button
                onClick={handleATCSearch}
                disabled={isSearchingATC}
                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#4BADD1] to-[#7AC3DE] text-white font-semibold shadow-md hover:shadow-lg hover:from-[#7AC3DE] hover:to-[#4BADD1] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div 
        className="bg-white rounded-xl border-2 border-slate-300 shadow-lg overflow-hidden" 
        variants={fadeUp} 
        initial="hidden" 
        animate="show"
      >
        {loading ? (
          <div className="p-10 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#4BADD1] border-t-transparent mx-auto mb-4"></div>
            <p className="text-slate-700 font-medium">Đang tải dữ liệu...</p>
          </div>
        ) : safeItems.length === 0 ? (
          <div className="p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <svg className="w-24 h-24 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
              </div>
            </div>
            {searchType === 'name' && search ? (
              <>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Không tìm thấy kết quả</h3>
                <div className="mb-4">
                  <p className="text-slate-700 text-lg mb-2">
                    Không tìm thấy thuốc với từ khóa:
                  </p>
                  <span className="inline-block px-4 py-2 bg-gradient-to-r from-[#4BADD1]/10 to-[#7AC3DE]/10 border-2 border-[#4BADD1] rounded-lg text-[#4BADD1] font-bold text-lg">
                    "{search}"
                  </span>
                </div>
                <p className="text-slate-600 text-base">Thử tìm kiếm với từ khóa khác hoặc kiểm tra lại chính tả</p>
              </>
            ) : searchType === 'atc' && atcSearch ? (
              <>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Không tìm thấy kết quả</h3>
                <div className="mb-4">
                  <p className="text-slate-700 text-lg mb-2">
                    Không tìm thấy thuốc với mã ATC:
                  </p>
                  <span className="inline-block px-4 py-2 bg-gradient-to-r from-[#4BADD1]/10 to-[#7AC3DE]/10 border-2 border-[#4BADD1] rounded-lg text-[#4BADD1] font-bold text-lg font-mono">
                    "{atcSearch}"
                  </span>
                </div>
                <p className="text-slate-600 text-base">Thử tìm kiếm với mã ATC khác hoặc kiểm tra lại chính tả</p>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Không có thuốc</h3>
                <p className="text-slate-600 text-base">Hiện tại chưa có thuốc nào trong hệ thống</p>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="bg-gradient-to-r from-[#4BADD1] to-[#7AC3DE] px-4 py-3.5">
              <div className="grid grid-cols-12 gap-4 text-white font-bold text-base">
                <div className="col-span-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <span>Mã ATC</span>
                </div>
                <div className="col-span-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  <span>Tên thuốc</span>
                </div>
                <div className="col-span-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>Nhà sản xuất</span>
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span>Dạng bào chế</span>
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Trạng thái</span>
                </div>
                    </div>
                  </div>

            {/* Table Body */}
            <div className="divide-y-2 divide-slate-300">
              {safeItems.map((item, idx) => (
                <div key={idx}>
                  {/* Table Row - Clickable */}
                  <div
                    onClick={() => toggleExpand(idx)}
                    className="grid grid-cols-12 gap-4 px-4 py-4 hover:bg-gradient-to-r hover:from-[#4BADD1]/15 hover:to-[#7AC3DE]/15 cursor-pointer transition-all duration-200"
                  >
                    <div className="col-span-2 flex items-center gap-2 text-slate-900">
                      <svg className="w-5 h-5 text-[#4BADD1]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <span className="font-mono text-sm font-semibold text-slate-900">{item.atcCode || 'N/A'}</span>
                    </div>
                    <div className="col-span-3 flex items-center gap-2 text-slate-900">
                      <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                      <span className="text-sm font-semibold text-slate-900">{item.tradeName || 'N/A'}</span>
                    </div>
                    <div className="col-span-3 flex items-center gap-2 text-slate-700 text-sm font-medium">
                      <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span>{item.manufacturer?.name || 'N/A'}</span>
                    </div>
                    <div className="col-span-2 flex items-center gap-2 text-slate-700 text-sm font-medium">
                      <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span>{item.dosageForm || 'N/A'}</span>
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <span className={`px-3 py-1.5 rounded-md text-xs font-semibold ${
                        item.status === 'active' 
                          ? 'bg-green-100 text-green-800 border border-green-300' 
                          : 'bg-red-100 text-red-800 border border-red-300'
                      }`}>
                        {item.status === 'active' ? 'Hoạt động' : 'Ngừng'}
                      </span>
                    </div>
                </div>

                  {/* Expanded Details */}
                <AnimatePresence>
                {expandedItem === idx && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                      animate={{ 
                        opacity: 1, 
                        height: 'auto',
                        transition: { 
                          duration: 0.3, 
                          ease: [0.4, 0, 0.2, 1],
                          height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
                          opacity: { duration: 0.2, ease: 'easeOut' }
                        }
                      }}
                      exit={{ 
                        opacity: 0, 
                        height: 0,
                        overflow: 'hidden',
                        transition: { 
                          duration: 0.25, 
                          ease: [0.4, 0, 0.2, 1],
                          height: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
                          opacity: { duration: 0.15, ease: 'easeIn' }
                        }
                      }}
                      className="bg-slate-50 border-t-2 border-slate-300"
                    >
                      <div className="p-5 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white rounded-lg p-4 border-2 border-slate-300 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                              <svg className="w-5 h-5 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span className="font-bold text-slate-900 text-base">Tên hoạt chất</span>
                            </div>
                            <div className="text-slate-800 text-sm font-medium">{item.genericName || 'N/A'}</div>
                          </div>
                          <div className="bg-white rounded-lg p-4 border-2 border-slate-300 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                              <svg className="w-5 h-5 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                              <span className="font-bold text-slate-900 text-base">Hàm lượng</span>
                            </div>
                            <div className="text-slate-800 text-sm font-medium">{item.strength || 'N/A'}</div>
                          </div>
                          <div className="bg-white rounded-lg p-4 border-2 border-slate-300 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                              <svg className="w-5 h-5 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                              <span className="font-bold text-slate-900 text-base">Quy cách đóng gói</span>
                            </div>
                            <div className="text-slate-800 text-sm font-medium">{item.packaging || 'N/A'}</div>
                          </div>
                          <div className="bg-white rounded-lg p-4 border-2 border-slate-300 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                              <svg className="w-5 h-5 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                              </svg>
                              <span className="font-bold text-slate-900 text-base">Đường dùng</span>
                      </div>
                            <div className="text-slate-800 text-sm font-medium">{item.route || 'N/A'}</div>
                      </div>
                          <div className="bg-white rounded-lg p-4 border-2 border-slate-300 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                              <svg className="w-5 h-5 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                              <span className="font-bold text-slate-900 text-base">Bảo quản</span>
                      </div>
                            <div className="text-slate-800 text-sm font-medium">{item.storage || 'N/A'}</div>
                      </div>
                          <div className="bg-white rounded-lg p-4 border-2 border-slate-300 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                              <svg className="w-5 h-5 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="font-bold text-slate-900 text-base">Ngày tạo</span>
                      </div>
                            <div className="text-slate-800 text-sm font-medium">
                              {item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                        </div>
                      </div>
                    </div>

                        {/* Active Ingredients */}
                    {item.activeIngredients && item.activeIngredients.length > 0 && (
                          <div className="bg-white rounded-lg p-4 border-2 border-slate-300 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                              <svg className="w-5 h-5 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                              </svg>
                              <span className="font-bold text-slate-900 text-base">Thành phần hoạt chất</span>
                            </div>
                            <div className="space-y-2">
                          {item.activeIngredients.map((ingredient, ingIdx) => (
                                <div key={ingIdx} className="text-slate-800 text-sm font-medium">
                              • {ingredient.name} {ingredient.concentration ? `(${ingredient.concentration})` : ''}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                        {/* Warnings */}
                    {item.warnings && (
                          <div className="bg-white rounded-lg p-4 border-2 border-red-300 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              <span className="font-bold text-red-600 text-base">Cảnh báo</span>
                            </div>
                            <div className="text-red-700 text-sm font-medium">{item.warnings}</div>
                      </div>
                    )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              ))}
            </div>
          </>
        )}
      </motion.div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-5 bg-white rounded-xl border-2 border-slate-300 shadow-lg px-4 py-3">
        <div className="text-sm text-slate-800 font-semibold">Tổng {pagination.total} thuốc</div>
        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => updateFilter({ page: page - 1 })}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
              page <= 1
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-gradient-to-r hover:from-[#4BADD1]/10 hover:to-[#7AC3DE]/10 hover:border-[#4BADD1]'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm text-slate-700 px-3 py-2 border border-[#4BADD1] rounded-lg bg-gradient-to-r from-[#4BADD1]/10 to-[#7AC3DE]/10">
            {page} / {pagination.pages || 1}
          </span>
          <button
            disabled={page >= pagination.pages}
            onClick={() => updateFilter({ page: page + 1 })}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
              page >= pagination.pages
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-gradient-to-r hover:from-[#4BADD1]/10 hover:to-[#7AC3DE]/10 hover:border-[#4BADD1]'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <select
            value={pagination.limit}
            onChange={(e) => updateFilter({ limit: e.target.value, page: 1 })}
            className="px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#4BADD1] focus:border-[#4BADD1]"
          >
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>
      </div>
    </DashboardLayout>
  );
}

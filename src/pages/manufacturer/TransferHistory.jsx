import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import { getTransferHistory, saveTransferTransaction } from '../../services/manufacturer/manufacturerService';
import { transferNFTToDistributor, transferBatchNFTToDistributor, getCurrentWalletAddress } from '../../utils/web3Helper';
import { useAuth } from '../../context/AuthContext';

export default function TransferHistory() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [retryingId, setRetryingId] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });

  const page = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';

  const navigationItems = [
    { path: '/manufacturer', label: 'Tổng quan', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>), active: false },
    { path: '/manufacturer/drugs', label: 'Quản lý thuốc', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>), active: false },
    { path: '/manufacturer/production', label: 'Sản xuất thuốc', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>), active: false },
    { path: '/manufacturer/transfer', label: 'Chuyển giao', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>), active: false },
    { path: '/manufacturer/production-history', label: 'Lịch sử sản xuất', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>), active: false },
    { path: '/manufacturer/transfer-history', label: 'Lịch sử chuyển giao', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>), active: false },
    { path: '/manufacturer/profile', label: 'Hồ sơ', icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>), active: false },
  ];

  useEffect(() => {
    loadData();
  }, [page, search, status]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (status) params.status = status;

      const response = await getTransferHistory(params);
      
      if (response?.data?.success) {
        // Backend trả về invoices, không phải transfers
        const invoices = response.data.data?.invoices || response.data.data?.transfers || [];
        const paginationData = response.data.data?.pagination || { page: 1, limit: 10, total: 0, pages: 0 };
        
        // Map invoices sang format mà UI đang mong đợi
        const mappedItems = Array.isArray(invoices) ? invoices.map(invoice => ({
          ...invoice,
          // Map toDistributor thành distributor để UI hiển thị
          distributor: invoice.toDistributor || invoice.distributor,
          // Map chainTxHash thành transactionHash
          transactionHash: invoice.chainTxHash || invoice.transactionHash,
          // Đảm bảo tokenIds được lấy từ invoice (nếu chưa có trong root level)
          tokenIds: invoice.tokenIds || invoice.invoice?.tokenIds || [],
          amounts: invoice.amounts || invoice.invoice?.amounts || [],
          // Thêm invoice object để handleRetry có thể dùng
          invoice: {
            _id: invoice._id,
            invoiceNumber: invoice.invoiceNumber,
            invoiceDate: invoice.invoiceDate,
            tokenIds: invoice.tokenIds || invoice.invoice?.tokenIds || [],
          },
        })) : [];
        
        console.log('Mapped items:', mappedItems);
        console.log('Items with pending/sent status:', mappedItems.filter(item => ['pending', 'sent'].includes(item.status) && !item.transactionHash));
        
        setItems(mappedItems);
        setPagination(paginationData);
      } else {
        console.warn('API không trả về success:', response?.data);
        setItems([]);
      }
    } catch (error) {
      console.error('Lỗi khi tải lịch sử chuyển giao:', error);
      console.error('Error response:', error?.response?.data);
      setItems([]);
      // Hiển thị lỗi cho user nếu cần
      if (error?.response?.status === 401) {
        alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else if (error?.response?.status >= 500) {
        alert('Lỗi server. Vui lòng thử lại sau.');
      }
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

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
      sent: 'bg-cyan-100 text-cyan-700 border-cyan-200',
      received: 'bg-blue-100 text-blue-700 border-blue-200',
      paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      cancelled: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[status] || 'bg-slate-100 text-slate-600 border-slate-200';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pending',
      sent: 'Sent',
      received: 'Received',
      paid: 'Paid',
      cancelled: 'Cancelled',
    };
    return labels[status] || status;
  };

  const handleRetry = async (item) => {
    console.log('handleRetry called with item:', item);
    
    if (!item.invoice?._id || !item.distributor?.walletAddress) {
      alert('Thiếu thông tin cần thiết để retry. Vui lòng kiểm tra lại invoice và distributor address.');
      console.error('Missing invoice._id or distributor.walletAddress', {
        hasInvoiceId: !!item.invoice?._id,
        hasDistributorWallet: !!item.distributor?.walletAddress,
        item: item
      });
      return;
    }

    // Lấy tokenIds từ nhiều nguồn có thể
    const tokenIds = item.tokenIds || item.invoice?.tokenIds || [];
    const amounts = item.amounts || item.invoice?.amounts || [];

    console.log('TokenIds found:', tokenIds);
    console.log('Amounts found:', amounts);

    if (tokenIds.length === 0) {
      alert('Không tìm thấy token IDs để chuyển giao. Vui lòng kiểm tra lại invoice đã có tokenIds chưa.');
      console.error('No tokenIds found in item:', item);
      return;
    }

    setRetryingId(item._id);
    try {
      // Kiểm tra ví hiện tại khớp ví manufacturer trong hệ thống
      const currentWallet = await getCurrentWalletAddress();
      if (user?.walletAddress && currentWallet.toLowerCase() !== user.walletAddress.toLowerCase()) {
        alert('Ví đang kết nối không khớp với ví của manufacturer trong hệ thống.\nVui lòng chuyển tài khoản MetaMask sang: ' + user.walletAddress);
        return;
      }

      // Gọi smart contract để transfer NFT
      // Nếu có amounts từ backend, dùng transferBatchNFTToDistributor
      // Nếu không có, dùng transferNFTToDistributor (mặc định amounts = [1, 1, ...])
      let onchain;
      if (amounts && amounts.length > 0 && amounts.length === tokenIds.length) {
        // Normalize amounts to BigInt[]
        const normalizedAmounts = amounts.map((amt) => {
          if (typeof amt === 'bigint') return amt;
          if (typeof amt === 'string') return BigInt(amt);
          return BigInt(amt);
        });
        // Normalize tokenIds to BigInt[]
        const normalizedTokenIds = tokenIds.map((id) => {
          if (typeof id === 'string' && id.startsWith('0x')) return BigInt(id);
          return BigInt(id);
        });
        onchain = await transferBatchNFTToDistributor(normalizedTokenIds, normalizedAmounts, item.distributor.walletAddress);
      } else {
        onchain = await transferNFTToDistributor(tokenIds, item.distributor.walletAddress);
      }
      
      // Lưu transaction hash vào backend (Bước 2 theo API spec)
      await saveTransferTransaction({
        invoiceId: item.invoice._id,
        transactionHash: onchain.transactionHash,
        tokenIds,
      });

      alert('Đã chuyển NFT on-chain và lưu transaction thành công!');
      loadData(); // Reload để cập nhật trạng thái
    } catch (error) {
      console.error('Lỗi khi retry transfer:', error);
      const msg = error?.message || 'Giao dịch on-chain thất bại hoặc bị hủy.';
      alert(msg);
    } finally {
      setRetryingId(null);
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <DashboardLayout navigationItems={navigationItems}>
      {/* Banner */}
      <div className="bg-white rounded-xl border border-cyan-200 shadow-sm p-5 flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[#007b91] flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#007b91]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M5 10h14M4 14h16M6 18h12" />
            </svg>
            Lịch sử chuyển giao
          </h1>
          <p className="text-slate-500 text-sm mt-1">Theo dõi tất cả các đơn chuyển giao NFT cho nhà phân phối</p>
        </div>
      </div>

      {/* Filters */}
      <motion.div
        className="rounded-2xl bg-white border border-cyan-200 shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-4 mb-5"
        variants={fadeUp}
        initial="hidden"
        animate="show"
      >
        <div className="flex flex-col md:flex-row gap-3 md:items-end">
          <div className="flex-1">
            <label className="block text-sm text-[#003544]/70 mb-1">Tìm kiếm</label>
            <input
              value={search}
              onChange={e => updateFilter({ search: e.target.value, page: 1 })}
              placeholder="Tìm theo tên nhà phân phối, số lô..."
              className="w-full border-2 border-cyan-300 bg-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#48cae4] focus:border-[#48cae4] transition"
            />
          </div>
          <div>
            <label className="block text-sm text-[#003544]/70 mb-1">Trạng thái</label>
            <select
              value={status}
              onChange={e => updateFilter({ status: e.target.value, page: 1 })}
              className="border-2 border-cyan-300 bg-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#48cae4] focus:border-[#48cae4] transition"
            >
              <option value="">Tất cả</option>
              <option value="pending">Pending</option>
              <option value="sent">Sent</option>
              <option value="received">Received</option>
              <option value="paid">Paid</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* List */}
      <motion.div
        className="space-y-4"
        variants={fadeUp}
        initial="hidden"
        animate="show"
      >
        {loading ? (
          <div className="bg-white rounded-2xl border border-cyan-200 p-10 text-center text-slate-600">
            Đang tải...
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-cyan-200 p-10 text-center">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Chưa có lịch sử chuyển giao</h3>
            <p className="text-slate-600">Các đơn chuyển giao của bạn sẽ hiển thị ở đây</p>
          </div>
        ) : (
          items.map((item, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-cyan-100 shadow-sm overflow-hidden hover:shadow-lg transition">
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                                         <div className="flex items-center gap-3 mb-2">
                       <h3 className="text-lg font-semibold text-[#003544]">
                         {item.distributor?.fullName || item.distributor?.name || 'N/A'}
                       </h3>
                       <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                         {getStatusLabel(item.status)}
                       </span>
                     </div>
                                         <div className="space-y-1 text-sm text-slate-600">
                       <div>Số hóa đơn: <span className="font-mono font-medium text-slate-800">{item.invoiceNumber || 'N/A'}</span></div>
                       {item.production?.drug?.tradeName && (
                         <div>Thuốc: <span className="font-medium text-slate-800">{item.production.drug.tradeName}</span></div>
                       )}
                       {item.production?.batchNumber && (
                         <div>Số lô: <span className="font-mono font-medium text-slate-800">{item.production.batchNumber}</span></div>
                       )}
                       <div>Số lượng: <span className="font-bold text-orange-700">{item.quantity} NFT</span></div>
                       <div>Ngày tạo: <span className="font-medium">{new Date(item.createdAt).toLocaleString('vi-VN')}</span></div>
                       {item.invoiceDate && (
                         <div>Ngày hóa đơn: <span className="font-medium">{new Date(item.invoiceDate).toLocaleString('vi-VN')}</span></div>
                       )}
                     </div>
                  </div>
                </div>

                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                   <div className="bg-cyan-50 rounded-xl p-3 border border-cyan-200">
                     <div className="text-xs text-cyan-700 mb-1">Nhà phân phối</div>
                     <div className="font-semibold text-cyan-800">{item.distributor?.fullName || item.distributor?.name || 'N/A'}</div>
                     {item.distributor?.email && (
                       <div className="text-xs text-cyan-600 mt-1">{item.distributor.email}</div>
                     )}
                     {item.distributor?.address && (
                       <div className="text-xs text-cyan-600 mt-1">{item.distributor.address}</div>
                     )}
                   </div>
                  {item.distributor?.walletAddress && (
                    <div className="bg-purple-50 rounded-xl p-3 border border-purple-200">
                      <div className="text-xs text-purple-700 mb-1">Wallet Address</div>
                      <div className="font-mono text-xs text-purple-800 break-all">{item.distributor.walletAddress}</div>
                    </div>
                  )}
                </div>

                {item.notes && (
                  <div className="bg-slate-50 rounded-xl p-3 text-sm">
                    <div className="font-semibold text-slate-700 mb-1">Ghi chú:</div>
                    <div className="text-slate-600">{item.notes}</div>
                  </div>
                )}

                {item.transactionHash && (
                  <div className="mt-3 bg-emerald-50 rounded-xl p-3 border border-emerald-200 text-sm">
                    <div className="font-semibold text-emerald-800 mb-1">Transaction Hash (Blockchain):</div>
                    <div className="font-mono text-xs text-emerald-700 break-all">{item.transactionHash}</div>
                    <a 
                      href={`https://zeroscan.org/tx/${item.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-600 hover:text-emerald-800 underline mt-1 inline-block"
                    >
                      Xem trên ZeroScan →
                    </a>
                  </div>
                )}

                {/* Nút chuyển NFT - hiển thị khi status = pending hoặc sent (distributor đã xác nhận) và chưa có transactionHash */}
                {(['pending', 'sent'].includes(item.status)) && !item.transactionHash && item.distributor?.walletAddress && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 text-sm text-amber-800 mb-3">
                      {item.status === 'sent' 
                        ? 'Distributor đã xác nhận nhận hàng. Vui lòng chuyển quyền sở hữu NFT on-chain.'
                        : 'Chưa chuyển NFT on-chain. Vui lòng xác nhận chuyển quyền sở hữu NFT.'}
                    </div>
                    <button
                      onClick={() => handleRetry(item)}
                      disabled={retryingId === item._id}
                      className="w-full px-4 py-2.5 rounded-xl text-white bg-gradient-to-r from-[#00b4d8] via-[#48cae4] to-[#90e0ef] shadow-[0_10px_24px_rgba(0,180,216,0.30)] hover:shadow-[0_14px_36px_rgba(0,180,216,0.40)] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 font-semibold"
                    >
                      {retryingId === item._id ? 'Đang xử lý...' : (item.status === 'sent' ? 'Xác nhận chuyển NFT' : 'Thử lại chuyển giao')}
                    </button>
                  </div>
                )}
                
                {/* Debug info - chỉ hiển thị trong development */}
                {process.env.NODE_ENV === 'development' && !item.transactionHash && (
                  <div className="mt-2 text-xs text-slate-500 p-2 bg-slate-50 rounded">
                    <div>Status: {item.status}</div>
                    <div>Has distributor wallet: {item.distributor?.walletAddress ? 'Yes' : 'No'}</div>
                    <div>Has tokenIds: {item.tokenIds?.length > 0 ? `Yes (${item.tokenIds.length})` : 'No'}</div>
                    <div>Has transactionHash: {item.transactionHash ? 'Yes' : 'No'}</div>
                  </div>
                )}

                {/* Status Timeline */}
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-2 text-xs">
                    <div className={`flex items-center gap-1 ${['pending', 'sent', 'received', 'paid'].includes(item.status) ? 'text-amber-600' : 'text-slate-400'}`}>
                      <div className={`w-2 h-2 rounded-full ${['pending', 'sent', 'received', 'paid'].includes(item.status) ? 'bg-amber-500' : 'bg-slate-300'}`}></div>
                      <span>Pending</span>
                    </div>
                    <div className="flex-1 h-px bg-slate-200"></div>
                    <div className={`flex items-center gap-1 ${['sent', 'received', 'paid'].includes(item.status) ? 'text-cyan-600' : 'text-slate-400'}`}>
                      <div className={`w-2 h-2 rounded-full ${['sent', 'received', 'paid'].includes(item.status) ? 'bg-cyan-500' : 'bg-slate-300'}`}></div>
                      <span>Sent</span>
                    </div>
                    <div className="flex-1 h-px bg-slate-200"></div>
                    <div className={`flex items-center gap-1 ${['received', 'paid'].includes(item.status) ? 'text-blue-600' : 'text-slate-400'}`}>
                      <div className={`w-2 h-2 rounded-full ${['received', 'paid'].includes(item.status) ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                      <span>Received</span>
                    </div>
                    <div className="flex-1 h-px bg-slate-200"></div>
                    <div className={`flex items-center gap-1 ${item.status === 'paid' ? 'text-emerald-600' : 'text-slate-400'}`}>
                      <div className={`w-2 h-2 rounded-full ${item.status === 'paid' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                      <span>Paid</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </motion.div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-5">
        <div className="text-sm text-slate-600">
          Hiển thị {items.length} / {pagination.total} đơn chuyển giao
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => updateFilter({ page: page - 1 })}
            className={`px-3 py-2 rounded-xl ${page <= 1 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-white/90 border border-[#90e0ef55] hover:bg-[#f5fcff]'}`}
          >
            Trước
          </button>
          <span className="text-sm text-slate-700">
            Trang {page} / {pagination.pages || 1}
          </span>
          <button
            disabled={page >= pagination.pages}
            onClick={() => updateFilter({ page: page + 1 })}
            className={`px-3 py-2 rounded-xl ${page >= pagination.pages ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'text-white bg-gradient-to-r from-[#00b4d8] via-[#48cae4] to-[#90e0ef] shadow-[0_10px_24px_rgba(0,180,216,0.30)] hover:shadow-[0_14px_36px_rgba(0,180,216,0.40)]'}`}
          >
            Sau
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}


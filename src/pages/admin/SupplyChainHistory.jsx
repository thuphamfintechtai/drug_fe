import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import TruckLoader from '../../components/TruckLoader';
import { getBatchList, getBatchJourney } from '../../services/admin/adminService';

const statusMeta = {
  produced: {
    label: 'Đã sản xuất',
    badgeClass: 'bg-blue-100 text-blue-700 border border-blue-200',
  },
  in_transit: {
    label: 'Đang vận chuyển',
    badgeClass: 'bg-amber-100 text-amber-700 border border-amber-200',
  },
  completed: {
    label: 'Hoàn tất',
    badgeClass: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  },
  default: {
    label: 'Chưa xác định',
    badgeClass: 'bg-slate-100 text-slate-600 border border-slate-200',
  },
};

const stageMeta = {
  production: {
    label: 'Sản xuất',
    icon: '🏭',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  transfer_to_distributor: {
    label: 'Chuyển cho NPP',
    icon: '🚚',
    color: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  },
  transfer_to_pharmacy: {
    label: 'Chuyển cho Nhà thuốc',
    icon: '🏥',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
  },
  default: {
    label: 'Khác',
    icon: '📦',
    color: 'bg-slate-100 text-slate-600 border-slate-200',
  },
};

const translateStatus = (status) => {
  const map = {
    completed: 'Hoàn thành',
    confirmed: 'Đã xác nhận',
    pending: 'Đang chờ',
    draft: 'Bản nháp',
    sent: 'Đã gửi',
    issued: 'Đã phát hành',
    in_transit: 'Đang vận chuyển',
    received: 'Đã nhận',
    verified: 'Đã xác minh',
    cancelled: 'Đã hủy',
  };
  if (!status) return '—';
  return map[status] || status;
};

const formatDateTime = (value) => (value ? new Date(value).toLocaleString('vi-VN') : '—');
const formatDate = (value) => (value ? new Date(value).toLocaleDateString('vi-VN') : '—');
const formatNumber = (value) =>
  typeof value === 'number' ? value.toLocaleString('vi-VN') : value ?? '—';
const shortenTx = (hash) => (hash ? `${hash.slice(0, 10)}...${hash.slice(-8)}` : '');
const formatAddress = (address) => {
  if (!address) return '';
  if (typeof address === 'string') return address;
  const parts = [address.street, address.city, address.state, address.country]
    .filter(Boolean)
    .join(', ');
  return parts || '';
};

function InfoRow({ label, value, mono = false, link }) {
  if (!value) return null;
  const valueClass = mono
    ? 'font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded'
    : 'font-medium text-slate-800';

  const content = link ? (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={`${valueClass} hover:underline`}
    >
      {value}
    </a>
  ) : (
    <span className={valueClass}>{value}</span>
  );

  return (
    <div className="flex flex-wrap items-start gap-2 text-sm text-slate-600">
      <span className="min-w-[120px] text-slate-500">{label}:</span>
      {content}
    </div>
  );
}

function ProofBlock({ proof }) {
  if (!proof) return null;

  const receiverName =
    typeof proof.receivedBy === 'string'
      ? proof.receivedBy
      : proof.receivedBy?.name || proof.receivedBy?.username || null;

  return (
    <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
      <h5 className="text-sm font-semibold text-emerald-700 mb-2">Thông tin xác nhận</h5>
      <div className="space-y-2">
        <InfoRow label="Thời gian" value={formatDateTime(proof.receivedAt || proof.completedAt)} />
        <InfoRow label="Người nhận" value={receiverName} />
        {typeof proof.receivedBy === 'object' && proof.receivedBy?.idNumber && (
          <InfoRow label="Mã định danh" value={proof.receivedBy.idNumber} />
        )}
        <InfoRow label="Mã xác nhận" value={proof.verificationCode} />
        <InfoRow label="Địa chỉ nhận" value={formatAddress(proof.deliveryAddress || proof.receiptAddress)} />
        {proof.qualityCheck?.condition && (
          <InfoRow label="Kiểm định chất lượng" value={translateStatus(proof.qualityCheck.condition)} />
        )}
        <InfoRow
          label="Tx Blockchain"
          value={shortenTx(proof.transferTxHash || proof.receiptTxHash)}
          mono
          link={proof.transferTxHash || proof.receiptTxHash ? `https://sepolia.etherscan.io/tx/${proof.transferTxHash || proof.receiptTxHash}` : undefined}
        />
        <InfoRow label="Trạng thái" value={translateStatus(proof.status)} />
      </div>
    </div>
  );
}

function renderStageDetails(stage) {
  const { details = {}, proof } = stage;
  switch (stage.stage) {
    case 'production':
      return (
        <>
          <InfoRow label="Số lô" value={details.batchNumber} />
          <InfoRow label="Số lượng" value={formatNumber(details.quantity)} />
          <InfoRow label="Ngày sản xuất" value={formatDate(details.mfgDate)} />
          <InfoRow label="Hạn dùng" value={formatDate(details.expDate)} />
          <InfoRow label="Báo cáo QA" value={details.qaReportUri} link={details.qaReportUri} />
          <InfoRow
            label="Tx Blockchain"
            value={shortenTx(details.chainTxHash)}
            mono
            link={details.chainTxHash ? `https://sepolia.etherscan.io/tx/${details.chainTxHash}` : undefined}
          />
          <ProofBlock proof={proof} />
        </>
      );
    case 'transfer_to_distributor':
      return (
        <>
          <InfoRow label="Nhà phân phối" value={stage.entity?.name} />
          <InfoRow label="Số HĐ" value={details.invoiceNumber} mono />
          <InfoRow label="Ngày HĐ" value={formatDate(details.invoiceDate)} />
          <InfoRow label="Số lượng" value={formatNumber(details.quantity)} />
          <InfoRow label="Địa chỉ giao" value={formatAddress(details.deliveryAddress)} />
          <InfoRow label="Phương thức vận chuyển" value={details.shippingMethod} />
          <InfoRow label="Dự kiến giao" value={formatDate(details.estimatedDelivery)} />
          {Array.isArray(details.nfts) && details.nfts.length > 0 && (
            <InfoRow label="NFT liên quan" value={`${details.nfts.length} mã`} />
          )}
          <InfoRow
            label="Tx Blockchain"
            value={shortenTx(details.chainTxHash)}
            mono
            link={details.chainTxHash ? `https://sepolia.etherscan.io/tx/${details.chainTxHash}` : undefined}
          />
          <ProofBlock proof={proof} />
        </>
      );
    case 'transfer_to_pharmacy':
      return (
        <>
          <InfoRow label="Nhà thuốc" value={stage.entity?.name} />
          <InfoRow label="Số HĐ" value={details.invoiceNumber} mono />
          <InfoRow label="Số lượng" value={formatNumber(details.quantity)} />
          <InfoRow label="Địa chỉ giao" value={formatAddress(details.deliveryAddress)} />
          <InfoRow label="Phương thức vận chuyển" value={details.shippingMethod} />
          <InfoRow label="Tx Blockchain" value={shortenTx(details.chainTxHash)} mono link={details.chainTxHash ? `https://sepolia.etherscan.io/tx/${details.chainTxHash}` : undefined} />
          <InfoRow label="Hoàn tất chuỗi cung ứng" value={details.supplyChainCompleted ? 'Có' : 'Chưa'} />
          <ProofBlock proof={proof} />
        </>
      );
    default:
      return (
        <>
          {Object.entries(details).map(([key, value]) => (
            <InfoRow key={key} label={key} value={String(value)} />
          ))}
          <ProofBlock proof={proof} />
        </>
      );
  }
}

export default function SupplyChainHistory() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1', 10);
  const batchNumber = searchParams.get('batchNumber') || '';
  const drugName = searchParams.get('drugName') || '';
  const statusFilter = searchParams.get('status') || '';
  const fromDate = searchParams.get('fromDate') || '';
  const toDate = searchParams.get('toDate') || '';
  const limit = 10;

  const [batches, setBatches] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedBatch, setExpandedBatch] = useState(null);
  const [journeys, setJourneys] = useState({});
  const [journeyLoading, setJourneyLoading] = useState({});

  const navigationItems = useMemo(
    () => [
      { path: '/admin', label: 'Tổng quan', icon: null, active: false },
      { path: '/admin/supply-chain', label: 'Lịch sử truy xuất', icon: null, active: true },
    ],
    []
  );

  const updateFilter = (next) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([key, value]) => {
      if (value === '' || value === undefined || value === null) {
        nextParams.delete(key);
      } else {
        nextParams.set(key, String(value));
      }
    });
    setSearchParams(nextParams);
  };

  const fetchBatches = async () => {
    setLoading(true);
    setError('');

    try {
      const params = { page, limit };
      if (batchNumber) params.batchNumber = batchNumber;
      if (drugName) params.drugName = drugName;
      if (statusFilter) params.status = statusFilter;
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const { data } = await getBatchList(params);

      if (!data?.success) {
        throw new Error(data?.message || 'Không thể tải danh sách lô hàng');
      }

      setBatches(data.data || []);
      setPagination({
        page: data.pagination?.page ?? page,
        limit: data.pagination?.limit ?? limit,
        total: data.pagination?.total ?? data.data?.length ?? 0,
        totalPages: data.pagination?.totalPages ?? Math.max(1, Math.ceil((data.pagination?.total ?? data.data?.length ?? 0) / (data.pagination?.limit ?? limit))),
      });
    } catch (err) {
      console.error('Không thể tải dữ liệu batch:', err);
      const message =
        err?.response?.data?.message || err?.message || 'Đã xảy ra lỗi khi tải dữ liệu.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, [page, batchNumber, drugName, statusFilter, fromDate, toDate]);

  const handleToggleBatch = async (batch) => {
    const isExpanded = expandedBatch === batch.batchNumber;
    const nextExpanded = isExpanded ? null : batch.batchNumber;
    setExpandedBatch(nextExpanded);

    if (isExpanded || journeys[batch.batchNumber]) {
      return;
    }

    setJourneyLoading((prev) => ({ ...prev, [batch.batchNumber]: true }));
    try {
      const { data } = await getBatchJourney(batch.batchNumber);
      if (!data?.success) {
        throw new Error(data?.message || 'Không thể lấy thông tin hành trình');
      }
      setJourneys((prev) => ({ ...prev, [batch.batchNumber]: data.data }));
    } catch (err) {
      console.error('Không thể tải hành trình lô hàng:', err);
      const message =
        err?.response?.data?.message || err?.message || 'Đã xảy ra lỗi khi tải hành trình.';
      setError(message);
    } finally {
      setJourneyLoading((prev) => ({ ...prev, [batch.batchNumber]: false }));
    }
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
    show: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const renderStatistics = (stats) => {
    if (!stats) return null;

    const cards = [
      { label: 'Tổng NFT', value: stats.totalNFTs },
      { label: 'Minted', value: stats.nftsByStatus?.minted ?? 0 },
      { label: 'Đã chuyển giao', value: stats.nftsByStatus?.transferred ?? 0 },
      { label: 'Đã bán', value: stats.nftsByStatus?.sold ?? 0 },
      { label: 'Số NPP tham gia', value: stats.distributorsInvolved ?? 0 },
      { label: 'Số Nhà thuốc tham gia', value: stats.pharmaciesInvolved ?? 0 },
      { label: 'Lần chuyển tới NPP', value: stats.transfersToDistributors ?? 0 },
      { label: 'Lần chuyển tới Nhà thuốc', value: stats.transfersToPharmacies ?? 0 },
      { label: 'Chuỗi đã hoàn tất', value: stats.completedSupplyChains ?? 0 },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="text-xs uppercase tracking-wide text-slate-500">{card.label}</div>
            <div className="mt-1 text-lg font-semibold text-slate-800">
              {formatNumber(card.value)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderJourney = (batchNumber) => {
    const journey = journeys[batchNumber];
    const isLoading = journeyLoading[batchNumber];

    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <TruckLoader height={48} showTrack progress={0.6} />
        </div>
      );
    }

    if (!journey) {
      return (
        <div className="py-6 text-sm text-slate-500">
          Chưa có dữ liệu hành trình cho lô hàng này.
        </div>
      );
    }

    const { batchInfo, statistics, timeline, nfts } = journey;

    return (
      <div className="mt-6 border-t border-slate-200 pt-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoRow label="Nhà sản xuất" value={batchInfo?.manufacturer?.name} />
          <InfoRow label="Mã số giấy phép" value={batchInfo?.manufacturer?.licenseNo} />
          <InfoRow label="Ngày sản xuất" value={formatDate(batchInfo?.mfgDate)} />
          <InfoRow label="Hạn dùng" value={formatDate(batchInfo?.expDate)} />
          <InfoRow label="Tổng số lượng" value={formatNumber(batchInfo?.quantity)} />
          <InfoRow
            label="Tx Blockchain"
            value={shortenTx(batchInfo?.chainTxHash)}
            mono
            link={batchInfo?.chainTxHash ? `https://sepolia.etherscan.io/tx/${batchInfo.chainTxHash}` : undefined}
          />
        </div>

        {renderStatistics(statistics)}

        <div>
          <h4 className="text-base font-semibold text-slate-800 mb-4">Timeline chuỗi cung ứng</h4>
          {(!timeline || timeline.length === 0) && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              Chưa có hoạt động nào sau bước sản xuất.
            </div>
          )}
          <div className="relative">
            {timeline && timeline.length > 0 && (
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-300 via-blue-300 to-purple-300" />
            )}
            <div className="space-y-4">
              {timeline?.map((stage) => {
                const meta = stageMeta[stage.stage] || stageMeta.default;
                const stageStatus =
                  stage.details?.status || stage.status || stage.proof?.status ||
                  (stage.stage === 'production' ? 'completed' : undefined);

                return (
                  <div key={`${stage.stage}-${stage.step}`} className="relative flex gap-4">
                    <div className="relative z-10 flex-shrink-0">
                      <div className={`w-12 h-12 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-xl ${meta.color}`}>
                        {meta.icon}
                      </div>
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${meta.color}`}>
                              {meta.label}
                            </span>
                            {stageStatus && (
                              <span className="px-2 py-0.5 rounded text-xs bg-emerald-100 text-emerald-700">
                                {translateStatus(stageStatus)}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-500">
                            {formatDateTime(stage.timestamp || batchInfo?.createdAt)}
                          </span>
                        </div>

                        <div className="mt-4 space-y-2">
                          <InfoRow label="Đơn vị" value={stage.entity?.name} />
                          <InfoRow label="Địa chỉ" value={formatAddress(stage.entity?.address)} />
                          {renderStageDetails(stage)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-base font-semibold text-slate-800 mb-3">Danh sách NFT (tối đa 10)</h4>
          {(!nfts || nfts.length === 0) && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              Chưa có NFT nào được ghi nhận cho lô hàng này.
            </div>
          )}
          {nfts && nfts.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">Token ID</th>
                    <th className="px-4 py-2 text-left font-medium">Serial</th>
                    <th className="px-4 py-2 text-left font-medium">Trạng thái</th>
                    <th className="px-4 py-2 text-left font-medium">Chủ sở hữu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {nfts.slice(0, 10).map((nft) => (
                    <tr key={nft.tokenId}>
                      <td className="px-4 py-3 font-mono text-xs text-slate-700">{nft.tokenId}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-700">{nft.serialNumber}</td>
                      <td className="px-4 py-3 text-slate-600">{translateStatus(nft.status)}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {nft.currentOwner?.username || nft.currentOwner?.email || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {nfts.length > 10 && (
                <div className="text-xs text-slate-500 mt-2">
                  Hiển thị 10 NFT gần nhất trong tổng số {formatNumber(nfts.length)}.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout navigationItems={navigationItems}>
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="w-full max-w-2xl">
            <TruckLoader height={72} showTrack progress={0.6} />
          </div>
          <div className="text-lg text-slate-600 mt-6">Đang tải dữ liệu...</div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-cyan-200 shadow-sm p-5 mb-6">
            <h2 className="text-xl font-semibold text-cyan-900">Lịch sử truy xuất chuỗi cung ứng</h2>
            <p className="text-slate-600 text-sm mt-1">
              Theo dõi hành trình của từng lô hàng từ nhà sản xuất tới nhà thuốc.
            </p>
          </div>

          <motion.div
            className="rounded-2xl bg-white border border-cyan-200 shadow-[0_8px_24px_rgba(0,171,196,0.12)] p-4 mb-6"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Số lô</label>
                <input
                  value={batchNumber}
                  onChange={(e) => updateFilter({ batchNumber: e.target.value, page: 1 })}
                  placeholder="Nhập số lô"
                  className="w-full h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Tên thuốc</label>
                <input
                  value={drugName}
                  onChange={(e) => updateFilter({ drugName: e.target.value, page: 1 })}
                  placeholder="Lọc theo tên thuốc"
                  className="w-full h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Trạng thái lô</label>
                <select
                  value={statusFilter}
                  onChange={(e) => updateFilter({ status: e.target.value, page: 1 })}
                  className="w-full h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                >
                  <option value="">Tất cả</option>
                  <option value="produced">Đã sản xuất</option>
                  <option value="in_transit">Đang vận chuyển</option>
                  <option value="completed">Hoàn tất</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Từ ngày</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => updateFilter({ fromDate: e.target.value, page: 1 })}
                  className="w-full h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Đến ngày</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => updateFilter({ toDate: e.target.value, page: 1 })}
                  className="w-full h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
                />
              </div>
            </div>
          </motion.div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {batches.length === 0 && !error && (
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
                Không tìm thấy lô hàng nào phù hợp.
              </div>
            )}

            {batches.map((batch) => {
              const isExpanded = expandedBatch === batch.batchNumber;
              const statusInfo = statusMeta[batch.status] || statusMeta.default;

              return (
                <motion.div
                  key={batch.batchNumber}
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  className="rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleBatch(batch)}
                    className="w-full text-left"
                  >
                    <div className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-lg font-semibold text-slate-800">
                            Lô {batch.batchNumber}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.badgeClass}`}>
                            {statusInfo.label}
                          </span>
                          <span className="text-xs text-slate-500">
                            {formatDateTime(batch.mfgDate)}
                          </span>
                        </div>
                        <div className="mt-2 text-sm text-slate-600">
                          <div>
                            Thuốc: <span className="font-medium text-slate-800">{batch.drug?.drugName || '—'}</span>
                          </div>
                          <div>
                            Nhà sản xuất: <span className="font-medium text-slate-800">{batch.manufacturer?.name || '—'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm text-slate-600 md:text-right">
                        <div>
                          <div className="text-xs uppercase text-slate-500">Tổng số lượng</div>
                          <div className="font-semibold text-slate-800">{formatNumber(batch.totalQuantity)}</div>
                        </div>
                        <div>
                          <div className="text-xs uppercase text-slate-500">Tổng NFT</div>
                          <div className="font-semibold text-slate-800">{formatNumber(batch.nftCount)}</div>
                        </div>
                        <div>
                          <div className="text-xs uppercase text-slate-500">Đã phân phối</div>
                          <div className="font-semibold text-slate-800">{formatNumber(batch.distributedCount)}</div>
                        </div>
                        <div>
                          <div className="text-xs uppercase text-slate-500">Hoàn tất</div>
                          <div className="font-semibold text-slate-800">{formatNumber(batch.completedCount)}</div>
                        </div>
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-slate-200 px-5 pb-6">
                      {renderJourney(batch.batchNumber)}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => updateFilter({ page: page - 1 })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  page <= 1
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-white border border-cyan-300 text-cyan-700 hover:bg-cyan-50'
                }`}
              >
                ← Trước
              </button>
              <span className="text-sm text-slate-600">
                Trang <strong>{page}</strong> / <strong>{pagination.totalPages}</strong>
              </span>
              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() => updateFilter({ page: page + 1 })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  page >= pagination.totalPages
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg hover:from-cyan-600 hover:to-blue-600'
                }`}
              >
                Sau →
              </button>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
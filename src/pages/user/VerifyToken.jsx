import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../utils/api';

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function base64UrlDecode(input) {
  try {
    const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    const decoded = atob(padded);
    return decoded;
  } catch (e) {
    return null;
  }
}

export default function VerifyToken() {
  const query = useQuery();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const tokenId = query.get('tokenId');
    if (!tokenId) {
      setError('Thiếu tham số tokenId. Hãy quét QR để kiểm tra.');
      return;
    }
    // Thử decode base64url JSON (callback từ backend)
    const decoded = base64UrlDecode(tokenId);
    if (decoded) {
      try {
        const parsed = JSON.parse(decoded);
        setData(parsed);
        return;
      } catch (_) {
        // fallthrough
      }
    }
    // Nếu không phải JSON được encode, thử dạng ObjectId và gọi API trực tiếp
    const isObjectId = /^[a-fA-F0-9]{24}$/.test(tokenId);
    if (isObjectId) {
      (async () => {
        try {
          const res = await api.get(`/NFTTracking/verify/${tokenId}/public`);
          if (res?.data?.success && res?.data?.data) {
            setData(res.data.data);
          } else {
            setError(res?.data?.message || 'Không nhận được dữ liệu hợp lệ.');
          }
        } catch (e) {
          setError(e?.response?.data?.message || 'Không thể tải dữ liệu xác minh.');
        }
      })();
      return;
    }
    setError('tokenId không hợp lệ.');
  }, [query]);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Xác minh nguồn gốc NFT</h1>
          <button
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            onClick={() => navigate('/')}
          >
            Về trang chủ
          </button>
        </div>

        {error && (
          <div className="rounded border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {!error && !data && (
          <div className="rounded border border-gray-200 bg-white p-6 text-gray-600">
            Đang xử lý dữ liệu...
          </div>
        )}

        {data && (
          <div className="space-y-6">
            <section className="rounded border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${data?.authenticity ? 'bg-emerald-600' : 'bg-red-600'}`}></span>
                <span className="font-medium">
                  {data?.authenticity ? 'Xác thực: HỢP LỆ' : 'Xác thực: KHÔNG HỢP LỆ'}
                </span>
              </div>
            </section>

            <section className="rounded border border-gray-200 bg-white p-4">
              <h2 className="mb-3 text-lg font-semibold">Thông tin NFT</h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <InfoRow label="Token ID" value={data?.nft?.tokenId} />
                <InfoRow label="Contract" value={data?.nft?.contractAddress} />
                <InfoRow label="Batch" value={data?.nft?.batchNumber} />
                <InfoRow label="Serial" value={data?.nft?.serialNumber} />
                <InfoRow label="Trạng thái" value={data?.nft?.status} />
                <InfoRow label="Tx Hash" value={data?.nft?.chainTxHash} isLink hash />
                <InfoRow label="Thuốc" value={data?.nft?.drug?.tradeName || data?.nft?.drug?.genericName} />
              </div>
            </section>

            <section className="rounded border border-gray-200 bg-white p-4">
              <h2 className="mb-3 text-lg font-semibold">Chuỗi chứng từ</h2>
              <div className="space-y-4">
                {Array.isArray(data?.stages) && data.stages.length > 0 ? (
                  data.stages.map((stage, idx) => (
                    <StageCard key={idx} stage={stage} />
                  ))
                ) : (
                  <div className="text-gray-500">Chưa có dữ liệu chuỗi chứng từ.</div>
                )}
              </div>
            </section>

            <section className="rounded border border-gray-200 bg-white p-4">
              <h2 className="mb-3 text-lg font-semibold">On-chain</h2>
              <pre className="overflow-auto rounded bg-gray-50 p-3 text-sm text-gray-700">{JSON.stringify(data?.onchain, null, 2)}</pre>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value, isLink, hash }) {
  const display = value ?? '-';
  if (isLink && typeof value === 'string' && value.startsWith('0x')) {
    return (
      <div className="flex flex-col">
        <span className="text-sm text-gray-500">{label}</span>
        <a
          href={`https://etherscan.io/tx/${value}`}
          target="_blank"
          rel="noreferrer"
          className="truncate text-blue-600 hover:underline"
        >
          {hash ? shortenHash(value) : value}
        </a>
      </div>
    );
  }
  return (
    <div className="flex flex-col">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="truncate">{String(display)}</span>
    </div>
  );
}

function shortenHash(h) {
  if (!h) return '';
  return `${h.slice(0, 10)}...${h.slice(-6)}`;
}

function StageCard({ stage }) {
  return (
    <div className="rounded border border-gray-100 bg-gray-50 p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-medium uppercase text-gray-700">{stage.stage}</div>
        {stage?.createdAt && (
          <div className="text-xs text-gray-500">{new Date(stage.createdAt).toLocaleString()}</div>
        )}
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <InfoRow label="Tx Hash" value={stage?.txHash} isLink hash />
        <InfoRow label="Trạng thái" value={stage?.proof?.status} />
        <InfoRow label="Số lượng" value={stage?.proof?.quantity || stage?.proof?.distributedQuantity || stage?.proof?.receivedQuantity} />
      </div>
    </div>
  );
}



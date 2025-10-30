import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { getProofById } from '../../services/manufacturer/proofService';
import { ipfsToHttp } from '../../utils/ipfsHelper';
import { getManufacturerNavigationItems } from '../../utils/manufacturerNavigation.jsx';

export default function ProofDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [proof, setProof] = useState(null);
  const [nftInfo, setNftInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProofDetail();
  }, [id]);

  const loadProofDetail = async () => {
    try {
      setLoading(true);
      const response = await getProofById(id);
      
      if (response.success) {
        setProof(response.data.proof);
        setNftInfo(response.data.nftInfo);
      }
    } catch (error) {
      console.error('Error loading proof detail:', error);
      alert('Không thể tải thông tin proof');
      navigate('/manufacturer/proofs');
    } finally {
      setLoading(false);
    }
  };

  const navigationItems = getManufacturerNavigationItems(location.pathname);

  if (loading) {
    return (
      <DashboardLayout navigationItems={navigationItems}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="h-16 w-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải thông tin...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!proof) {
    return (
      <DashboardLayout navigationItems={navigationItems}>
        <div className="text-center py-12">
          <p className="text-gray-600">Không tìm thấy proof</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navigationItems={navigationItems}>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-3xl">📋</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Chi tiết Proof of Production</h1>
                <p className="text-sm text-gray-500">Mã lô: {proof.batchNumber || 'N/A'}</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/manufacturer/proofs')}
              className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50"
            >
              ← Quay lại
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Proof Information */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span>📦</span> Thông tin sản xuất
            </h2>
            
            <div className="space-y-4">
              <InfoRow label="Tên thuốc" value={proof.drug?.tradeName || proof.drugName || 'N/A'} />
              <InfoRow label="Tên hoạt chất" value={proof.drug?.genericName || proof.genericName || 'N/A'} />
              <InfoRow label="Mã ATC" value={proof.drug?.atcCode || 'N/A'} />
              <InfoRow label="Mã lô" value={proof.batchNumber || 'N/A'} badge />
              <InfoRow label="Serial Number" value={proof.serialNumber || nftInfo?.serialNumber || 'N/A'} mono />
              <InfoRow label="Số lượng" value={`${proof.quantity?.toLocaleString() || 0} viên`} />
              <InfoRow label="Ngày sản xuất" value={proof.mfgDate ? new Date(proof.mfgDate).toLocaleDateString('vi-VN') : 'N/A'} />
              <InfoRow label="Ngày hết hạn" value={proof.expDate ? new Date(proof.expDate).toLocaleDateString('vi-VN') : 'N/A'} />
              <InfoRow label="Kiểm định viên" value={proof.qaInspector || 'Không có'} />
              {proof.qaReportUri && (
                <div className="pt-2">
                  <a
                    href={proof.qaReportUri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-2"
                  >
                    <span>📄</span> Xem báo cáo QA
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* NFT Information */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span>🎨</span> Thông tin NFT
            </h2>
            
            {nftInfo ? (
              <div className="space-y-4">
                <InfoRow label="Token ID" value={nftInfo.tokenId} badge />
                <InfoRow label="Contract Address" value={nftInfo.contractAddress || proof.contractAddress || 'N/A'} mono small />
                <InfoRow label="Batch Number" value={nftInfo.batchNumber || 'N/A'} badge />
                <InfoRow label="Status" value={nftInfo.status || 'minted'} status />
                <InfoRow label="Owner" value={nftInfo.owner?.fullName || nftInfo.owner?.username || 'N/A'} />
                
                {(nftInfo.chainTxHash || proof.chainTxHash) && (
                  <div className="pt-2 border-t border-gray-100">
                    <label className="text-sm font-semibold text-gray-600 block mb-2">Transaction Hash:</label>
                    <a
                      href={`https://etherscan.io/tx/${nftInfo.chainTxHash || proof.chainTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-600 hover:text-cyan-700 font-mono text-sm break-all flex items-center gap-2"
                    >
                      <span>🔗</span>
                      {nftInfo.chainTxHash || proof.chainTxHash}
                    </a>
                  </div>
                )}

                {nftInfo.ipfsUrl && (
                  <div className="pt-2">
                    <a
                      href={ipfsToHttp(nftInfo.ipfsUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-2"
                    >
                      <span>🔗</span> Xem metadata trên IPFS
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <span className="text-4xl block mb-2">📭</span>
                Không có thông tin NFT
              </div>
            )}
          </div>
        </div>

        {/* NFT Metadata */}
        {nftInfo?.metadata && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span>📝</span> NFT Metadata
            </h2>
            
            <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-xl p-6">
              <h3 className="font-bold text-lg text-gray-800 mb-2">{nftInfo.metadata.name}</h3>
              <p className="text-gray-700 mb-6">{nftInfo.metadata.description}</p>
              
              {nftInfo.metadata.attributes && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {nftInfo.metadata.attributes.map((attr, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">{attr.trait_type}</div>
                      <div className="font-semibold text-gray-800 text-sm">{attr.value}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// Helper component
const InfoRow = ({ label, value, badge, mono, small, status }) => (
  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-100">
    <span className="text-sm font-semibold text-gray-600 mb-1 sm:mb-0">{label}:</span>
    {badge ? (
      <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold bg-cyan-100 text-cyan-800 w-fit">
        {value}
      </span>
    ) : status ? (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 w-fit">
        {value}
      </span>
    ) : mono ? (
      <span className={`font-mono ${small ? 'text-xs' : 'text-sm'} text-gray-800 break-all`}>{value}</span>
    ) : (
      <span className="text-sm text-gray-800 font-medium">{value}</span>
    )}
  </div>
);


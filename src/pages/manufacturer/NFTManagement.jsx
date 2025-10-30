import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { getMyNFTs } from '../../services/manufacturer/nftService';
import { ipfsToHttp } from '../../utils/ipfsHelper';
import { getManufacturerNavigationItems } from '../../utils/manufacturerNavigation.jsx';

export default function NFTManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadNFTs();
  }, []);

  const loadNFTs = async () => {
    setLoading(true);
    try {
      const response = await getMyNFTs();
      if (response.success) {
        setNfts(response.data.nfts || response.data || []);
      }
    } catch (error) {
      console.error('Error loading NFTs:', error);
      // Không hiển thị alert để tránh làm phiền người dùng
      setNfts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (nft) => {
    setSelectedNFT(nft);
    setShowDetailModal(true);
  };

  const getStatusBadge = (status) => {
    const styles = {
      minted: 'bg-green-100 text-green-800',
      transferred: 'bg-blue-100 text-blue-800',
      sold: 'bg-teal-100 text-teal-800',
      expired: 'bg-red-100 text-red-800',
      recalled: 'bg-orange-100 text-orange-800'
    };
    
    const labels = {
      minted: '✓ Minted',
      transferred: '→ Transferred',
      sold: '$ Sold',
      expired: '⏰ Expired',
      recalled: '⚠️ Recalled'
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.minted}`}>
        {labels[status] || status}
      </span>
    );
  };

  const navigationItems = getManufacturerNavigationItems(location.pathname);

  return (
    <DashboardLayout navigationItems={navigationItems}>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🎨</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Quản lý NFT</h1>
                <p className="text-sm text-gray-500">Danh sách NFT đã tạo</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-cyan-600">{nfts.length}</div>
              <div className="text-sm text-gray-500">Tổng NFT</div>
            </div>
          </div>
        </div>

        {/* NFT Grid */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          {loading ? (
            <div className="flex flex-col items-center py-12">
              <div className="h-12 w-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Đang tải NFT...</p>
            </div>
          ) : nfts.length === 0 ? (
            <div className="flex flex-col items-center text-center py-12">
              <div className="w-24 h-24 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-5xl">🎨</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Chưa có NFT nào</h3>
              <p className="text-gray-600 mb-4">Tạo Proof of Production để mint NFT</p>
              <button
                onClick={() => navigate('/manufacturer/proofs/create')}
                className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white rounded-xl font-semibold shadow-lg"
              >
                + Tạo Proof mới
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nfts.map((nft, index) => (
                <div
                  key={nft._id || index}
                  className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-xl border-2 border-cyan-200 overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer"
                  onClick={() => handleViewDetail(nft)}
                >
                  {/* NFT Image/Icon */}
                  <div className="h-48 bg-gradient-to-br from-cyan-400 to-teal-600 flex items-center justify-center relative overflow-hidden">
                    <span className="text-6xl group-hover:scale-110 transition-transform duration-300">🎨</span>
                    <div className="absolute top-3 right-3">
                      {getStatusBadge(nft.status)}
                    </div>
                  </div>

                  {/* NFT Info */}
                  <div className="p-5">
                    <div className="mb-3">
                      <div className="text-xs text-cyan-600 font-semibold mb-1">Token ID</div>
                      <div className="font-mono text-lg font-bold text-gray-800">#{nft.tokenId}</div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Batch Number:</span>
                        <span className="font-semibold text-gray-800">{nft.batchNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Drug:</span>
                        <span className="font-semibold text-gray-800 truncate ml-2">{nft.drug?.tradeName || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quantity:</span>
                        <span className="font-semibold text-gray-800">{nft.quantity?.toLocaleString() || 0}</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetail(nft);
                      }}
                      className="mt-4 w-full px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white rounded-lg font-semibold text-sm transition-all shadow-md hover:shadow-lg"
                    >
                      Xem chi tiết →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedNFT && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-600 to-teal-600 px-8 py-6 rounded-t-3xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">🎨</span>
                  <div>
                    <h2 className="text-2xl font-bold text-white">NFT Details</h2>
                    <p className="text-cyan-100 text-sm">Token ID: #{selectedNFT.tokenId}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center text-white text-xl"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-4">
              <InfoRow label="Token ID" value={selectedNFT.tokenId} />
              <InfoRow label="Batch Number" value={selectedNFT.batchNumber} />
              <InfoRow label="Serial Number" value={selectedNFT.serialNumber} />
              <InfoRow label="Status" value={selectedNFT.status} />
              <InfoRow label="Drug" value={selectedNFT.drug?.tradeName || 'N/A'} />
              <InfoRow label="Quantity" value={`${selectedNFT.quantity?.toLocaleString() || 0} ${selectedNFT.unit || 'units'}`} />
              <InfoRow label="Mfg Date" value={selectedNFT.mfgDate ? new Date(selectedNFT.mfgDate).toLocaleDateString('vi-VN') : 'N/A'} />
              <InfoRow label="Exp Date" value={selectedNFT.expDate ? new Date(selectedNFT.expDate).toLocaleDateString('vi-VN') : 'N/A'} />
              
              {selectedNFT.contractAddress && (
                <div className="pt-2">
                  <label className="text-sm font-semibold text-gray-600 block mb-2">Contract Address:</label>
                  <code className="block bg-gray-100 rounded-lg p-3 text-xs font-mono break-all">{selectedNFT.contractAddress}</code>
                </div>
              )}

              {selectedNFT.chainTxHash && (
                <div className="pt-2">
                  <label className="text-sm font-semibold text-gray-600 block mb-2">Transaction Hash:</label>
                  <a
                    href={`https://etherscan.io/tx/${selectedNFT.chainTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-gray-100 rounded-lg p-3 text-xs font-mono break-all text-cyan-600 hover:text-cyan-700"
                  >
                    {selectedNFT.chainTxHash}
                  </a>
                </div>
              )}

              {selectedNFT.ipfsUrl && (
                <div className="pt-2">
                  <a
                    href={ipfsToHttp(selectedNFT.ipfsUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-2"
                  >
                    <span>🔗</span> View on IPFS
                  </a>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t border-gray-200 bg-gray-50 rounded-b-3xl flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

// Helper component
const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-100">
    <span className="text-sm font-semibold text-gray-600">{label}:</span>
    <span className="text-sm text-gray-800 font-medium">{value}</span>
  </div>
);


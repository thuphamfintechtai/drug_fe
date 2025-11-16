import api from '../../utils/api';

// Lấy danh sách NFT của manufacturer
export const getMyNFTs = async () => {
  try {
    const response = await api.get('/nft-tracking/my-nfts');
    return response.data;
  } catch (error) {
    console.error('Error fetching my NFTs:', error);
    throw error;
  }
};

// Lấy chi tiết NFT
export const getNFTById = async (nftId) => {
  try {
    const response = await api.get(`/nft-tracking/${nftId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching NFT details:', error);
    throw error;
  }
};

// Lấy lịch sử tracking của NFT
export const getNFTTrackingHistory = async (tokenId) => {
  try {
    const response = await api.get(`/nft-tracking/history/${tokenId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching NFT tracking history:', error);
    throw error;
  }
};

// Lấy NFT theo batch number
export const getNFTByBatchNumber = async (batchNumber) => {
  try {
    const response = await api.get(`/nft-tracking/batch/${batchNumber}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching NFT by batch:', error);
    throw error;
  }
};

export default {
  getMyNFTs,
  getNFTById,
  getNFTTrackingHistory,
  getNFTByBatchNumber
};


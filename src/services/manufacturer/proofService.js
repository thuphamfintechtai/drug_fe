import api from '../../utils/api';

// Tạo metadata NFT trước khi mint
export const generateNFTMetadata = async (data) => {
  try {
    const response = await api.post('/proof-of-production/generate-metadata', data);
    return response.data;
  } catch (error) {
    console.error('Error generating NFT metadata:', error);
    throw error;
  }
};

// Tạo Proof of Production (sau khi đã mint NFT)
export const createProofOfProduction = async (proofData) => {
  try {
    const response = await api.post('/proof-of-production', proofData);
    return response.data;
  } catch (error) {
    console.error('Error creating proof of production:', error);
    throw error;
  }
};

// Lấy danh sách Proof of Production của manufacturer
export const getMyProofs = async (page = 1, limit = 10) => {
  try {
    const response = await api.get(`/proof-of-production/manufacturer/my-proofs?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching my proofs:', error);
    throw error;
  }
};

// Lấy tất cả Proof of Production (có filter)
export const getAllProofs = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/proof-of-production?${queryString}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all proofs:', error);
    throw error;
  }
};

// Lấy chi tiết Proof of Production
export const getProofById = async (proofId) => {
  try {
    const response = await api.get(`/proof-of-production/${proofId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching proof details:', error);
    throw error;
  }
};

// Cập nhật Proof of Production
export const updateProof = async (proofId, updateData) => {
  try {
    const response = await api.put(`/proof-of-production/${proofId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Error updating proof:', error);
    throw error;
  }
};

// Tìm kiếm Proof theo batch number
export const searchProofByBatch = async (batchNumber) => {
  try {
    const response = await api.get(`/proof-of-production/search/batch/${batchNumber}`);
    return response.data;
  } catch (error) {
    console.error('Error searching proof by batch:', error);
    throw error;
  }
};

// Lấy thống kê Proof of Production
export const getProofStats = async () => {
  try {
    const response = await api.get('/proof-of-production/stats/overview');
    return response.data;
  } catch (error) {
    console.error('Error fetching proof stats:', error);
    throw error;
  }
};

export default {
  generateNFTMetadata,
  createProofOfProduction,
  getMyProofs,
  getAllProofs,
  getProofById,
  updateProof,
  searchProofByBatch,
  getProofStats
};


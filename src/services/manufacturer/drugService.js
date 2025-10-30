import api from '../../utils/api';

// Lấy danh sách thuốc của manufacturer
export const getMyDrugs = async (page = 1, limit = 10) => {
  try {
    const response = await api.get(`/drugs?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching drugs:', error);
    throw error;
  }
};

// Lấy danh sách tất cả thuốc (để chọn khi tạo proof)
export const getAllDrugs = async () => {
  try {
    const response = await api.get('/drugs');
    return response.data;
  } catch (error) {
    console.error('Error fetching all drugs:', error);
    throw error;
  }
};

// Lấy chi tiết thuốc
export const getDrugById = async (drugId) => {
  try {
    const response = await api.get(`/drugs/${drugId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching drug details:', error);
    throw error;
  }
};

// Tạo thuốc mới
export const createDrug = async (drugData) => {
  try {
    const response = await api.post('/drugs', drugData);
    return response.data;
  } catch (error) {
    console.error('Error creating drug:', error);
    throw error;
  }
};

// Lấy thuốc theo manufacturer ID
export const getDrugsByManufacturerId = async (manufacturerId) => {
  try {
    const response = await api.get(`/drugs/getDrugByManufactor/${manufacturerId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching drugs by manufacturer:', error);
    throw error;
  }
};

// Tìm kiếm thuốc theo ATC code
export const searchDrugByCode = async (atcCode) => {
  try {
    const response = await api.get(`/drugs/code/${atcCode}`);
    return response.data;
  } catch (error) {
    console.error('Error searching drug by code:', error);
    throw error;
  }
};

export default {
  getMyDrugs,
  getAllDrugs,
  getDrugById,
  createDrug,
  getDrugsByManufacturerId,
  searchDrugByCode
};


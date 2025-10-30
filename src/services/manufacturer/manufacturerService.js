import api from '../../utils/api';

// Lấy danh sách tất cả manufacturers
export const getAllManufacturers = async () => {
  try {
    const response = await api.get('/manufactors');
    return response.data;
  } catch (error) {
    console.error('Error fetching manufacturers:', error);
    throw error;
  }
};

// Tìm kiếm manufacturer theo tên
export const searchManufacturerByName = async (name) => {
  try {
    const response = await api.get(`/manufactors/${name}`);
    return response.data;
  } catch (error) {
    console.error('Error searching manufacturer:', error);
    throw error;
  }
};

export default {
  getAllManufacturers,
  searchManufacturerByName
};


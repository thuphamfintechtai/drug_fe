import api from '../../utils/api';

export const createProofToPharmacy = (data) =>
  api.post('/proof-of-pharmacy/pharmacy/create-delivery', data);

export const getDeliveriesToPharmacy = () =>
  api.get('/proof-of-pharmacy/pharmacy/distributor/my-deliveries');

export const updatePharmacyDeliveryStatus = (id, data) =>
  api.put(`/proof-of-pharmacy/pharmacy/${id}/status`, data);

// Lấy danh sách Proof of Pharmacy để extract unique pharmacies
export const getAllProofOfPharmacies = () =>
  api.get('/proof-of-pharmacy/pharmacy?limit=1000');

// Lấy chi tiết Proof of Pharmacy
export const getProofOfPharmacyById = (id) =>
  api.get(`/proof-of-pharmacy/pharmacy/${id}`);
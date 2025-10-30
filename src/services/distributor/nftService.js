import api from '../../utils/api';
export const trackNFT = (nftId) => api.get(`/NFTTracking/${nftId}`);

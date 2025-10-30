import api from '../../utils/api';

export const getTrackingByNftId = (nftId) => api.get(`/NFTTracking/NFTTracking/${encodeURIComponent(nftId)}`);

export default { getTrackingByNftId };



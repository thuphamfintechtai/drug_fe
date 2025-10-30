import api from '../../utils/api';
export const getMyInvoices = () => api.get('/invoice/distributor/my-invoices');

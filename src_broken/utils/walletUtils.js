import { getAddress } from 'ethers';

/**
 * So sánh hai địa chỉ ví Ethereum (case-insensitive)
 * @param {string} address1 - Địa chỉ ví thứ nhất
 * @param {string} address2 - Địa chỉ ví thứ hai
 * @returns {boolean} - true nếu hai địa chỉ khớp nhau
 */
export const compareWalletAddresses = (address1, address2) => {
  if (!address1 || !address2) {
    return false;
  }

  try {
    // Normalize cả hai địa chỉ về checksum format để so sánh
    const normalized1 = getAddress(address1.toLowerCase());
    const normalized2 = getAddress(address2.toLowerCase());
    return normalized1 === normalized2;
  } catch (error) {
    console.error('Error comparing wallet addresses:', error);
    return false;
  }
};

/**
 * Kiểm tra xem địa chỉ ví có hợp lệ không
 * @param {string} address - Địa chỉ ví cần kiểm tra
 * @returns {boolean} - true nếu địa chỉ hợp lệ
 */
export const isValidWalletAddress = (address) => {
  if (!address || typeof address !== 'string') {
    return false;
  }

  try {
    getAddress(address);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Format địa chỉ ví để hiển thị (ví dụ: 0x1234...5678)
 * @param {string} address - Địa chỉ ví
 * @param {number} startLength - Số ký tự đầu tiên (mặc định: 6)
 * @param {number} endLength - Số ký tự cuối cùng (mặc định: 4)
 * @returns {string} - Địa chỉ đã format
 */
export const formatWalletAddress = (address, startLength = 6, endLength = 4) => {
  if (!address) return '';
  if (address.length <= startLength + endLength) return address;
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
};


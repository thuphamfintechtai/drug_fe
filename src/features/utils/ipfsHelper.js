/**
 * IPFS Helper - Upload metadata to IPFS
 * Using Pinata or IPFS public gateway
 */

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY || '';
const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY || '';
const PINATA_API_URL = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';

/**
 * Upload JSON metadata to IPFS via Pinata
 * @param {Object} metadata - NFT metadata object
 * @returns {string} - IPFS URL (ipfs://...)
 */
export const uploadMetadataToIPFS = async (metadata) => {
  try {
    // If no Pinata keys, return a mock IPFS URL for development
    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
      console.warn('⚠️ Pinata keys not configured. Using mock IPFS URL.');
      const mockHash = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      return `ipfs://${mockHash}`;
    }

    console.log('📤 Uploading metadata to IPFS...', metadata);

    const response = await fetch(PINATA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY
      },
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: {
          name: `NFT-Metadata-${Date.now()}`
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Pinata API error: ${response.statusText}`);
    }

    const data = await response.json();
    const ipfsHash = data.IpfsHash;
    const ipfsUrl = `ipfs://${ipfsHash}`;

    console.log(' Metadata uploaded to IPFS:', ipfsUrl);

    return ipfsUrl;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw new Error('Failed to upload metadata to IPFS');
  }
};

/**
 * Upload file to IPFS via Pinata
 * @param {File} file - File to upload
 * @returns {string} - IPFS URL (ipfs://...)
 */
export const uploadFileToIPFS = async (file) => {
  try {
    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
      console.warn('⚠️ Pinata keys not configured. Using mock IPFS URL.');
      const mockHash = `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      return `ipfs://${mockHash}`;
    }

    console.log('📤 Uploading file to IPFS...', file.name);

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Pinata API error: ${response.statusText}`);
    }

    const data = await response.json();
    const ipfsHash = data.IpfsHash;
    const ipfsUrl = `ipfs://${ipfsHash}`;

    console.log(' File uploaded to IPFS:', ipfsUrl);

    return ipfsUrl;
  } catch (error) {
    console.error('Error uploading file to IPFS:', error);
    throw new Error('Failed to upload file to IPFS');
  }
};

/**
 * Convert IPFS URL to HTTP gateway URL
 * @param {string} ipfsUrl - IPFS URL (ipfs://...)
 * @returns {string} - HTTP URL
 */
export const ipfsToHttp = (ipfsUrl) => {
  if (!ipfsUrl) return '';
  
  if (ipfsUrl.startsWith('ipfs://')) {
    const hash = ipfsUrl.replace('ipfs://', '');
    return `https://gateway.pinata.cloud/ipfs/${hash}`;
  }
  
  return ipfsUrl;
};

/**
 * Fetch metadata from IPFS
 * @param {string} ipfsUrl - IPFS URL
 * @returns {Object} - Metadata object
 */
export const fetchMetadataFromIPFS = async (ipfsUrl) => {
  try {
    const httpUrl = ipfsToHttp(ipfsUrl);
    const response = await fetch(httpUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.statusText}`);
    }
    
    const metadata = await response.json();
    return metadata;
  } catch (error) {
    console.error('Error fetching metadata from IPFS:', error);
    throw error;
  }
};

export default {
  uploadMetadataToIPFS,
  uploadFileToIPFS,
  ipfsToHttp,
  fetchMetadataFromIPFS
};


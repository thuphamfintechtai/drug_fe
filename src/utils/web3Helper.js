import { ethers } from 'ethers';
import deployedAddresses from '../../deployed_addresses.json';
import nftABI from '../../DeployModuleMyNFT.json';

// Contract addresses
const NFT_CONTRACT_ADDRESS = deployedAddresses['DeployModule#MyNFT'];
const ACCESS_CONTROL_ADDRESS = deployedAddresses['DeployModule#accessControlService'];

// Minimal ABI for access control check
const ACCESS_CONTROL_MIN_ABI = [
  {
    "inputs": [{ "internalType": "address", "name": "_user", "type": "address" }],
    "name": "checkIsManufacturer",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  }
];

/**
 * Get Web3 Provider from MetaMask
 */
export const getWeb3Provider = async () => {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
  }

  try {
    // Request account access
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    return provider;
  } catch (error) {
    console.error('Error connecting to MetaMask:', error);
    throw new Error('Failed to connect to MetaMask. Please try again.');
  }
};

/**
 * Get current connected wallet address
 */
export const getCurrentWalletAddress = async () => {
  try {
    const provider = await getWeb3Provider();
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    return address;
  } catch (error) {
    console.error('Error getting wallet address:', error);
    throw error;
  }
};

/**
 * Get NFT Contract instance
 */
export const getNFTContract = async () => {
  try {
    const provider = await getWeb3Provider();
    const signer = await provider.getSigner();
    
    const contract = new ethers.Contract(
      NFT_CONTRACT_ADDRESS,
      nftABI.abi,
      signer
    );
    
    return contract;
  } catch (error) {
    console.error('Error getting NFT contract:', error);
    throw error;
  }
};

/**
 * Ensure a contract address is deployed on current network
 */
const ensureDeployed = async (provider, address) => {
  const code = await provider.getCode(address);
  if (code === '0x') {
    throw new Error(`Contract not deployed at ${address} on current network`);
  }
};

/**
 * Check on-chain manufacturer role for an address
 */
export const checkIsManufacturerOnchain = async (address) => {
  const provider = await getWeb3Provider();
  await ensureDeployed(provider, ACCESS_CONTROL_ADDRESS);
  const access = new ethers.Contract(ACCESS_CONTROL_ADDRESS, ACCESS_CONTROL_MIN_ABI, provider);
  return await access.checkIsManufacturer(address);
};

/**
 * Mint NFT on blockchain
 * @param {string|number} amountOrURI - Số lượng NFT cần mint (number) hoặc tokenURI (deprecated)
 * @returns {Object} - { tokenId, transactionHash }
 */
export const mintNFT = async (amountOrURI) => {
  try {
    // Xác định amountOrURI là số lượng hay tokenURI
    const amount = typeof amountOrURI === 'number' ? amountOrURI : 1;
    
    console.log('🎨 Minting NFT với số lượng:', amount);
    if (typeof amountOrURI === 'string') {
      console.log('⚠️ Deprecated: tokenURI parameter không còn được sử dụng. Sử dụng số lượng thay thế.');
    }
    
    const contract = await getNFTContract();
    const walletAddress = await getCurrentWalletAddress();
    
    console.log('📍 Wallet Address:', walletAddress);
    console.log('📍 NFT Contract Address:', NFT_CONTRACT_ADDRESS);
    
    // Call mintNFT function - pass array of amounts (uint256[])
    // Contract nhận uint256[] amounts, không phải string[] tokenURIs
    const tx = await contract.mintNFT([amount]);
    
    console.log('⏳ Transaction submitted:', tx.hash);
    console.log('⏳ Waiting for confirmation...');
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    console.log('✅ Transaction confirmed:', receipt);
    
    // Extract token ID from events (ERC1155)
    // Tìm event mintNFTEvent hoặc TransferSingle
    let tokenId = null;
    const tokenIds = [];
    
    for (const log of receipt.logs) {
      try {
        const parsedLog = contract.interface.parseLog(log);
        if (parsedLog) {
          // Ưu tiên tìm event mintNFTEvent (custom event)
          if (parsedLog.name === 'mintNFTEvent' && parsedLog.args.tokenIds) {
            const ids = parsedLog.args.tokenIds;
            if (Array.isArray(ids) && ids.length > 0) {
              tokenId = ids[0].toString();
              console.log('🎫 Token ID từ mintNFTEvent:', tokenId);
              break;
            } else if (ids) {
              tokenId = ids.toString();
              console.log('🎫 Token ID từ mintNFTEvent:', tokenId);
              break;
            }
          }
          // Hoặc tìm TransferSingle event (ERC1155)
          else if (parsedLog.name === 'TransferSingle') {
            const from = parsedLog.args.from;
            const zeroAddress = '0x0000000000000000000000000000000000000000';
            if (from === zeroAddress || from === ethers.ZeroAddress) {
              tokenId = parsedLog.args.id.toString();
              console.log('🎫 Token ID từ TransferSingle:', tokenId);
              break;
            }
          }
        }
      } catch (e) {
        // Ignore logs that can't be parsed
        console.log('Không thể parse log:', e.message);
      }
    }
    
    if (!tokenId) {
      throw new Error('Could not extract token ID from transaction');
    }
    
    return {
      success: true,
      tokenId: tokenId,
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      contractAddress: NFT_CONTRACT_ADDRESS
    };
  } catch (error) {
    console.error('❌ Error minting NFT:', error);
    
    // Parse error message
    let errorMessage = 'Failed to mint NFT';
    if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
      errorMessage = 'Transaction was rejected by user';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Get NFT owner
 */
export const getNFTOwner = async (tokenId) => {
  try {
    const contract = await getNFTContract();
    const owner = await contract.ownerOf(tokenId);
    return owner;
  } catch (error) {
    console.error('Error getting NFT owner:', error);
    throw error;
  }
};

/**
 * Get NFT Token URI
 */
export const getNFTTokenURI = async (tokenId) => {
  try {
    const contract = await getNFTContract();
    const tokenURI = await contract.tokenURI(tokenId);
    return tokenURI;
  } catch (error) {
    console.error('Error getting NFT token URI:', error);
    throw error;
  }
};

/**
 * Get NFT tracking history
 */
export const getNFTTrackingHistory = async (tokenId) => {
  try {
    const contract = await getNFTContract();
    const history = await contract.getTrackingHistory(tokenId);
    return history;
  } catch (error) {
    console.error('Error getting NFT tracking history:', error);
    throw error;
  }
};

/**
 * Transfer NFT to distributor
 */
export const transferNFTToDistributor = async (tokenIds, distributorAddress) => {
  try {
    console.log('📦 Transferring NFTs to distributor...');
    console.log('Token IDs:', tokenIds);
    console.log('Distributor Address:', distributorAddress);

    // Basic validations
    if (!Array.isArray(tokenIds) || tokenIds.length === 0) {
      throw new Error('tokenIds must be a non-empty array');
    }
    if (!ethers.isAddress(distributorAddress)) {
      throw new Error('Invalid distributor address');
    }

    const provider = await getWeb3Provider();
    const signer = await provider.getSigner();
    const signerAddress = await signer.getAddress();

    // Ensure contracts are deployed on this network
    await ensureDeployed(provider, NFT_CONTRACT_ADDRESS);
    await ensureDeployed(provider, ACCESS_CONTROL_ADDRESS);

    // Check manufacturer role on-chain
    const access = new ethers.Contract(ACCESS_CONTROL_ADDRESS, ACCESS_CONTROL_MIN_ABI, provider);
    const isMf = await access.checkIsManufacturer(signerAddress);
    if (!isMf) {
      throw new Error('Invalid Role: Only Manufacturer');
    }

    // Normalize tokenIds to BigInt[]
    const normalizedTokenIds = tokenIds.map((id) => {
      if (typeof id === 'string' && id.startsWith('0x')) return BigInt(id);
      return BigInt(id);
    });

    // Create amounts array (default to 1 for each token for ERC1155)
    const normalizedAmounts = tokenIds.map(() => 1n); // Use BigInt literal

    const contract = await getNFTContract();

    // Check balances before transfer
    console.log('🔍 Checking balances before transfer...');
    const balanceChecks = await Promise.all(
      normalizedTokenIds.map(async (tokenId) => {
        const balance = await contract.balanceOf(signerAddress, tokenId);
        return { tokenId, balance: balance.toString() };
      })
    );
    
    console.log('📊 Token balances:', balanceChecks);
    
    // Validate balances
    for (let i = 0; i < normalizedTokenIds.length; i++) {
      const balance = balanceChecks[i].balance;
      const requiredAmount = normalizedAmounts[i].toString();
      if (BigInt(balance) < normalizedAmounts[i]) {
        throw new Error(
          `Insufficient balance for token ID ${normalizedTokenIds[i]}: ` +
          `have ${balance}, need ${requiredAmount}. ` +
          `Please ensure the token IDs are correct and belong to this manufacturer.`
        );
      }
    }

    // Call manufacturerTransferToDistributor(tokenIds, amounts, distributorAddress)
    // This is the correct function name from the ABI
    console.log('📤 Calling manufacturerTransferToDistributor...');
    console.log('TokenIds:', normalizedTokenIds);
    console.log('Amounts:', normalizedAmounts);
    console.log('Distributor:', distributorAddress);
    
    const tx = await contract.manufacturerTransferToDistributor(
      normalizedTokenIds,
      normalizedAmounts,
      distributorAddress
    );
    console.log('⏳ Transaction submitted:', tx.hash);
    const receipt = await tx.wait();
    console.log('✅ Transfer confirmed:', receipt);

    return { success: true, transactionHash: tx.hash, blockNumber: receipt.blockNumber };
  } catch (error) {
    console.error('❌ Error transferring NFT:', error);
    // Friendly error messages
    if (error?.code === 'ACTION_REJECTED' || error?.code === 4001) {
      throw new Error('User rejected the transaction');
    }
    if (/(Invalid Role|Only Manufacturer)/i.test(error?.message || '')) {
      throw new Error('Invalid Role: Only Manufacturer');
    }
    if (error?.code === 'CALL_EXCEPTION') {
      // Check for specific revert reasons
      const errorMessage = error?.message || error?.reason || '';
      if (/insufficient balance/i.test(errorMessage)) {
        throw new Error(
          '❌ Không đủ số lượng token để chuyển giao. ' +
          'Vui lòng kiểm tra:\n' +
          '1. Token IDs có tồn tại và đã được mint chưa?\n' +
          '2. Token IDs có thuộc sở hữu của manufacturer này không?\n' +
          '3. Token IDs đã được transfer đi chưa?'
        );
      }
      throw new Error('Contract call exception (reverted). Please check role, ownership, and network.');
    }
    if (/Contract not deployed/.test(error?.message || '')) {
      throw new Error(error.message);
    }
    if (/Insufficient balance/i.test(error?.message || '')) {
      throw error; // Re-throw our custom error message
    }
    throw new Error(error?.message || 'Failed to transfer NFTs');
  }
};

/**
 * Transfer batch ERC1155 NFTs with amounts to distributor
 */
export const transferBatchNFTToDistributor = async (tokenIds, amounts, distributorAddress) => {
  try {
    console.log('📦 Batch transfer NFTs to distributor...');
    console.log('Token IDs:', tokenIds);
    console.log('Amounts:', amounts);
    console.log('Distributor Address:', distributorAddress);

    // Basic validations
    if (!Array.isArray(tokenIds) || tokenIds.length === 0) {
      throw new Error('tokenIds must be a non-empty array');
    }
    if (!Array.isArray(amounts) || amounts.length === 0) {
      throw new Error('amounts must be a non-empty array');
    }
    if (tokenIds.length !== amounts.length) {
      throw new Error('tokenIds and amounts must have the same length');
    }
    if (!ethers.isAddress(distributorAddress)) {
      throw new Error('Invalid distributor address');
    }

    const provider = await getWeb3Provider();
    const signer = await provider.getSigner();
    const signerAddress = await signer.getAddress();

    // Ensure contracts are deployed on this network
    await ensureDeployed(provider, NFT_CONTRACT_ADDRESS);
    await ensureDeployed(provider, ACCESS_CONTROL_ADDRESS);

    // Check manufacturer role on-chain
    const access = new ethers.Contract(ACCESS_CONTROL_ADDRESS, ACCESS_CONTROL_MIN_ABI, provider);
    const isMf = await access.checkIsManufacturer(signerAddress);
    if (!isMf) {
      throw new Error('Invalid Role: Only Manufacturer');
    }

    // Normalize tokenIds to BigInt[]
    const normalizedTokenIds = tokenIds.map((id) => {
      if (typeof id === 'bigint') return id;
      if (typeof id === 'string' && id.startsWith('0x')) return BigInt(id);
      return BigInt(id);
    });

    // Normalize amounts to BigInt[]
    const normalizedAmounts = amounts.map((amt) => {
      if (typeof amt === 'bigint') return amt;
      if (typeof amt === 'string') return BigInt(amt);
      if (typeof amt === 'number') return BigInt(amt);
      return BigInt(amt);
    });

    const contract = await getNFTContract();

    // Check balances before transfer
    console.log('🔍 Checking balances before transfer...');
    const balanceChecks = await Promise.all(
      normalizedTokenIds.map(async (tokenId) => {
        const balance = await contract.balanceOf(signerAddress, tokenId);
        return { tokenId, balance: balance.toString() };
      })
    );
    
    console.log('📊 Token balances:', balanceChecks);
    
    // Validate balances
    for (let i = 0; i < normalizedTokenIds.length; i++) {
      const balance = balanceChecks[i].balance;
      const requiredAmount = normalizedAmounts[i].toString();
      if (BigInt(balance) < normalizedAmounts[i]) {
        throw new Error(
          `Insufficient balance for token ID ${normalizedTokenIds[i]}: ` +
          `have ${balance}, need ${requiredAmount}. ` +
          `Please ensure the token IDs are correct and belong to this manufacturer.`
        );
      }
    }

    // Call manufacturerTransferToDistributor(tokenIds, amounts, distributorAddress)
    console.log('📤 Calling manufacturerTransferToDistributor...');
    console.log('TokenIds:', normalizedTokenIds);
    console.log('Amounts:', normalizedAmounts);
    console.log('Distributor:', distributorAddress);

    const tx = await contract.manufacturerTransferToDistributor(
      normalizedTokenIds,
      normalizedAmounts,
      distributorAddress
    );

    console.log('⏳ Transaction submitted:', tx.hash);
    const receipt = await tx.wait();
    console.log('✅ Batch transfer confirmed:', receipt);

    return {
      success: true,
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
    console.error('❌ Error batch transferring NFT:', error);
    // Friendly error messages
    if (error?.code === 'ACTION_REJECTED' || error?.code === 4001) {
      throw new Error('User rejected the transaction');
    }
    if (/(Invalid Role|Only Manufacturer)/i.test(error?.message || '')) {
      throw new Error('Invalid Role: Only Manufacturer');
    }
    if (error?.code === 'CALL_EXCEPTION') {
      // Check for specific revert reasons
      const errorMessage = error?.message || error?.reason || '';
      if (/insufficient balance/i.test(errorMessage)) {
        throw new Error(
          '❌ Không đủ số lượng token để chuyển giao. ' +
          'Vui lòng kiểm tra:\n' +
          '1. Token IDs có tồn tại và đã được mint chưa?\n' +
          '2. Token IDs có thuộc sở hữu của manufacturer này không?\n' +
          '3. Token IDs đã được transfer đi chưa?'
        );
      }
      throw new Error('Contract call exception (reverted). Please check role, ownership, and network.');
    }
    if (/Contract not deployed/.test(error?.message || '')) {
      throw new Error(error.message);
    }
    if (/Insufficient balance/i.test(error?.message || '')) {
      throw error; // Re-throw our custom error message
    }
    throw new Error(error?.message || 'Failed to transfer NFTs');
  }
};

/**
 * Check if MetaMask is installed
 */
export const isMetaMaskInstalled = () => {
  return typeof window.ethereum !== 'undefined';
};

/**
 * Check if wallet is connected
 */
export const isWalletConnected = async () => {
  if (!isMetaMaskInstalled()) {
    return false;
  }
  
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.listAccounts();
    return accounts.length > 0;
  } catch (error) {
    return false;
  }
};

/**
 * Connect wallet
 */
export const connectWallet = async () => {
  try {
    const provider = await getWeb3Provider();
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    
    return {
      success: true,
      address: address
    };
  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw error;
  }
};

export default {
  getWeb3Provider,
  getCurrentWalletAddress,
  getNFTContract,
  mintNFT,
  getNFTOwner,
  getNFTTokenURI,
  getNFTTrackingHistory,
  transferNFTToDistributor,
  isMetaMaskInstalled,
  isWalletConnected,
  connectWallet
};


import { ethers } from 'ethers';
import deployedAddresses from '../../deployed_addresses.json';
import nftABI from '../../DeployModuleMyNFT.json';

// Contract addresses
const NFT_CONTRACT_ADDRESS = deployedAddresses['DeployModule#MyNFT'];

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
 * Mint NFT on blockchain
 * @param {string} tokenURI - IPFS URL or metadata URL
 * @returns {Object} - { tokenId, transactionHash }
 */
export const mintNFT = async (tokenURI) => {
  try {
    console.log('🎨 Minting NFT with URI:', tokenURI);
    
    const contract = await getNFTContract();
    const walletAddress = await getCurrentWalletAddress();
    
    console.log('📍 Wallet Address:', walletAddress);
    console.log('📍 NFT Contract Address:', NFT_CONTRACT_ADDRESS);
    
    // Call mintNFT function - pass array of tokenURIs
    const tx = await contract.mintNFT([tokenURI]);
    
    console.log('⏳ Transaction submitted:', tx.hash);
    console.log('⏳ Waiting for confirmation...');
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    console.log('✅ Transaction confirmed:', receipt);
    
    // Extract token ID from Transfer event
    let tokenId = null;
    for (const log of receipt.logs) {
      try {
        const parsedLog = contract.interface.parseLog(log);
        if (parsedLog && parsedLog.name === 'Transfer') {
          tokenId = parsedLog.args.tokenId.toString();
          console.log('🎫 Token ID:', tokenId);
          break;
        }
      } catch (e) {
        // Ignore logs that can't be parsed
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
    
    const contract = await getNFTContract();
    
    // Call manufacturerToDistributor function
    const tx = await contract.manufacturerToDistributor(tokenIds, distributorAddress);
    
    console.log('⏳ Transaction submitted:', tx.hash);
    
    const receipt = await tx.wait();
    
    console.log('✅ Transfer confirmed:', receipt);
    
    return {
      success: true,
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
    console.error('❌ Error transferring NFT:', error);
    throw error;
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

    const contract = await getNFTContract();

    // Call manufacturerTransferToDistributor(tokenIds, amounts, distributor)
    const tx = await contract.manufacturerTransferToDistributor(tokenIds, amounts, distributorAddress);

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
    throw error;
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


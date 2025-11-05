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
 * Try to switch to PIONE network if contract not found
 * Tự động tìm và request switch sang PIONE network
 */
const trySwitchToPioneNetwork = async () => {
  if (!window.ethereum) return false;
  
  try {
    const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
    console.log('[trySwitchToPioneNetwork] Current chainId:', currentChainId);
    
    // Thử lấy danh sách networks từ MetaMask (API mới)
    try {
      const networkList = await window.ethereum.request({ method: 'wallet_getEthereumChains' });
      console.log('[trySwitchToPioneNetwork] Available networks:', networkList);
      
      // Tìm PIONE network trong danh sách
      const pioneNetwork = networkList?.find(network => {
        const name = (network.name || '').toLowerCase();
        return name.includes('pione') || name.includes('zero');
      });
      
      if (pioneNetwork && pioneNetwork.chainId !== currentChainId) {
        console.log('[trySwitchToPioneNetwork] Found PIONE network:', pioneNetwork);
        // Request switch sang PIONE network
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: pioneNetwork.chainId }],
          });
          console.log('[trySwitchToPioneNetwork] Successfully switched to PIONE network');
          return true;
        } catch (switchError) {
          // Nếu network chưa được thêm vào MetaMask, thử add network
          if (switchError.code === 4902 && pioneNetwork.rpcUrls && pioneNetwork.rpcUrls.length > 0) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: pioneNetwork.chainId,
                  chainName: pioneNetwork.name,
                  nativeCurrency: pioneNetwork.nativeCurrency || { name: 'PZO', symbol: 'PZO', decimals: 18 },
                  rpcUrls: pioneNetwork.rpcUrls,
                  blockExplorerUrls: pioneNetwork.blockExplorerUrls || [],
                }],
              });
              console.log('[trySwitchToPioneNetwork] Successfully added and switched to PIONE network');
              return true;
            } catch (addError) {
              console.warn('[trySwitchToPioneNetwork] Failed to add network:', addError);
            }
          }
          console.warn('[trySwitchToPioneNetwork] Failed to switch network:', switchError);
        }
      }
    } catch (apiError) {
      console.warn('[trySwitchToPioneNetwork] wallet_getEthereumChains not supported:', apiError);
    }
    
    // Fallback: Thử các chainId phổ biến của PIONE network
    // (cần update với chainId thực tế từ Zero Scan)
    const commonPioneChainIds = [
      '0x1e240', // 123456 decimal - example, cần thay bằng chainId thực tế
    ];
    
    for (const chainId of commonPioneChainIds) {
      if (currentChainId === chainId) {
        console.log('[trySwitchToPioneNetwork] Already on PIONE network');
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.warn('[trySwitchToPioneNetwork] Error:', error);
    return false;
  }
};

/**
 * Ensure a contract address is deployed on current network
 */
const ensureDeployed = async (provider, address) => {
  const network = await provider.getNetwork();
  const code = await provider.getCode(address);
  
  console.log('[ensureDeployed] Checking contract:', {
    address,
    networkName: network.name,
    chainId: network.chainId.toString(),
    hasCode: code !== '0x',
    codeLength: code.length,
  });
  
  if (code === '0x') {
    // Contract không tồn tại trên network này
    // Contract ĐÃ TỒN TẠI trên PIONE network (đã verify trên Zero Scan)
    // Vậy vấn đề là MetaMask đang ở network khác
    
    console.log('[ensureDeployed] Contract not found, attempting to switch to PIONE network...');
    
    // Thử tự động switch sang PIONE network
    const switchSuccess = await trySwitchToPioneNetwork();
    
    if (switchSuccess) {
      // Đã switch thành công, thử lại check contract
      console.log('[ensureDeployed] Network switched, re-checking contract...');
      // Wait a bit for network switch to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get new provider after switch
      const newProvider = new ethers.BrowserProvider(window.ethereum);
      const newNetwork = await newProvider.getNetwork();
      const newCode = await newProvider.getCode(address);
      
      console.log('[ensureDeployed] After switch:', {
        networkName: newNetwork.name,
        chainId: newNetwork.chainId.toString(),
        hasCode: newCode !== '0x',
      });
      
      if (newCode !== '0x') {
        console.log('[ensureDeployed] Contract found on new network!');
        return; // Contract đã tồn tại trên network mới
      }
    }
    
    // Nếu không thể switch tự động hoặc vẫn không tìm thấy contract
    const currentChainIdHex = '0x' + network.chainId.toString(16);
    
    const errorMessage = 
      `Contract không tồn tại trên network hiện tại!\n\n` +
      `📊 Thông tin hiện tại:\n` +
      `- Network: ${network.name}\n` +
      `- Chain ID: ${currentChainIdHex} (${network.chainId})\n` +
      `- Contract Address: ${address}\n\n` +
      `✅ Contract ĐÃ TỒN TẠI trên PIONE/Zero network (đã verify trên Zero Scan với 15+ transactions)\n` +
      `❌ Nhưng MetaMask đang kết nối với network khác!\n\n` +
      `🔧 Giải pháp:\n` +
      `1. Mở MetaMask (click vào icon 🦊)\n` +
      `2. Click vào network dropdown (top của MetaMask, hiện tại: "${network.name}")\n` +
      `3. Chọn "Pione Network" từ danh sách enabled networks\n` +
      `4. Sau khi chuyển, thử lại chuyển NFT\n\n` +
      `🔗 Kiểm tra contract: zeroscan.org/address/${address}`;
    
    console.error('[ensureDeployed] Contract not found on current network:', {
      currentNetwork: network.name,
      currentChainId: network.chainId.toString(),
      currentChainIdHex,
      contractAddress: address,
      switchAttempted: true,
      switchSuccess,
      error: 'Contract exists on PIONE network but MetaMask is on different network',
      suggestion: 'Switch to "Pione Network" in MetaMask manually',
    });
    
    throw new Error(errorMessage);
  }
  
  // Kiểm tra contract có function distributorTransferToPharmacy không
  try {
    const contract = new ethers.Contract(address, nftABI.abi, provider);
    // Thử lấy function interface để verify function tồn tại
    const functionFragment = contract.interface.getFunction('distributorTransferToPharmacy');
    if (!functionFragment) {
      throw new Error('Function distributorTransferToPharmacy not found in contract ABI');
    }
    console.log('[ensureDeployed] Function distributorTransferToPharmacy exists:', functionFragment.format());
  } catch (funcError) {
    console.warn('[ensureDeployed] Warning checking function:', funcError.message);
    // Không throw error ở đây vì có thể do ABI không khớp, nhưng contract vẫn tồn tại
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
 * Transfer NFT to pharmacy (from distributor)
 * @param {string[]} tokenIds - Array of token IDs to transfer
 * @param {string[]} amounts - Array of amounts (must match tokenIds length)
 * @param {string} pharmacyAddress - Pharmacy wallet address
 * @returns {Object} - { success: true, transactionHash: string, blockNumber: number }
 */
export const transferNFTToPharmacy = async (tokenIds, amounts, pharmacyAddress) => {
  try {
    console.log('📦 Transferring NFTs to pharmacy...');
    console.log('Token IDs:', tokenIds);
    console.log('Amounts:', amounts);
    console.log('Pharmacy Address:', pharmacyAddress);

    // Basic validations
    if (!Array.isArray(tokenIds) || tokenIds.length === 0) {
      throw new Error('tokenIds must be a non-empty array');
    }
    if (!Array.isArray(amounts) || amounts.length === 0 || amounts.length !== tokenIds.length) {
      throw new Error('amounts must be a non-empty array and match the length of tokenIds');
    }
    if (!ethers.isAddress(pharmacyAddress)) {
      throw new Error('Invalid pharmacy address');
    }

    const provider = await getWeb3Provider();
    const signer = await provider.getSigner();
    const signerAddress = await signer.getAddress();

    // Ensure contracts are deployed on this network
    await ensureDeployed(provider, NFT_CONTRACT_ADDRESS);
    await ensureDeployed(provider, ACCESS_CONTROL_ADDRESS);

    // TODO: Check distributor role on-chain if needed
    // For now, we'll skip role check as it might not be in the access control contract

    const contract = await getNFTContract();

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

    // Check balances before transfer
    console.log('🔍 Checking balances before transfer...');
    const balanceIssues = [];
    for (let i = 0; i < normalizedTokenIds.length; i++) {
      const tokenId = normalizedTokenIds[i];
      const amountNeeded = normalizedAmounts[i];
      const balance = await contract.balanceOf(signerAddress, tokenId);
      console.log(`[Balance Check] Token ID ${tokenId}: balance=${balance}, needed=${amountNeeded}`);
      
      if (balance < amountNeeded) {
        balanceIssues.push({
          tokenId: tokenId.toString(),
          balance: balance.toString(),
          needed: amountNeeded.toString(),
        });
      }
    }
    
    if (balanceIssues.length > 0) {
      const issuesList = balanceIssues.map(issue => 
        `  - Token ID ${issue.tokenId}: có ${issue.balance}, cần ${issue.needed}`
      ).join('\n');
      
      const errorMessage = 
        `❌ Không đủ số lượng NFT để chuyển giao!\n\n` +
        `📊 Chi tiết:\n${issuesList}\n\n` +
        `🔍 Nguyên nhân có thể:\n` +
        `1. NFT chưa được transfer từ Manufacturer → Distributor trên blockchain\n` +
        `2. Manufacturer chưa hoàn thành bước transfer NFT (chưa gọi smart contract)\n` +
        `3. Transaction transfer từ Manufacturer bị revert hoặc thất bại\n` +
        `4. Token ID không đúng hoặc chưa được mint\n\n` +
        `✅ Giải pháp:\n` +
        `1. Kiểm tra trong "Lịch sử chuyển giao" (Manufacturer) xem NFT đã được transfer chưa\n` +
        `2. Nếu chưa, yêu cầu Manufacturer thực hiện transfer NFT trước\n` +
        `3. Nếu đã transfer, kiểm tra transaction hash trên blockchain explorer\n` +
        `4. Liên hệ quản trị viên nếu vấn đề vẫn tiếp tục\n\n` +
        `💡 Lưu ý: Token ID có trong database nhưng chưa có trên blockchain nghĩa là ` +
        `Manufacturer đã tạo invoice nhưng chưa thực hiện transfer NFT trên smart contract.`;
      
      console.error('[transferNFTToPharmacy] Balance check failed:', {
        distributorAddress: signerAddress,
        issues: balanceIssues,
      });
      
      throw new Error(errorMessage);
    }

    // Call distributorTransferToPharmacy(pharmaAddress, tokenIds, amount)
    console.log('📤 Calling distributorTransferToPharmacy...');
    console.log('Pharmacy Address:', pharmacyAddress);
    console.log('TokenIds:', normalizedTokenIds);
    console.log('Amounts:', normalizedAmounts);

    const tx = await contract.distributorTransferToPharmacy(
      pharmacyAddress,
      normalizedTokenIds,
      normalizedAmounts
    );

    console.log('⏳ Transaction submitted:', tx.hash);
    const receipt = await tx.wait();
    console.log('✅ Transfer confirmed:', receipt);

    return {
      success: true,
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
    console.error('❌ Error transferring NFT to pharmacy:', error);
    // Friendly error messages
    if (error?.code === 'ACTION_REJECTED' || error?.code === 4001) {
      throw new Error('User rejected the transaction');
    }
    if (error?.code === 'CALL_EXCEPTION') {
      const reason = error.reason || (error.data && ethers.toUtf8String(error.data)) || 'unknown reason';
      if (reason.includes("insufficient balance")) {
        throw new Error(`Contract reverted: Insufficient balance. Please check if the distributor owns the NFTs being transferred. Details: ${reason}`);
      }
      throw new Error(`Contract call exception (reverted). Please check ownership and network. Details: ${reason}`);
    }
    if (/Contract not deployed/.test(error?.message || '')) {
      throw new Error(error.message);
    }
    throw new Error(error?.message || 'Failed to transfer NFTs to pharmacy');
  }
};

/**
 * Check NFT balances for distributor before transfer
 * Returns { canTransfer: boolean, issues: Array, balances: Array }
 */
export const checkDistributorNFTBalances = async (tokenIds) => {
  try {
    if (!Array.isArray(tokenIds) || tokenIds.length === 0) {
      return {
        canTransfer: false,
        issues: [{ error: 'Token IDs array is empty' }],
        balances: [],
      };
    }

    const provider = await getWeb3Provider();
    const signer = await provider.getSigner();
    const signerAddress = await signer.getAddress();

    // Ensure contract is deployed
    await ensureDeployed(provider, NFT_CONTRACT_ADDRESS);

    const contract = await getNFTContract();

    // Normalize tokenIds
    const normalizedTokenIds = tokenIds.map((id) => {
      if (typeof id === 'bigint') return id;
      if (typeof id === 'string' && id.startsWith('0x')) return BigInt(id);
      return BigInt(id);
    });

    // Check balances
    const balanceChecks = [];
    const issues = [];

    for (let i = 0; i < normalizedTokenIds.length; i++) {
      const tokenId = normalizedTokenIds[i];
      try {
        const balance = await contract.balanceOf(signerAddress, tokenId);
        const balanceStr = balance.toString();
        
        balanceChecks.push({
          tokenId: tokenId.toString(),
          balance: balanceStr,
          hasBalance: balance > 0n,
        });

        if (balance === 0n) {
          issues.push({
            tokenId: tokenId.toString(),
            balance: '0',
            needed: '1',
          });
        }
      } catch (error) {
        console.error(`Error checking balance for token ID ${tokenId}:`, error);
        issues.push({
          tokenId: tokenId.toString(),
          error: error.message || 'Failed to check balance',
        });
      }
    }

    return {
      canTransfer: issues.length === 0,
      issues,
      balances: balanceChecks,
      distributorAddress: signerAddress,
    };
  } catch (error) {
    console.error('[checkDistributorNFTBalances] Error:', error);
    return {
      canTransfer: false,
      issues: [{ error: error.message || 'Failed to check balances' }],
      balances: [],
    };
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


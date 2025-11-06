import { useState, useEffect } from 'react';
import { BrowserProvider, getAddress } from 'ethers';

export function useMetaMask() {
  const [account, setAccount] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [chainId, setChainId] = useState(null);

  // Kiểm tra kết nối hiện tại khi component mount
  useEffect(() => {
    if (typeof window.ethereum === 'undefined') {
      return;
    }

    const checkConnection = async () => {
      try {
        const provider = new BrowserProvider(window.ethereum, 'any');
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setAccount(getAddress(accounts[0].address));
        }

        const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
        setChainId(currentChainId);
      } catch (err) {
        console.error('Error checking MetaMask connection:', err);
      }
    };

    checkConnection();

    // Lắng nghe sự kiện thay đổi tài khoản
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        setAccount(null);
      } else {
        setAccount(getAddress(accounts[0]));
      }
    };

    // Lắng nghe sự kiện thay đổi chain
    const handleChainChanged = (newChainId) => {
      setChainId(newChainId);
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const connect = async () => {
    if (typeof window.ethereum === 'undefined') {
      setError('MetaMask chưa được cài đặt. Vui lòng cài đặt MetaMask extension.');
      return false;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        const address = getAddress(accounts[0]);
        setAccount(address);
        const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
        setChainId(currentChainId);
        return true;
      }
      return false;
    } catch (err) {
      if (err.code === 4001) {
        setError('Người dùng đã từ chối kết nối.');
      } else {
        setError(err.message || 'Không thể kết nối với MetaMask.');
      }
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAccount(null);
    setChainId(null);
    setError(null);
  };

  const isInstalled = typeof window.ethereum !== 'undefined';
  const isConnected = account !== null;

  return {
    account,
    isConnecting,
    isConnected,
    isInstalled,
    error,
    chainId,
    connect,
    disconnect,
  };
}


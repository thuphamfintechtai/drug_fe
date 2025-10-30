import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { connectWallet, isWalletConnected, getCurrentWalletAddress, isMetaMaskInstalled } from '../utils/web3Helper';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [walletAddress, setWalletAddress] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  // Check if wallet is already connected on mount
  useEffect(() => {
    const checkWalletConnection = async () => {
      try {
        const connected = await isWalletConnected();
        if (connected) {
          const address = await getCurrentWalletAddress();
          setWalletAddress(address);
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    };

    checkWalletConnection();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        } else {
          setWalletAddress(null);
        }
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, []);

  const handleConnectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      alert('Vui lòng cài đặt MetaMask để kết nối ví!');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    setIsConnecting(true);
    try {
      const result = await connectWallet();
      setWalletAddress(result.address);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Không thể kết nối ví. Vui lòng thử lại!');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCopyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 11.09a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3a1 1 0 00-.787 0l-7 3a1 1 0 000 1.838l7 3z" />
            </svg>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
            DrugTrace
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {/* Wallet Connect Button */}
          {walletAddress ? (
            <div className="relative group">
              <button
                onClick={handleCopyAddress}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 text-white hover:from-cyan-600 hover:to-teal-700 transition-all shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span className="font-medium text-sm">{formatAddress(walletAddress)}</span>
                {showCopied && (
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
                    Đã sao chép!
                  </span>
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnectWallet}
              disabled={isConnecting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 text-white hover:from-cyan-600 hover:to-teal-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConnecting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="font-medium text-sm">Đang kết nối...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <span className="font-medium text-sm">Kết nối ví</span>
                </>
              )}
            </button>
          )}

          {!isAuthenticated && (
            <>
              <Link 
                to="/login" 
                className="px-4 py-2 rounded-xl border-2 border-cyan-500 text-cyan-700 hover:bg-cyan-50 transition-colors font-medium text-sm"
              >
                Đăng nhập
              </Link>
              <Link 
                to="/register" 
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 text-white hover:from-cyan-600 hover:to-teal-700 transition-all shadow-md hover:shadow-lg font-medium text-sm"
              >
                Đăng ký
              </Link>
            </>
          )}

          {isAuthenticated && (
            <>
              {user?.role === 'system_admin' && (
                <Link 
                  to="/admin" 
                  className="px-4 py-2 rounded-xl border-2 border-cyan-500 text-cyan-700 hover:bg-cyan-50 transition-colors font-medium text-sm"
                >
                  Admin
                </Link>
              )}
              {user?.role === 'pharma_company' && (
                <Link 
                  to="/manufacturer" 
                  className="px-4 py-2 rounded-xl border-2 border-cyan-500 text-cyan-700 hover:bg-cyan-50 transition-colors font-medium text-sm"
                >
                  Nhà sản xuất
                </Link>
              )}
              {user?.role === 'distributor' && (
                <Link 
                  to="/distributor" 
                  className="px-4 py-2 rounded-xl border-2 border-cyan-500 text-cyan-700 hover:bg-cyan-50 transition-colors font-medium text-sm"
                >
                  Nhà phân phối
                </Link>
              )}
              {user?.role === 'pharmacy' && (
                <Link 
                  to="/pharmacy" 
                  className="px-4 py-2 rounded-xl border-2 border-cyan-500 text-cyan-700 hover:bg-cyan-50 transition-colors font-medium text-sm"
                >
                  Nhà thuốc
                </Link>
              )}
              {user?.role === 'user' && (
                <Link 
                  to="/user" 
                  className="px-4 py-2 rounded-xl border-2 border-cyan-500 text-cyan-700 hover:bg-cyan-50 transition-colors font-medium text-sm"
                >
                  Tài khoản
                </Link>
              )}
              <button 
                onClick={logout} 
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg font-medium text-sm"
              >
                Đăng xuất
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

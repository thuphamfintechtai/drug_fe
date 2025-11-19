/* eslint-disable no-undef */
import { useState, useEffect } from "react";
import { BrowserProvider, getAddress } from "ethers";

export const useMetaMaskConnect = () => {
  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (window.ethereum) {
      const ethProvider = new BrowserProvider(window.ethereum, "any");
      setProvider(ethProvider);

      ethProvider.listAccounts().then((accs) => {
        if (accs.length) {
          setAccount(getAddress(accs[0]));
        }
      });

      window.ethereum
        .request({ method: "eth_chainId" })
        .then((id) => setChainId(id));

      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          setAccount(null);
        } else {
          setAccount(getAddress(accounts[0]));
        }
      };

      const handleChainChanged = (chainId) => {
        setChainId(chainId);
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    } else {
      setError("Không tìm thấy MetaMask. Vui lòng cài extension MetaMask.");
    }
  }, []);

  const connectWallet = async () => {
    setError(null);
    if (!window.ethereum) {
      setError("MetaMask chưa được cài đặt.");
      return;
    }
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      if (accounts.length) {
        setAccount(getAddress(accounts[0]));
      }
      const cid = await window.ethereum.request({ method: "eth_chainId" });
      setChainId(cid);
    } catch (err) {
      setError(err.message);
    }
  };

  const disconnect = () => {
    setAccount(null);
  };

  const networkNameMap = {
    "0x1": "Ethereum Mainnet",
    "0x5": "Goerli Testnet",
    "0xaa36a7": "Sepolia Testnet",
    "0x38": "BNB Smart Chain",
    "0x61": "BSC Testnet",
    "0x89": "Polygon",
    "0x13881": "Polygon Mumbai",
  };

  const copyAddress = async () => {
    if (!account) {
      return;
    }
    try {
      await navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // Do nothing
    }
  };
  return {
    provider,
    account,
    chainId,
    error,
    copied,
    connectWallet,
    disconnect,
    copyAddress,
  };
};

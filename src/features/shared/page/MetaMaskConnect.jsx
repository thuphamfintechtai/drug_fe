/* eslint-disable no-undef */
import React, { useEffect, useState } from "react";
import { BrowserProvider, getAddress } from "ethers";

function shortAddress(addr = "") {
  if (!addr) {
    return "";
  }
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

export default function MetaMaskConnect() {
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

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span>🦊</span>
            Kết nối MetaMask
          </h3>
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full border ${
              account
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}
          >
            {account ? "Đã kết nối" : "Chưa kết nối"}
          </span>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4 text-base">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Tài khoản</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-semibold text-gray-800">
                {account ? shortAddress(account) : "Chưa kết nối"}
              </span>
              {account && (
                <button
                  onClick={copyAddress}
                  className={`px-3 py-1.5 text-sm rounded-md border transition ${
                    copied
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {copied ? "Đã sao chép" : "Sao chép"}
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-600">Mạng</span>
            <span className="font-medium text-gray-800">
              {chainId
                ? `${networkNameMap[chainId] || "Chain"} (${chainId})`
                : "—"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-600">Ví</span>
            <span className="font-medium text-gray-800">
              {window.ethereum?.isMetaMask
                ? "MetaMask"
                : window.ethereum
                ? "Wallet"
                : "Không phát hiện ví"}
            </span>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end">
          {!account ? (
            <button
              onClick={connectWallet}
              className="px-5 py-3 rounded-lg !text-white bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 shadow-sm text-base"
            >
              Kết nối ví
            </button>
          ) : (
            <button
              onClick={disconnect}
              className="px-5 py-3 rounded-lg text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 text-base"
            >
              Ngắt kết nối
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

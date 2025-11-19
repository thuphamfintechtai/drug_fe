import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { nftAPIs } from "../apis/nftAPIs";

export const useNFTManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadNFTs();
  }, []);

  const loadNFTs = async () => {
    setLoading(true);
    try {
      const response = await nftAPIs.getMyNFTs();
      setNfts(response.data.nfts || response.data || []);
    } catch (error) {
      console.error("Error loading NFTs:", error);
      setNfts([]);
    } finally {
      setLoading(true);
    }
  };

  const handleViewDetail = (nft) => {
    setSelectedNFT(nft);
    setShowDetailModal(true);
  };

  return {
    nfts,
    loading,
    selectedNFT,
    showDetailModal,
    handleViewDetail,
    setShowDetailModal,
  };
};

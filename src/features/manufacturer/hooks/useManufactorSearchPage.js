/* eslint-disable no-undef */
import { useState } from "react";
import { useLocation } from "react-router-dom";

export const useManufactorSearchPage = () => {
  const location = useLocation();
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Mock data
  const mockManufacturers = [
    {
      _id: "1",
      name: "BIDIPHAR",
      contactEmail: "contact@bidiphar.com",
      country: "Việt Nam",
    },
    {
      _id: "2",
      name: "Traphaco",
      contactEmail: "info@traphaco.com",
      country: "Việt Nam",
    },
    {
      _id: "3",
      name: "Imexpharm",
      contactEmail: "sales@imexpharm.com",
      country: "Việt Nam",
    },
    {
      _id: "4",
      name: "Pharmedic",
      contactEmail: "contact@pharmedic.vn",
      country: "Việt Nam",
    },
    {
      _id: "5",
      name: "Hậu Giang Pharma",
      contactEmail: "info@hgp.com.vn",
      country: "Việt Nam",
    },
  ];

  const handleSearch = async () => {
    if (!keyword.trim()) {
      setError("Vui lòng nhập từ khóa tìm kiếm");
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      // TODO: Replace with actual API call
      // const res = await getManufactorsByName(keyword);
      // if (res.success) {
      //   setResults(res.data.manufactors || []);
      // } else {
      //   setError('Không thể tìm kiếm nhà sản xuất');
      //   setResults([]);
      // }

      // Using mock data for now - filter by keyword
      setTimeout(() => {
        const filteredResults = mockManufacturers.filter(
          (m) =>
            m.name.toLowerCase().includes(keyword.toLowerCase()) ||
            m.contactEmail.toLowerCase().includes(keyword.toLowerCase())
        );
        setResults(filteredResults);
        setLoading(false);
      }, 500);
    } catch (err) {
      setError("Lỗi khi tìm kiếm");
      setResults([]);
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };
};

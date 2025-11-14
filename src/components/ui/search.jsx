import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

export function Search({
  searchInput,
  setSearchInput,
  handleSearch,
  handleClearSearch,
  placeholder = "Tìm theo tên thuốc, mã...",
  data = [],
  getSearchText = (item) => item?.invoiceNumber || item?.notes || "",
  matchFunction = null,
  getDisplayText = null,
  enableAutoSearch = true,
  debounceMs = 500,
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [suggestionPosition, setSuggestionPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (searchInput && data.length > 0 && isInputFocused) {
      const searchLower = searchInput.toLowerCase().trim();
      const filtered = data
        .filter((item) => {
          if (matchFunction) {
            return matchFunction(item, searchLower);
          }
          const searchText = getSearchText(item).toLowerCase();
          return searchText.includes(searchLower);
        })
        .slice(0, 5);
      setFilteredSuggestions(filtered);
      if (filtered.length > 0) {
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchInput, data, getSearchText, matchFunction, isInputFocused]);

  const prevSearchInputRef = useRef(searchInput);

  useEffect(() => {
    const isUserInput = prevSearchInputRef.current !== searchInput;
    prevSearchInputRef.current = searchInput;

    if (
      enableAutoSearch &&
      handleSearch &&
      isUserInput &&
      searchInput !== undefined
    ) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        if (handleSearch) {
          handleSearch(null, false);
        }
      }, debounceMs);

      return () => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
      };
    }
  }, [searchInput, enableAutoSearch, debounceMs, handleSearch]);

  useEffect(() => {
    if (showSuggestions && inputRef.current) {
      const updatePosition = () => {
        if (inputRef.current) {
          const rect = inputRef.current.getBoundingClientRect();
          setSuggestionPosition({
            top: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width,
          });
        }
      };

      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
      updatePosition();

      return () => {
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
      };
    }
  }, [showSuggestions]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
        setIsInputFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSuggestionClick = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    const searchText = getSearchText(item);
    setShowSuggestions(false);
    setIsInputFocused(false);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setSearchInput(searchText);

    if (handleSearch) {
      handleSearch(searchText);
    }
  };

  return (
    <div className="flex-1 relative">
      <label className="block text-sm text-[#003544]/70 mb-1">Tìm kiếm</label>
      <div className="relative" ref={searchRef}>
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
            />
          </svg>
        </span>
        <input
          ref={inputRef}
          type="text"
          value={searchInput}
          onChange={(e) => {
            const value = e.target.value;
            setSearchInput(value);
            if (inputRef.current) {
              const rect = inputRef.current.getBoundingClientRect();
              setSuggestionPosition({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width,
              });
            }
            if (value && data.length > 0) {
              setIsInputFocused(true);
            }
          }}
          onFocus={() => {
            setIsInputFocused(true);
            if (inputRef.current) {
              const rect = inputRef.current.getBoundingClientRect();
              setSuggestionPosition({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width,
              });
            }
            if (filteredSuggestions.length > 0 && searchInput) {
              setShowSuggestions(true);
            }
          }}
          onBlur={() => {
            setTimeout(() => {
              setIsInputFocused(false);
              if (!suggestionsRef.current?.contains(document.activeElement)) {
                setShowSuggestions(false);
              }
            }, 300);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              setShowSuggestions(false);
              setIsInputFocused(false);
              if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
              }
              handleSearch();
            } else if (e.key === "Escape") {
              setShowSuggestions(false);
              setIsInputFocused(false);
            }
          }}
          placeholder={placeholder}
          className="w-full h-12 pl-11 pr-40 rounded-full border border-gray-200 bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#48cae4] transition"
        />
        {searchInput && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute right-24 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
            title="Xóa tìm kiếm"
          >
            ✕
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            setShowSuggestions(false);
            setIsInputFocused(false);
            handleSearch();
          }}
          className="absolute right-1 top-1 bottom-1 px-6 rounded-full bg-secondary hover:bg-primary !text-white font-medium transition"
        >
          Tìm Kiếm
        </button>
        {showSuggestions &&
          filteredSuggestions.length > 0 &&
          typeof document !== "undefined" &&
          createPortal(
            <div
              ref={suggestionsRef}
              style={{
                position: "absolute",
                top: `${suggestionPosition.top + 8}px`,
                left: `${suggestionPosition.left}px`,
                width: `75%`,
                zIndex: 99999,
                border: "1px solid #077ca3",
                borderBottom: "4px solid #077ca3",
              }}
              className="bg-white border border-gray-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto"
            >
              {filteredSuggestions.map((item, index) => {
                const searchText = getSearchText(item);
                const displayText = getDisplayText
                  ? getDisplayText(item, searchInput.toLowerCase().trim())
                  : searchText;

                return (
                  <button
                    key={index}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                    }}
                    onClick={(e) => handleSuggestionClick(e, item)}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 transition cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-slate-800">
                      {displayText}
                    </div>
                  </button>
                );
              })}
            </div>,
            document.body
          )}
      </div>
    </div>
  );
}

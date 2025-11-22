import DashboardLayout from "../../shared/components/DashboardLayout";
import { navigationItems } from "../constants/navigationItems";
import { useDistributions } from "../hooks/useDistributions.jsx";
import { Spin, Table } from "antd";
import { Search } from "../../shared/components/ui/search";
import { CardUI } from "../../shared/components/ui/cardUI";

export default function Distributions() {
  const { loading, filteredData, searchText, setSearchText, columns, data } =
    useDistributions();

  const handleSearch = (searchValue = null) => {
    const term = (searchValue !== null ? searchValue : searchText)
      .trim()
      .toLowerCase();
    setSearchText(term);
  };

  const handleClearSearch = () => {
    setSearchText("");
  };

  return (
    <DashboardLayout navigationItems={navigationItems}>
      <CardUI
        title="Đơn hàng nhận từ Nhà sản xuất"
        subtitle="Quản lý và xác nhận các đơn hàng nhận từ nhà sản xuất dược phẩm"
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 text-[#00a3c4]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
        }
      />

      {/* Search */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1">
          <Search
            searchInput={searchText}
            setSearchInput={setSearchText}
            handleSearch={handleSearch}
            handleClearSearch={handleClearSearch}
            placeholder="Tìm kiếm theo mã đơn, tên thuốc, mã xác minh..."
            data={data}
            getSearchText={(item) => {
              const drug =
                item.drug || item.proofOfProduction?.drug || item.nftInfo?.drug;
              const drugName =
                drug?.name || drug?.tradeName || item.drugName || "";
              return item.code || drugName || item.verificationCode || "";
            }}
            matchFunction={(item, searchLower) => {
              const drug =
                item.drug || item.proofOfProduction?.drug || item.nftInfo?.drug;
              const drugName = (
                drug?.name ||
                drug?.tradeName ||
                item.drugName ||
                ""
              ).toLowerCase();
              const code = (item.code || "").toLowerCase();
              const verificationCode = (
                item.verificationCode || ""
              ).toLowerCase();
              return (
                code.includes(searchLower) ||
                drugName.includes(searchLower) ||
                verificationCode.includes(searchLower)
              );
            }}
            getDisplayText={(item, searchLower) => {
              const drug =
                item.drug || item.proofOfProduction?.drug || item.nftInfo?.drug;
              const drugName = (
                drug?.name ||
                drug?.tradeName ||
                item.drugName ||
                ""
              ).toLowerCase();
              const code = (item.code || "").toLowerCase();
              const verificationCode = (
                item.verificationCode || ""
              ).toLowerCase();
              if (code.includes(searchLower)) {
                return item.code || "";
              }
              if (drugName.includes(searchLower)) {
                return drug?.name || drug?.tradeName || item.drugName || "";
              }
              if (verificationCode.includes(searchLower)) {
                return item.verificationCode || "";
              }
              return (
                item.code ||
                drug?.name ||
                drug?.tradeName ||
                item.drugName ||
                ""
              );
            }}
            enableAutoSearch={false}
          />
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="_id"
            pagination={{ pageSize: 10, showSizeChanger: true }}
            scroll={{ x: 1000 }}
          />
        </Spin>
      </div>
    </DashboardLayout>
  );
}

import { motion } from "framer-motion";
import DashboardLayout from "../../shared/components/DashboardLayout";
import TruckLoader from "../../shared/components/TruckLoader";
import { navigationItems } from "../constants/navigationItems";
import { useContracts } from "../hooks/useContracts";
import { Search } from "../../shared/components/ui/search";
import { CardUI } from "../../shared/components/ui/cardUI";
import { useNavigate } from "react-router-dom";

export default function Contracts() {
  const navigate = useNavigate();
  const { loading, filteredContracts, searchText, setSearchText, columns, contracts } =
    useContracts();

  const fadeUp = {
    hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

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
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="w-full max-w-2xl">
            <TruckLoader height={72} progress={50} showTrack />
          </div>
          <div className="text-lg text-slate-600 mt-6">Đang tải dữ liệu...</div>
        </div>
      ) : (
        <div className="space-y-6">
          <CardUI
            title="Quản lý Hợp đồng với Nhà thuốc"
            subtitle="Tạo và quản lý các hợp đồng hợp tác với nhà thuốc"
            content={{
              title: "Quy trình quản lý hợp đồng",
              step1: {
                title: "Tạo hợp đồng mới",
                description:
                  "Chọn nhà thuốc và tải lên file hợp đồng đã ký kết",
              },
              step2: {
                title: "Lưu trữ trên blockchain",
                description:
                  "Hash của file hợp đồng được lưu trữ bất biến trên blockchain",
              },
              step3: {
                title: "Quản lý và theo dõi",
                description:
                  "Theo dõi trạng thái và thời hạn của các hợp đồng đang hoạt động",
              },
              step4: {
                title: "Xác minh tính toàn vẹn",
                description:
                  "Xác minh file hợp đồng chưa bị thay đổi thông qua hash trên blockchain",
              },
            }}
          />

          {/* Search & Create Button */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
          >
            <div className="flex-1">
              <div className="bg-white rounded-2xl border border-card-primary shadow-sm p-6">
                <Search
                  searchInput={searchText}
                  setSearchInput={setSearchText}
                  handleSearch={handleSearch}
                  handleClearSearch={handleClearSearch}
                  placeholder="Tìm kiếm theo mã hợp đồng, tên file..."
                  data={contracts || filteredContracts}
                  getSearchText={(item) => item._id || item.contractFileName || ""}
                  matchFunction={(item, searchLower) => {
                    const id = (item._id || "").toLowerCase();
                    const fileName = (item.contractFileName || "").toLowerCase();
                    return id.includes(searchLower) || fileName.includes(searchLower);
                  }}
                  getDisplayText={(item) => item.contractFileName || item._id}
                  enableAutoSearch={false}
                />
              </div>
            </div>
            <button
              onClick={() => navigate("/distributor/contracts/create")}
              className="px-6 py-3 bg-white border-2 border-[#3db6d9] text-[#3db6d9] rounded-2xl font-semibold hover:bg-[#3db6d9] hover:text-white transition-all duration-200 hover:shadow-md hover:shadow-[#3db6d9]/40 whitespace-nowrap h-[60px] flex items-center justify-center"
            >
              + Tạo Hợp đồng mới
            </button>
          </motion.div>

          {/* Table */}
          <motion.div
            className="bg-white rounded-2xl border border-card-primary shadow-sm overflow-hidden"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
              <h2 className="text-xl font-bold text-slate-800">
                Danh sách hợp đồng
              </h2>
            </div>

            {filteredContracts.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-5xl mb-4">📄</div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  Chưa có hợp đồng nào
                </h3>
                <p className="text-slate-600 mb-6">
                  {searchText
                    ? "Không tìm thấy hợp đồng phù hợp với từ khóa tìm kiếm"
                    : "Bắt đầu bằng cách tạo hợp đồng mới với nhà thuốc"}
                </p>
                {!searchText && (
                  <button
                    onClick={() => navigate("/distributor/contracts/create")}
                    className="px-6 py-3 bg-[#3db6d9] text-white rounded-full font-semibold hover:bg-[#2da5c9] transition-all duration-200 hover:shadow-md"
                  >
                    + Tạo Hợp đồng đầu tiên
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {columns.map((col, index) => (
                        <th
                          key={index}
                          className="px-6 py-4 text-left text-sm font-semibold text-gray-700"
                          style={{
                            textAlign: col.align || "left",
                            width: col.width || "auto",
                          }}
                        >
                          {col.title}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredContracts.map((record, rowIndex) => (
                      <tr
                        key={record._id || rowIndex}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {columns.map((col, colIndex) => (
                          <td
                            key={colIndex}
                            className="px-6 py-4"
                            style={{ textAlign: col.align || "left" }}
                          >
                            {col.render
                              ? col.render(record[col.dataIndex], record, rowIndex)
                              : record[col.dataIndex] || "N/A"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>

          {/* Pagination info */}
          {filteredContracts.length > 0 && (
            <div className="text-center text-sm text-slate-600">
              Hiển thị {filteredContracts.length} hợp đồng
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
import { motion } from "framer-motion";
import DashboardLayout from "../../shared/components/DashboardLayout";
import { navigationItems } from "../constants/constant";
import { usePharmacyContracts } from "../hooks/useContracts";
import { Spin, Table } from "antd";
import { Search } from "../../shared/components/ui/search";
import { CardUI } from "../../shared/components/ui/cardUI";

export default function PharmacyContracts() {
  const { loading, filteredContracts, searchText, setSearchText, columns } =
    usePharmacyContracts();

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
      <motion.div variants={fadeUp} initial="hidden" animate="show">
        <CardUI
          title="Hợp đồng với Nhà phân phối"
          subtitle="Xem và xác nhận các hợp đồng từ nhà phân phối"
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          }
        />
      </motion.div>

      {/* Search */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="flex items-center gap-3 mb-6"
      >
        <div className="flex-1">
          <Search
            searchInput={searchText}
            setSearchInput={setSearchText}
            handleSearch={handleSearch}
            handleClearSearch={handleClearSearch}
            placeholder="Tìm kiếm theo mã hợp đồng, tên file..."
            data={filteredContracts}
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
      </motion.div>

      {/* Content */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="bg-white rounded-xl border border-card-primary shadow-sm p-6"
      >
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filteredContracts}
            rowKey="_id"
            pagination={{ pageSize: 10, showSizeChanger: true }}
            scroll={{ x: 1000 }}
          />
        </Spin>
      </motion.div>
    </DashboardLayout>
  );
}

import DashboardLayout from "../../shared/components/DashboardLayout";
import { getDistributorNavigationItems } from "../components/distributorNavigation";
import { useDistributions } from "../hooks/useDistributions";
import { Spin, Table } from "antd";
import { columns } from "../components/columns";
import { Search } from "../../shared/components/ui/search";

export default function Distributions() {
  const { loading, filteredData, searchText, setSearchText } =
    useDistributions();
  const navigationItems = getDistributorNavigationItems();

  return (
    <DashboardLayout navigationItems={navigationItems}>
      {/* Banner đồng nhất */}
      <section className="relative overflow-hidden rounded-2xl border border-[#90e0ef33] shadow-[0_10px_30px_rgba(0,0,0,0.06)] bg-gradient-to-tr from-[#00b4d8] via-[#48cae4] to-[#90e0ef]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.25),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-white/30 blur-xl animate-float-slow" />
          <div className="absolute top-8 right-6 w-16 h-8 rounded-full bg-white/25 blur-md rotate-6 animate-float-slower" />
        </div>
        <div className="relative px-6 py-8 md:px-10 md:py-12 !text-white">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight drop-shadow-sm">
            Đơn hàng nhận từ Nhà sản xuất
          </h1>
          <p className="mt-2 !text-white/90">
            Quản lý và xác nhận các đơn hàng nhận từ nhà sản xuất dược phẩm.
          </p>
        </div>
      </section>

      {/* Content */}
      <div className="mt-6 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            Danh sách đơn hàng
          </h2>
          <Search
            placeholder="Tìm kiếm theo mã đơn, tên thuốc..."
            allowClear
            style={{ maxWidth: 400 }}
            size="large"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

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

      <style>{`
        @keyframes float-slow { 0%,100% { transform: translateY(0) } 50% { transform: translateY(10px) } }
        @keyframes float-slower { 0%,100% { transform: translateY(0) } 50% { transform: translateY(6px) } }
      `}</style>
    </DashboardLayout>
  );
}

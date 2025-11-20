import { Table, Spin, Button } from "antd";
import DashboardLayout from "../../shared/components/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { navigationItems } from "../constants/navigationItems";
import { useInvoices } from "../hooks/useInvoice";
import DistributorInvoiceColumns from "../components/columnsInvoice";

export default function Invoices() {
  const { data, loading } = useInvoices();
  const navigate = useNavigate();

  return (
    <DashboardLayout navigationItems={navigationItems}>
      {/* Banner kiểu Manufacturer (card trắng, viền cyan) */}
      <div className="bg-white rounded-xl border border-cyan-200 shadow-sm p-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#007b91]">
            Hóa đơn thương mại
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Quản lý các hóa đơn đã tạo cho nhà thuốc.
          </p>
        </div>
        <Button
          type="primary"
          size="large"
          onClick={() => navigate("/distributor/invoices/create")}
          className="bg-linear-to-r from-[#00b4d8] via-[#48cae4] to-[#90e0ef] border-0"
        >
          + Tạo hóa đơn
        </Button>
      </div>

      {/* Content */}
      <div className="mt-6 bg-white rounded-2xl shadow-sm border border-cyan-100 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Danh sách hóa đơn
        </h2>
        <Spin spinning={loading}>
          <Table
            dataSource={data || []}
            rowKey={(record, index) =>
              record?._id || record?.id || `invoice-${index}`
            }
            pagination={{ pageSize: 10, showSizeChanger: true }}
            scroll={{ x: 1000 }}
          >
            <DistributorInvoiceColumns />
          </Table>
        </Spin>
      </div>

      <style>{`
        @keyframes float-slow { 0%,100% { transform: translateY(0) } 50% { transform: translateY(10px) } }
        @keyframes float-slower { 0%,100% { transform: translateY(0) } 50% { transform: translateY(6px) } }
      `}</style>
    </DashboardLayout>
  );
}

import React, { useEffect, useState } from "react";
import {
  useDistributorGetDistributions,
  useDistributorConfirmDistribution,
} from "../../hooks/react-query/distributor/use.distributor";
import { Button, Table, Tag, notification, Spin, Input } from "antd";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { getDistributorNavigationItems } from "../../utils/distributorNavigation";

const { Search } = Input;

const statusColor = (status) => {
  switch (status) {
    case "confirmed":
      return "green";
    case "pending":
      return "orange";
    default:
      return "blue";
  }
};

const statusLabel = (status) => {
  const labels = {
    confirmed: "Đã xác nhận",
    pending: "Chờ xác nhận",
    cancelled: "Đã hủy",
  };
  return labels[status] || status;
};

export default function Distributions() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();
  const { mutateAsync: fetchDistributions } = useDistributorGetDistributions();
  const { mutateAsync: confirmDistributionMutation } =
    useDistributorConfirmDistribution();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetchDistributions();
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
        ? res.data.data
        : [];
      setData(list);
      setFilteredData(list);
    } catch (error) {
      console.error("Fetch error:", error);
      notification.error({ message: "Không tải được danh sách lô hàng!" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredData(data);
      return;
    }
    const filtered = data.filter((item) => {
      const drug =
        item.drug || item.proofOfProduction?.drug || item.nftInfo?.drug;
      const drugName = drug?.name || drug?.tradeName || item.drugName || "";
      return (
        item.code?.toLowerCase().includes(searchText.toLowerCase()) ||
        drugName.toLowerCase().includes(searchText.toLowerCase()) ||
        item.verificationCode?.toLowerCase().includes(searchText.toLowerCase())
      );
    });
    setFilteredData(filtered);
  }, [searchText, data]);

  const onConfirm = async (id) => {
    try {
      await confirmDistributionMutation(id);
      notification.success({ message: "Xác nhận nhận lô hàng thành công!" });
      fetchData();
    } catch {
      notification.error({ message: "Xác nhận thất bại!" });
    }
  };

  const columns = [
    {
      title: "Mã đơn",
      dataIndex: "code",
      key: "code",
      render: (text) => (
        <span className="font-mono font-semibold text-gray-800">
          {text || "N/A"}
        </span>
      ),
    },
    {
      title: "Mã xác minh",
      dataIndex: "verificationCode",
      key: "verificationCode",
      render: (text) => (
        <span className="font-mono text-sm text-gray-600">{text || "N/A"}</span>
      ),
    },
    {
      title: "Tên thuốc",
      dataIndex: "drugName",
      key: "drugName",
      ellipsis: true,
      render: (text, record) => {
        const drug =
          record.drug || record.proofOfProduction?.drug || record.nftInfo?.drug;
        return drug?.name || drug?.tradeName || text || "N/A";
      },
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      render: (val) => <span className="font-medium">{val || 0}</span>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={statusColor(status)}>{statusLabel(status)}</Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "N/A",
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, row) => (
        <div className="flex gap-2">
          <Button
            size="small"
            onClick={() => navigate(`/distributor/distributions/${row._id}`)}
          >
            Chi tiết
          </Button>
          {row.status === "pending" && (
            <Button
              size="small"
              type="primary"
              onClick={() => onConfirm(row._id)}
            >
              Xác nhận
            </Button>
          )}
        </div>
      ),
    },
  ];

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

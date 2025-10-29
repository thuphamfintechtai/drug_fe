export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-teal-50">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6 text-cyan-700">Admin Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="font-semibold">Duyệt đăng ký doanh nghiệp</h2>
            <p className="text-sm text-gray-600 mt-1">Xem và duyệt các yêu cầu đăng ký.</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <h2 className="font-semibold">Quản trị hệ thống</h2>
            <p className="text-sm text-gray-600 mt-1">Quyền, người dùng, cấu hình.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

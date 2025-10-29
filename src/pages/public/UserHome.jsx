export default function UserHome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-cyan-100">
      <main className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg border-t-4 border-cyan-500 p-8">
          <h2 className="text-2xl font-bold mb-2 text-cyan-700">Hệ thống truy xuất nguồn gốc thuốc</h2>
          <p className="text-gray-600">Tra cứu thông tin sản phẩm, theo dõi lộ trình phân phối an toàn.</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold">Tra cứu</h3>
              <p className="text-sm text-gray-600 mt-1">Tìm kiếm bằng mã lô / mã QR.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold">Minh bạch</h3>
              <p className="text-sm text-gray-600 mt-1">Thông tin rõ ràng từ sản xuất đến nhà thuốc.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold">Bảo mật</h3>
              <p className="text-sm text-gray-600 mt-1">Dữ liệu bảo vệ bằng công nghệ blockchain.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  const getRoleLabel = (role) => {
    const roleLabels = {
      system_admin: 'Quản trị viên',
      pharma_company: 'Nhà sản xuất dược phẩm',
      distributor: 'Nhà phân phối',
      pharmacy: 'Nhà thuốc',
      user: 'Người dùng',
    };
    return roleLabels[role] || role;
  };

  const getStatusLabel = (status) => {
    const statusLabels = {
      active: 'Hoạt động',
      inactive: 'Không hoạt động',
      pending: 'Chờ duyệt',
      banned: 'Bị khóa',
    };
    return statusLabels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      banned: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-teal-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-cyan-700 mb-6">Thông tin tài khoản</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
                <p className="mt-1 text-sm text-gray-900">{user?.fullName || 'Chưa cập nhật'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tên đăng nhập</label>
                <p className="mt-1 text-sm text-gray-900">{user?.username}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Vai trò</label>
                <p className="mt-1 text-sm text-gray-900">{getRoleLabel(user?.role)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                <span
                  className={`mt-1 inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                    user?.status
                  )}`}
                >
                  {getStatusLabel(user?.status)}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                <p className="mt-1 text-sm text-gray-900">{user?.phone || 'Chưa cập nhật'}</p>
              </div>
            </div>

            {user?.status === 'pending' && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Tài khoản của bạn đang chờ được admin duyệt. Vui lòng chờ trong giây lát.
                </p>
              </div>
            )}

            {user?.status === 'active' && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Chức năng theo vai trò</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {user?.role === 'pharma_company' && (
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-900">Quản lý sản xuất</h4>
                      <p className="text-sm text-gray-600 mt-1">Tạo và quản lý proof of production</p>
                    </div>
                  )}
                  {(user?.role === 'distributor' || user?.role === 'pharma_company') && (
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-900">Quản lý phân phối</h4>
                      <p className="text-sm text-gray-600 mt-1">Tạo và quản lý proof of distribution</p>
                    </div>
                  )}
                  {user?.role === 'pharmacy' && (
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-900">Quản lý nhà thuốc</h4>
                      <p className="text-sm text-gray-600 mt-1">Tạo và quản lý proof of pharmacy</p>
                    </div>
                  )}
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900">Theo dõi NFT</h4>
                    <p className="text-sm text-gray-600 mt-1">Xem lịch sử truy xuất nguồn gốc</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

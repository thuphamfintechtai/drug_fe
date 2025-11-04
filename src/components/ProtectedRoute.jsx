import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Debug logging
  console.log('ProtectedRoute check:', { isAuthenticated, userRole: user?.role, allowedRoles });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Nếu có yêu cầu kiểm tra role
  if (allowedRoles.length > 0) {
    // system_admin có thể truy cập tất cả
    if (user?.role === 'system_admin') {
      console.log('User is system_admin, allowing access');
      return children;
    }

    // Kiểm tra role có trong danh sách cho phép không
    if (!allowedRoles.includes(user?.role)) {
      console.log('User role not in allowed roles:', user?.role, 'allowed:', allowedRoles);
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Không có quyền truy cập</h1>
            <p className="text-gray-600 mb-4">Bạn không có quyền truy cập trang này.</p>
            <p className="text-sm text-gray-500 mb-2">Role hiện tại: {user?.role || 'N/A'}</p>
            <p className="text-sm text-gray-500 mb-4">Role được phép: {allowedRoles.join(', ')}</p>
            <a href="/" className="text-blue-600 hover:text-blue-800">
              Về trang chủ
            </a>
          </div>
        </div>
      );
    }
  }

  return children;
};

export default ProtectedRoute;

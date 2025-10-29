import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

export default function UserHome() {
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchValue.trim()) {
      setError('Vui lòng nhập mã tra cứu');
      return;
    }

    setLoading(true);
    setError('');
    setSearchResult(null);

    try {
      const response = await api.get(`/NFTTracking/${searchValue.trim()}`);
      if (response.data.success) {
        setSearchResult(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Không tìm thấy thông tin. Vui lòng kiểm tra lại mã tra cứu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-cyan-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-cyan-100 rounded-full mb-6">
              <svg className="w-12 h-12 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Hệ Thống Truy Xuất Nguồn Gốc Thuốc
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Tra cứu thông tin sản phẩm, theo dõi lộ trình phân phối an toàn với công nghệ Blockchain
            </p>
          </div>

          {/* Search Box */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border-t-4 border-cyan-500">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                      Nhập mã lô, mã serial hoặc NFT ID
                    </label>
                    <input
                      id="search"
                      type="text"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      placeholder="Ví dụ: BATCH-123456 hoặc SN-ABC123"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-lg"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto px-8 py-3 bg-cyan-600 text-white rounded-lg font-semibold hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                    >
                      {loading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Đang tìm kiếm...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          Tra Cứu Ngay
                        </span>
                      )}
                    </button>
                  </div>
                </div>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}
              </form>
            </div>

            {/* Search Result */}
            {searchResult && (
              <div className="mt-6 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Kết quả tra cứu</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Mã lô (Batch Number)</p>
                    <p className="text-lg font-semibold text-gray-900">{searchResult.nftInfo?.batchNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Serial Number</p>
                    <p className="text-lg font-semibold text-gray-900">{searchResult.nftInfo?.serialNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Token ID</p>
                    <p className="text-lg font-semibold text-gray-900 font-mono">{searchResult.nftId || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Tại Sao Chọn Hệ Thống Của Chúng Tôi?
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="group text-center p-6 rounded-xl bg-gradient-to-br from-cyan-50 to-teal-50 hover:shadow-xl transition-all duration-300 border border-cyan-100">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-500 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Tra Cứu Dễ Dàng</h3>
              <p className="text-gray-600">
                Tìm kiếm thông tin sản phẩm nhanh chóng bằng mã lô, mã QR hoặc serial number
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group text-center p-6 rounded-xl bg-gradient-to-br from-cyan-50 to-teal-50 hover:shadow-xl transition-all duration-300 border border-cyan-100">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-500 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Minh Bạch Hoàn Toàn</h3>
              <p className="text-gray-600">
                Thông tin rõ ràng, chi tiết về toàn bộ quy trình từ sản xuất đến nhà thuốc
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group text-center p-6 rounded-xl bg-gradient-to-br from-cyan-50 to-teal-50 hover:shadow-xl transition-all duration-300 border border-cyan-100">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-500 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Bảo Mật Tuyệt Đối</h3>
              <p className="text-gray-600">
                Dữ liệu được bảo vệ bằng công nghệ blockchain, không thể thay đổi hay giả mạo
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gradient-to-br from-cyan-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Quy Trình Hoạt Động
          </h2>
          <div className="grid gap-8 md:grid-cols-4">
            {[
              { step: '1', title: 'Sản Xuất', desc: 'Nhà sản xuất tạo Proof of Production và mint NFT' },
              { step: '2', title: 'Phân Phối', desc: 'Chuyển quyền sở hữu NFT từ nhà sản xuất sang nhà phân phối' },
              { step: '3', title: 'Bán Lẻ', desc: 'Nhà phân phối chuyển NFT sang nhà thuốc' },
              { step: '4', title: 'Tra Cứu', desc: 'Người dùng tra cứu thông tin bằng mã QR hoặc serial' }
            ].map((item, index) => (
              <div key={index} className="relative text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-600 text-white rounded-full font-bold text-xl mb-4 shadow-lg">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
                {index < 3 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-cyan-300 transform translate-x-4">
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-8 border-l-cyan-300 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Lợi Ích Của Hệ Thống
              </h2>
              <ul className="space-y-4">
                {[
                  'Ngăn chặn thuốc giả, thuốc kém chất lượng',
                  'Tăng niềm tin của người tiêu dùng',
                  'Theo dõi chính xác chuỗi cung ứng',
                  'Tuân thủ quy định pháp luật',
                  'Hỗ trợ thu hồi sản phẩm khi cần thiết'
                ].map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-6 h-6 text-cyan-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700 text-lg">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-cyan-500 to-teal-500 rounded-2xl p-8 text-white shadow-2xl">
              <h3 className="text-2xl font-bold mb-4">Công Nghệ Blockchain</h3>
              <p className="mb-6 text-cyan-50">
                Mỗi sản phẩm được gắn với một NFT duy nhất trên blockchain, đảm bảo tính xác thực và không thể thay đổi. 
                Mọi giao dịch đều được ghi lại và minh bạch.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-3xl font-bold mb-1">100%</div>
                  <div className="text-sm text-cyan-50">Minh bạch</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                  <div className="text-3xl font-bold mb-1">0</div>
                  <div className="text-sm text-cyan-50">Giả mạo</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-cyan-600 to-teal-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Bạn Là Doanh Nghiệp Dược Phẩm?
          </h2>
          <p className="text-xl text-cyan-50 mb-8">
            Đăng ký ngay để tham gia hệ thống truy xuất nguồn gốc thuốc bằng blockchain
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register-business"
              className="px-8 py-3 bg-white text-cyan-600 rounded-lg font-semibold hover:bg-cyan-50 transition-all shadow-lg hover:shadow-xl"
            >
              Đăng Ký Doanh Nghiệp
            </Link>
            <Link
              to="/login"
              className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-all"
            >
              Đăng Nhập
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

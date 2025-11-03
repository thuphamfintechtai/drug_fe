import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function UserHome() {
  const navigate = useNavigate();
  const [tokenId, setTokenId] = useState('');

  const handleTrackDrug = () => {
    if (tokenId.trim()) {
      navigate(`/user/nft-tracking?tokenId=${tokenId}`);
    }
  };

  const features = [
    {
      icon: '🔍',
      title: 'Tra cứu nguồn gốc',
      description: 'Kiểm tra lịch sử thuốc từ sản xuất đến người tiêu dùng',
    },
    {
      icon: '🔐',
      title: 'Bảo mật Blockchain',
      description: 'Dữ liệu được mã hóa và lưu trữ an toàn trên blockchain',
    },
    {
      icon: '📱',
      title: 'Dễ sử dụng',
      description: 'Giao diện thân thiện, tra cứu nhanh chóng chỉ với mã NFT',
    },
    {
      icon: '✅',
      title: 'Xác thực chính hãng',
      description: 'Đảm bảo sản phẩm chính hãng, không giả mạo',
    },
  ];

  const stats = [
    { value: '10,000+', label: 'Sản phẩm' },
    { value: '500+', label: 'Doanh nghiệp' },
    { value: '50,000+', label: 'Người dùng' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 shadow-2xl mb-6">
              <span className="text-5xl">💊</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-800 mb-4">
              Hệ thống truy xuất<br />nguồn gốc thuốc
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Sử dụng công nghệ Blockchain để đảm bảo tính minh bạch và an toàn 
              trong chuỗi cung ứng dược phẩm
            </p>
          </motion.div>

          {/* Search Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 p-8">
              <h3 className="text-2xl font-bold text-slate-800 mb-4 text-center">
                🔍 Tra cứu thông tin thuốc
              </h3>
              <p className="text-slate-600 text-center mb-6">
                Nhập mã NFT để xem hành trình của sản phẩm
              </p>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={tokenId}
                  onChange={(e) => setTokenId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleTrackDrug()}
                  placeholder="Nhập mã NFT (Token ID)"
                  className="flex-1 px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-lg"
                />
                <button
                  onClick={handleTrackDrug}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-xl transition transform hover:scale-105"
                >
                  Tra cứu
                </button>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-slate-500">
                  Chưa có tài khoản?{' '}
                  <Link to="/register" className="text-blue-600 hover:underline font-semibold">
                    Đăng ký ngay
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-3 gap-6 mt-12 max-w-3xl mx-auto"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-1">
                  {stat.value}
                </div>
                <div className="text-slate-600 text-sm md:text-base">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-slate-800 mb-4">Tính năng nổi bật</h2>
            <p className="text-slate-600 text-lg">
              Giải pháp toàn diện cho việc quản lý và tra cứu nguồn gốc dược phẩm
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl shadow-2xl p-12 text-center text-white"
          >
            <h2 className="text-4xl font-bold mb-4">Bắt đầu ngay hôm nay</h2>
            <p className="text-xl mb-8 text-blue-100">
              Tham gia hệ thống để truy xuất nguồn gốc thuốc minh bạch và an toàn
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:shadow-xl transition transform hover:scale-105"
              >
                Đăng ký người dùng
              </Link>
              <Link
                to="/register-business"
                className="px-8 py-4 bg-blue-500 text-white font-bold rounded-xl border-2 border-white hover:bg-blue-400 transition transform hover:scale-105"
              >
                Đăng ký doanh nghiệp
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-slate-800 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Về chúng tôi</h3>
              <p className="text-slate-300">
                Hệ thống truy xuất nguồn gốc thuốc sử dụng công nghệ Blockchain 
                để đảm bảo tính minh bạch và an toàn.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Liên kết</h3>
              <ul className="space-y-2 text-slate-300">
                <li><Link to="/login" className="hover:text-white transition">Đăng nhập</Link></li>
                <li><Link to="/register" className="hover:text-white transition">Đăng ký</Link></li>
                <li><Link to="/register-business" className="hover:text-white transition">Doanh nghiệp</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Liên hệ</h3>
              <ul className="space-y-2 text-slate-300">
                <li>Email: info@drugchain.vn</li>
                <li>Hotline: 1900 xxxx</li>
                <li>Địa chỉ: Hà Nội, Việt Nam</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-8 text-center text-slate-400">
            <p>&copy; 2025 Drug Traceability System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

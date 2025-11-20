import DashboardLayout from "../../shared/components/DashboardLayout";
import TruckLoader from "../../shared/components/TruckLoader";
import { Profile as ProfileView } from "../../shared/components/ui/profile";
import { useAuthStore } from "../../auth/store";
import { navigationItems } from "../constants/navigationDashBoard";

const pickCompanyInfo = (user) => {
  if (!user) {
    return null;
  }
  return (
    user.company ||
    user.companyInfo ||
    user.businessInfo ||
    user.organization ||
    user.manufacturer ||
    null
  );
};

export default function ManufacturerProfile() {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);

  const company = pickCompanyInfo(user);

  return (
    <DashboardLayout navigationItems={navigationItems}>
      {loading ? (
        <div className="min-h-[60vh] flex items-center justify-center py-12">
          <TruckLoader height={72} progress={0.5} showTrack />
        </div>
      ) : !user ? (
        <div className="min-h-[60vh] flex items-center justify-center text-slate-500">
          Không tìm thấy thông tin tài khoản. Vui lòng đăng nhập lại.
        </div>
      ) : (
        <ProfileView
          title="Hồ sơ nhà sản xuất"
          subtitle="Thông tin tài khoản và doanh nghiệp đã đăng ký"
          user={user}
          company={company}
          roleLabel="Nhà sản xuất"
        />
      )}
    </DashboardLayout>
  );
}

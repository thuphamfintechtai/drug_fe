import { useMemo } from "react";
export const navigationItems = useMemo(
  () => [
    { path: "/admin", label: "Trang chủ", icon: null, active: false },
    {
      path: "/admin/registrations",
      label: "Duyệt đăng ký",
      icon: null,
      active: true,
    },
  ],
  []
);

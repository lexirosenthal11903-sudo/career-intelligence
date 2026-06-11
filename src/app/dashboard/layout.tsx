import OfflineBanner from "@/components/OfflineBanner";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <OfflineBanner />
      {children}
    </>
  );
}

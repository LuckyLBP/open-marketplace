import RequireApprovedCompany from '@/components/auth/requireApprovedCompany';

export default function DashboardRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RequireApprovedCompany>{children}</RequireApprovedCompany>;
}

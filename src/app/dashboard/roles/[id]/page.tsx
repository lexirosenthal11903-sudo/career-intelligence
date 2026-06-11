import type { Metadata } from "next";
import RoleDetailPage from "./RoleDetailPage";

const ROLE_TITLES: Record<string, string> = {
  "strategy-analyst": "Strategy Analyst",
  "operations-associate": "Operations Associate",
  "business-analyst": "Business Analyst",
  "management-consultant": "Management Consultant",
  "chief-of-staff": "Chief of Staff",
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const title = ROLE_TITLES[id] ?? "Role";
  return { title: `${title} — Career Intelligence` };
}

export default function RoleDetailRoute() {
  return <RoleDetailPage />;
}

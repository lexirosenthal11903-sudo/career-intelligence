import type { Metadata } from "next";
import DashboardHome from "./DashboardHome";

export const metadata: Metadata = {
  title: "Home — Career Intelligence",
};

export default function DashboardPage() {
  return <DashboardHome />;
}

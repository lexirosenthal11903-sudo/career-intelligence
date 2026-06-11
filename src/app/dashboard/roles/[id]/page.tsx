import type { Metadata } from "next";
import RoleDetailPage from "./RoleDetailPage";

export const metadata: Metadata = { title: "Strategy Analyst — Career Intelligence" };

export default function RoleDetailRoute() {
  return <RoleDetailPage />;
}

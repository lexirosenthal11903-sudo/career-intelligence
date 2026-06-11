import type { Metadata } from "next";
import RolesPage from "./RolesPage";

export const metadata: Metadata = {
  title: "Roles — Career Intelligence",
};

export default function RolesRoute() {
  return <RolesPage />;
}

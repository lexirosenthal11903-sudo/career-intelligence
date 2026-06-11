import type { Metadata } from "next";
import { Suspense } from "react";
import RolesPage from "./RolesPage";

export const metadata: Metadata = {
  title: "Roles — Career Intelligence",
};

export default function RolesRoute() {
  return (
    <Suspense>
      <RolesPage />
    </Suspense>
  );
}

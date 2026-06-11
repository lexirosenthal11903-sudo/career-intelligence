import type { Metadata } from "next";
import ApplicationsPage from "./ApplicationsPage";

export const metadata: Metadata = {
  title: "Applications — Career Intelligence",
};

export default function ApplicationsRoute() {
  return <ApplicationsPage />;
}

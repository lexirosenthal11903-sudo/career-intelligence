import type { Metadata } from "next";
import AnalysisErrorPage from "./AnalysisErrorPage";

export const metadata: Metadata = { title: "Something went wrong — Career Intelligence" };

export default function AnalysisErrorRoute() {
  return <AnalysisErrorPage />;
}

import type { Metadata } from "next";
import LoadingScreen from "./LoadingScreen";

export const metadata: Metadata = {
  title: "Finding your direction — Career Intelligence",
};

export default function LoadingPage() {
  return <LoadingScreen />;
}

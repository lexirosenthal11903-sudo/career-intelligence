import type { Metadata } from "next";
import SkillsPage from "./SkillsPage";

export const metadata: Metadata = {
  title: "Skills — Career Intelligence",
};

export default function SkillsRoute() {
  return <SkillsPage />;
}

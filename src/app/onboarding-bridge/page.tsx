import type { Metadata } from "next";
import OnboardingBridgePage from "./OnboardingBridgePage";

export const metadata: Metadata = { title: "Your Direction — Career Intelligence" };

export default function OnboardingBridgeRoute() {
  return <OnboardingBridgePage />;
}

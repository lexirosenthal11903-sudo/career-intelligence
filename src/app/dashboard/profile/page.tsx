import type { Metadata } from "next";
import ProfilePage from "./ProfilePage";

export const metadata: Metadata = { title: "Profile — Career Intelligence" };

export default function ProfileRoute() {
  return <ProfilePage />;
}

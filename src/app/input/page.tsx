import type { Metadata } from "next";
import InputChat from "./InputChat";

export const metadata: Metadata = {
  title: "Find your direction — Career Intelligence",
};

export default function InputPage() {
  return <InputChat />;
}

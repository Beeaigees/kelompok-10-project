"use client";
import { ModeToggle } from "../../components/common/Mode-toggle";
import { Coffee } from "lucide-react";
export default function AuthLayout({ children }) {
  return (
    <div className="relative bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      <div className="">
        <div className="flex items-center gap-2 text-2xl font-semibold">
          <span>BrewOps</span>
          <Coffee size={48} className="text-brown-primary" />
        </div>
      </div>
      <div className="flex w-full max-w-sm flex-col gap-6">{children}</div>
    </div>
  );
}

"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Coffee, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";

export default function Utama() {
  const router = useRouter();
  // isPending bernilai true selama navigasi ke /cashier belum selesai
  // (termasuk saat server component /cashier mengambil data produk).
  const [isPending, startTransition] = useTransition();

  const handleStart = () => {
    if (isPending) return;

    startTransition(() => {
      router.push("/cashier");
    });
  };

  return (
    <div className="relative bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <h1 className="text-3xl font-bold">Welcome to Cafe Web Application</h1>{" "}
      <Coffee size={48} />
      <div className="absolute right-1 p-3"></div>
      <div className="">
        <Button
          type="button"
          onClick={handleStart}
          disabled={isPending}
          aria-busy={isPending}
          className="min-w-28 gap-2 px-4"
        >
          {isPending ? (
            <>
              <Loader2 className="animate-spin" aria-hidden="true" />
              <span>Memuat...</span>
            </>
          ) : (
            <span>Start</span>
          )}
        </Button>
      </div>
    </div>
  );
}

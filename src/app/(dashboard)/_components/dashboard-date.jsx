"use client";
import { Clock } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { useEffect, useState } from "react";

export default function DashboardDate() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Memperbarui waktu setiap 1 detik (1000 ms)
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Membersihkan interval saat komponen ditutup
    return () => clearInterval(timer);
  }, []);

  // Format jam dan menit (Contoh: 10:42 AM)
  const timeString = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  // Format hari, bulan, dan tanggal (Contoh: Tue, Oct 24)
  const dateString = currentTime.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  return (
    <Badge className="" variant="secondary">
      <Clock size={64} />
      <p className="font-semibold">
        {timeString} - {dateString}
      </p>
    </Badge>
  );
}

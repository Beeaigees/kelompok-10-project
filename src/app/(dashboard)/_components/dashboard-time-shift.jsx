import { Dot } from "lucide-react";
import { Badge } from "../../../components/ui/badge";

export default function DashboardTimeShift() {
  return (
    <Badge className="bg-green-300 text-green-800 dark:bg-green-950 dark:text-green-300">
      <Dot size={64} />
      <p className="font-semibold">Shift time 07:00 AM - 03:00 PM</p>
    </Badge>
  );
}

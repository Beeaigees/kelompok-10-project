import { ModeToggle } from "../../components/common/Mode-toggle";

export default function DashboardLayout({ children }) {
  return (
    <>
      <div className="absolute right-1 p-3">
        <ModeToggle />
      </div>
      {children}
    </>
  );
}

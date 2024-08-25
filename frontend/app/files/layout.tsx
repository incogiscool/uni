import { AppNavbar } from "@/components/navbars/AppNavbar";
import { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <AppNavbar className="p-4 px-8" />
      <main className="pt-4 px-8 p-4 bg-background h-full flex-1">
        {children}
      </main>
    </div>
  );
};

export default Layout;

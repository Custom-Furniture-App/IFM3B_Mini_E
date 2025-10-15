import {type ReactNode } from "react";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen">
      {/* Sidebar stays full height */}
      <Sidebar className="h-full" />

      <div className="flex flex-col flex-1 relative">
        {/* Top nav fixed at top */}
        <TopNav className="absolute top-0 left-0 right-0" />

        {/* Main content scrollable under top nav */}
        <main className="pt-16 p-6 bg-gray-100 h-full overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;

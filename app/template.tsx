"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

interface RootTemplateProps {
  children: ReactNode;
}

const RootTemplate = ({ children }: RootTemplateProps) => {
  const pathname = usePathname();

  return (
    <div key={pathname} className="page-transition">
      {children}
    </div>
  );
};

export default RootTemplate;

"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveLayout({
  children,
  className,
}: ResponsiveLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };

    // Check initial screen size
    checkScreenSize();

    // Add event listener for window resize
    window.addEventListener("resize", checkScreenSize);

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return (
    <div
      className={cn(
        "min-h-screen bg-background transition-colors duration-200",
        className
      )}
    >
      {/* Mobile Layout */}
      {isMobile && (
        <div className="px-4 py-6">
          <div className="max-w-full mx-auto space-y-4">{children}</div>
        </div>
      )}

      {/* Tablet Layout */}
      {isTablet && (
        <div className="px-6 py-8">
          <div className="max-w-3xl mx-auto space-y-6">{children}</div>
        </div>
      )}

      {/* Desktop Layout */}
      {!isMobile && !isTablet && (
        <div className="px-8 py-8">
          <div className="max-w-4xl mx-auto space-y-6">{children}</div>
        </div>
      )}
    </div>
  );
}

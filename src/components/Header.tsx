"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "./ThemeToggle";
import { Download, Github } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  return (
    <Card className={className}>
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
              <Download className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Video Downloader</h1>
              <p className="text-sm text-muted-foreground hidden sm:block">
                Download videos from YouTube, Vimeo, and more
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* GitHub Link */}
            <Button
              variant="ghost"
              size="sm"
              className="w-9 h-9 p-0 hidden sm:flex"
              title="View on GitHub"
              onClick={() => window.open("https://github.com", "_blank")}
            >
              <Github className="h-4 w-4" />
            </Button>

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

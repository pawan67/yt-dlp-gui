"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal, Copy, Trash2, Minimize2, Maximize2 } from "lucide-react";

interface TerminalOutputProps {
  output: string[];
  title?: string;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
  onClear?: () => void;
  className?: string;
}

export function TerminalOutput({
  output,
  title = "yt-dlp Output",
  isMinimized = false,
  onToggleMinimize,
  onClear,
  className,
}: TerminalOutputProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new output is added
  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [output]);

  const handleCopyOutput = () => {
    const text = output.join("");
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
    });
  };

  const formatOutput = (line: string) => {
    // Add color coding for different types of output
    if (line.includes("[ERROR]")) {
      return { text: line, className: "text-red-400" };
    }
    if (line.includes("[download]")) {
      return { text: line, className: "text-blue-400" };
    }
    if (line.includes("[info]")) {
      return { text: line, className: "text-green-400" };
    }
    if (line.includes("[warning]")) {
      return { text: line, className: "text-yellow-400" };
    }
    if (line.includes("%")) {
      return { text: line, className: "text-cyan-400" };
    }
    return { text: line, className: "text-gray-300" };
  };

  if (isMinimized) {
    return (
      <Card className={`${className} border-gray-700 bg-gray-900`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-gray-300">
              <Terminal className="h-4 w-4" />
              {title} (Minimized)
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleMinimize}
              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-200"
            >
              <Maximize2 className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={`${className} border-gray-700 bg-gray-900`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2 text-gray-300">
            <Terminal className="h-4 w-4" />
            {title}
            {output.length > 0 && (
              <span className="text-xs text-gray-500">
                ({output.length} lines)
              </span>
            )}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyOutput}
              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-200"
              title="Copy output"
            >
              <Copy className="h-3 w-3" />
            </Button>
            {onClear && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClear}
                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-200"
                title="Clear output"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
            {onToggleMinimize && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleMinimize}
                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-200"
                title="Minimize"
              >
                <Minimize2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-64 w-full" ref={scrollAreaRef}>
          <div className="p-4 font-mono text-xs bg-black rounded-b-lg">
            {output.length === 0 ? (
              <div className="text-gray-500 italic">
                Waiting for yt-dlp output...
              </div>
            ) : (
              <div className="space-y-0">
                {output.map((line, index) => {
                  const formatted = formatOutput(line);
                  return (
                    <div
                      key={index}
                      className={`whitespace-pre-wrap break-all ${formatted.className}`}
                    >
                      {formatted.text}
                    </div>
                  );
                })}
                <div ref={endRef} />
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

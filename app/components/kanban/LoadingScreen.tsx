"use client";

import { Loader2, Zap } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen = ({ message = "Loading your tasks..." }: LoadingScreenProps) => {
  return (
    <div className="flex flex-col justify-center items-center h-[calc(100vh-120px)] min-h-[400px] w-full px-4 py-10 bg-gray-50 dark:bg-gray-900">
      <div className="relative">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <Zap className="w-5 h-5 text-yellow-400 absolute top-0 right-0 animate-pulse" />
        <Zap className="w-5 h-5 text-blue-400 absolute bottom-0 left-0 animate-pulse" />
      </div>
      <span className="mt-4 text-base font-medium text-primary">{message}</span>
    </div>
  );
};

export default LoadingScreen; 
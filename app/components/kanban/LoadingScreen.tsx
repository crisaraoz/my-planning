"use client";

import { Mosaic } from "react-loading-indicators";

interface LoadingScreenProps {}

const LoadingScreen = ({}: LoadingScreenProps) => {
  return (
    <div className="flex flex-col justify-center items-center w-full min-h-[500px] overflow-hidden">
      <div className="flex flex-col items-center justify-center">
        <div className="relative flex items-center justify-center transform scale-[2.0]">
          <Mosaic 
            color={["#FF4500", "#ADFF2F", "#1E90FF", "#8A2BE2"]} 
            size="large" 
            text="" 
            textColor="" 
          />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen; 
import React from "react";
import { PerformanceOptimizedApp } from "@/components/PerformanceOptimizedApp";
import "./utils/clearDebugData"; // Limpar dados de debug

const App = () => {
  return (
    <React.StrictMode>
      <PerformanceOptimizedApp />
    </React.StrictMode>
  );
};

export default App;
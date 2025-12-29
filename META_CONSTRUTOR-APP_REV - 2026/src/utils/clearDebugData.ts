// Utility para limpar dados de debug que podem estar causando problemas
export const clearAllDebugData = () => {
  // Limpar localStorage completamente
  localStorage.clear();
  
  // Remover qualquer elemento de debug que possa estar no DOM
  const debugElements = document.querySelectorAll('[class*="debug"], [class*="Auth Debug"], [id*="debug"]');
  debugElements.forEach(element => {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
  });
  
  console.log("🧹 Dados de debug limpos completamente");
};

// Executar limpeza imediatamente
clearAllDebugData();
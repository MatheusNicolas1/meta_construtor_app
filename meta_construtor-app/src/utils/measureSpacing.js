// Script para medir espaçamentos da página /home
// Execute no console do navegador na página /home

function measureHomeSpacing() {
  console.log('🔍 Medindo espaçamentos da página /home...');
  
  // Seletores identificados
  const headerSelector = 'nav[data-state]';
  const homeBadgeSelector = 'a[href="/login"] span:contains("Gestão Inteligente de Obras")';
  
  // Encontrar o header
  const header = document.querySelector(headerSelector);
  if (!header) {
    console.error('❌ Header não encontrado com seletor:', headerSelector);
    return;
  }
  
  // Encontrar o badge "Gestão Inteligente de Obras"
  const badgeLinks = document.querySelectorAll('a[href="/login"]');
  let badge = null;
  for (let link of badgeLinks) {
    const span = link.querySelector('span');
    if (span && span.textContent.includes('Gestão Inteligente de Obras')) {
      badge = link;
      break;
    }
  }
  
  if (!badge) {
    console.error('❌ Badge "Gestão Inteligente de Obras" não encontrado');
    return;
  }
  
  // Medir posições
  const headerRect = header.getBoundingClientRect();
  const badgeRect = badge.getBoundingClientRect();
  
  // Calcular delta (distância entre bottom do header e top do badge)
  const delta = badgeRect.top - headerRect.bottom;
  
  console.log('📏 Medições:');
  console.log('Header bottom:', headerRect.bottom);
  console.log('Badge top:', badgeRect.top);
  console.log('Delta (espaçamento):', delta + 'px');
  
  // Detectar breakpoint
  const width = window.innerWidth;
  let breakpoint = 'desktop';
  if (width < 768) {
    breakpoint = 'mobile';
  } else if (width < 1200) {
    breakpoint = 'tablet';
  }
  
  console.log('📱 Breakpoint:', breakpoint, `(${width}px)`);
  
  return {
    breakpoint,
    width,
    headerBottom: headerRect.bottom,
    badgeTop: badgeRect.top,
    delta: Math.round(delta)
  };
}

// Função para medir em diferentes resoluções
function measureAllBreakpoints() {
  console.log('🔄 Medindo em diferentes breakpoints...');
  
  const results = {};
  
  // Desktop (1200px+)
  if (window.innerWidth >= 1200) {
    results.desktop = measureHomeSpacing();
  }
  
  // Tablet (768-1199px) - simular redimensionamento
  if (window.innerWidth >= 768) {
    console.log('📱 Simulando tablet...');
    // Nota: Em um ambiente real, você redimensionaria a janela
    results.tablet = measureHomeSpacing();
  }
  
  // Mobile (<768px) - simular redimensionamento
  if (window.innerWidth < 768) {
    console.log('📱 Simulando mobile...');
    results.mobile = measureHomeSpacing();
  }
  
  console.log('📊 Resultados finais:', results);
  return results;
}

// Executar medição
if (typeof window !== 'undefined') {
  window.measureHomeSpacing = measureHomeSpacing;
  window.measureAllBreakpoints = measureAllBreakpoints;
  console.log('✅ Funções de medição carregadas. Execute: measureHomeSpacing() ou measureAllBreakpoints()');
}



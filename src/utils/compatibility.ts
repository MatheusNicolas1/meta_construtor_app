
/**
 * Browser compatibility checker utility
 * 
 * This utility checks if the user's browser is compatible with all features used in the app.
 */

export interface CompatibilityCheck {
  compatible: boolean;
  issues: string[];
}

export function checkBrowserCompatibility(): CompatibilityCheck {
  const issues: string[] = [];
  
  // Check for basic ES6 features
  try {
    // Arrow functions
    eval("() => {}");
  } catch (e) {
    issues.push("Your browser doesn't support arrow functions. Please update to a newer browser.");
  }
  
  // Check for localStorage support
  if (!('localStorage' in window)) {
    issues.push("Your browser doesn't support localStorage, which is required for saving preferences.");
  }
  
  // Check for Fetch API
  if (!('fetch' in window)) {
    issues.push("Your browser doesn't support the Fetch API. Please update to a newer browser.");
  }
  
  // Check for Flexbox support
  const flexSupport = CSS.supports && CSS.supports('display', 'flex');
  if (!flexSupport) {
    issues.push("Your browser has limited support for modern CSS layouts. Some UI elements may not appear correctly.");
  }

  // Check for Grid layout support
  const gridSupport = CSS.supports && CSS.supports('display', 'grid');
  if (!gridSupport) {
    issues.push("Your browser has limited support for CSS Grid. Some layouts may not display correctly.");
  }
  
  return {
    compatible: issues.length === 0,
    issues
  };
}

// Browser detection for analytics
export function getBrowserInfo() {
  const userAgent = navigator.userAgent;
  let browserName;
  let browserVersion;
  
  // Detect browser
  if (userAgent.match(/chrome|chromium|crios/i)) {
    browserName = "Chrome";
  } else if (userAgent.match(/firefox|fxios/i)) {
    browserName = "Firefox";
  } else if (userAgent.match(/safari/i)) {
    browserName = "Safari";
  } else if (userAgent.match(/opr\//i)) {
    browserName = "Opera";
  } else if (userAgent.match(/edg/i)) {
    browserName = "Edge";
  } else {
    browserName = "Unknown";
  }
  
  // Get browser version
  const match = userAgent.match(/(chrome|firefox|safari|opr|edge|msie|rv:|trident\/)(?: |\/)([0-9]+)/);
  if (match) {
    browserVersion = match[2];
  } else {
    browserVersion = "Unknown";
  }
  
  return {
    name: browserName,
    version: browserVersion,
    userAgent: userAgent,
    isMobile: /Mobi|Android/i.test(userAgent)
  };
}

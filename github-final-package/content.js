// ===================================
// TIMEPRICE - 3-TIER DETECTION SYSTEM
// ===================================

// Currency symbols and their regex patterns
const CURRENCY_PATTERNS = {
  USD: { symbol: '$', regex: /\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g },
  AUD: { symbol: '$', regex: /\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g },
  CAD: { symbol: '$', regex: /\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g },
  EUR: { symbol: '€', regex: /€\s*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/g },
  GBP: { symbol: '£', regex: /£\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g },
  JPY: { symbol: '¥', regex: /¥\s*(\d{1,3}(?:,\d{3})*)/g },
  CNY: { symbol: '¥', regex: /¥\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g },
  INR: { symbol: '₹', regex: /₹\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g },
  BRL: { symbol: 'R$', regex: /R\$\s*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/g },
  KRW: { symbol: '₩', regex: /₩\s*(\d{1,3}(?:,\d{3})*)/g },
  MXN: { symbol: '$', regex: /\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g },
  CHF: { symbol: 'Fr', regex: /Fr\.?\s*(\d{1,3}(?:['.,]\d{3})*(?:[.,]\d{2})?)/g },
  SGD: { symbol: '$', regex: /\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g },
  HKD: { symbol: '$', regex: /\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g },
  NZD: { symbol: '$', regex: /\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g },
  THB: { symbol: '฿', regex: /฿\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g },
  MYR: { symbol: 'RM', regex: /RM\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g },
  IDR: { symbol: 'Rp', regex: /Rp\s*(\d{1,3}(?:[.,]\d{3})*)/g },
  PHP: { symbol: '₱', regex: /₱\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g },
  ZAR: { symbol: 'R', regex: /R\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g },
  ILS: { symbol: '₪', regex: /₪\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g },
  AED: { symbol: 'د.إ', regex: /د\.إ\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g },
  SAR: { symbol: '﷼', regex: /﷼\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g },
  TRY: { symbol: '₺', regex: /₺\s*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/g },
  RUB: { symbol: '₽', regex: /₽\s*(\d{1,3}(?:\s?\d{3})*(?:[.,]\d{2})?)/g },
  PLN: { symbol: 'zł', regex: /(\d{1,3}(?:\s?\d{3})*(?:[.,]\d{2})?)\s*zł/g },
  CZK: { symbol: 'Kč', regex: /(\d{1,3}(?:\s?\d{3})*(?:[.,]\d{2})?)\s*Kč/g },
  HUF: { symbol: 'Ft', regex: /(\d{1,3}(?:\s?\d{3})*)\s*Ft/g },
  RON: { symbol: 'lei', regex: /(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)\s*lei/g },
  SEK: { symbol: 'kr', regex: /(\d{1,3}(?:\s?\d{3})*(?:[.,]\d{2})?)\s*kr/g },
  NOK: { symbol: 'kr', regex: /(\d{1,3}(?:\s?\d{3})*(?:[.,]\d{2})?)\s*kr/g },
  DKK: { symbol: 'kr', regex: /(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)\s*kr/g },
  ARS: { symbol: '$', regex: /\$\s*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/g }
};

let settings = {
  salary: 0,
  currency: 'USD',
  workHours: 8,
  workDays: 22,
  enabled: true
};

let hourlyRate = 0;
let processedElements = new WeakSet();
let processedPrices = new Map();

// ===================================
// CORE FUNCTIONS
// ===================================

function loadSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['salary', 'workHours', 'workDays', 'enabled'], (data) => {
      settings = {
        salary: parseFloat(data.salary) || 0,
        workHours: parseFloat(data.workHours) || 8,
        workDays: parseFloat(data.workDays) || 22,
        enabled: data.enabled !== false
      };
      
      if (settings.salary > 0 && settings.workHours > 0 && settings.workDays > 0) {
        const totalHoursPerMonth = settings.workHours * settings.workDays;
        hourlyRate = settings.salary / totalHoursPerMonth;
      }
      
      console.log('[Worth My Time] Settings loaded:', {
        salary: settings.salary,
        workHours: settings.workHours,
        workDays: settings.workDays,
        enabled: settings.enabled
      });
      console.log('[Worth My Time] Hourly rate:', hourlyRate);
      resolve();
    });
  });
}

function calculateWorkTime(price) {
  if (hourlyRate === 0 || !price || price <= 0) return null;
  
  const hours = price / hourlyRate;
  
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes}min`;
  } else if (hours < settings.workHours) {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
  } else {
    const days = Math.floor(hours / settings.workHours);
    const remainingHours = Math.round(hours % settings.workHours);
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  }
}

function parsePrice(priceStr) {
  if (!priceStr) return 0;
  const cleaned = priceStr.replace(/[^\d.]/g, '');
  return parseFloat(cleaned) || 0;
}

function createConvertedElement(price, workTime) {
  const span = document.createElement('span');
  span.className = 'timeprice-converted';
  span.style.cssText = 'display: inline-block; margin-left: 6px; white-space: nowrap;';
  span.innerHTML = `<span style="color: #8FAFA2; font-weight: 500;">≈</span> <span style="color: #5fc833; font-weight: 600;">${workTime}</span> <span style="color: #8FAFA2; font-weight: 400;">of work</span>`;
  span.title = `$${price.toFixed(2)} = ${workTime} of work`;
  return span;
}

function findProductContainer(element) {
  let current = element;
  const maxLevels = 10;
  
  for (let i = 0; i < maxLevels && current; i++) {
    const classes = current.className || '';
    const id = current.id || '';
    
    if (
      classes.includes('product') ||
      classes.includes('item') ||
      classes.includes('card') ||
      classes.includes('listing') ||
      id.includes('product') ||
      current.hasAttribute('data-asin') ||
      current.hasAttribute('data-component-type')
    ) {
      return current;
    }
    
    current = current.parentElement;
  }
  
  return element.parentElement || element;
}

function isElementVisible(element) {
  if (!element) return false;
  
  const style = window.getComputedStyle(element);
  
  if (
    style.display === 'none' ||
    style.visibility === 'hidden' ||
    style.opacity === '0' ||
    element.hidden ||
    element.offsetParent === null
  ) {
    return false;
  }
  
  if (element.getAttribute('aria-hidden') === 'true') {
    return false;
  }
  
  let parent = element.parentElement;
  let levels = 0;
  while (parent && levels < 5) {
    const parentStyle = window.getComputedStyle(parent);
    if (
      parentStyle.display === 'none' ||
      parentStyle.visibility === 'hidden' ||
      parent.hidden
    ) {
      return false;
    }
    parent = parent.parentElement;
    levels++;
  }
  
  return true;
}

function isStrikethrough(element) {
  if (!element) return false;
  
  let current = element;
  for (let i = 0; i < 5 && current; i++) {
    const style = window.getComputedStyle(current);
    const className = current.className?.toString().toLowerCase() || '';
    const id = current.id?.toLowerCase() || '';
    const tagName = current.tagName?.toUpperCase() || '';
    
    // Skip buttons and interactive elements
    if (
      tagName === 'BUTTON' ||
      tagName === 'A' && className.includes('button') ||
      className.includes('btn') ||
      className.includes('badge') ||
      className.includes('chip') ||
      className.includes('tag')
    ) {
      console.log('[Worth My Time] Skipping button/badge element');
      return true;
    }
    
    if (style.textDecoration.includes('line-through')) {
      console.log('[Worth My Time] Skipping struck-through price');
      return true;
    }
    
    if (
      className.includes('original-price') ||
      className.includes('was-price') ||
      className.includes('list-price') ||
      className.includes('rrp') ||
      className.includes('msrp') ||
      className.includes('strike') ||
      className.includes('crossed') ||
      className.includes('old-price') ||
      className.includes('regular-price') ||
      id.includes('original-price') ||
      id.includes('list-price')
    ) {
      console.log('[Worth My Time] Skipping original/RRP price element');
      return true;
    }
    
    if (tagName === 'DEL' || tagName === 'S') {
      console.log('[Worth My Time] Skipping <del> or <s> price element');
      return true;
    }
    
    current = current.parentElement;
  }
  return false;
}

// Check if a price is a promotional/statistical number (not a product price)
function isPromotionalNumber(price, element) {
  // Skip very large numbers (likely promotional statistics)
  if (price > 100000) { // $100,000+
    console.log('[Worth My Time] Skipping large promotional number:', price);
    return true;
  }
  
  // Check for promotional context in text
  const text = element.textContent?.toLowerCase() || '';
  const parentText = element.parentElement?.textContent?.toLowerCase() || '';
  
  // Skip if contains promotional indicators
  const promotionalIndicators = [
    'million', 'm+', 'k+', 'billion', 'earned', 'saved', 'cashback earned',
    'shoppers', 'stores', 'trips', 'members', 'users', 'customers',
    'discount', 'off', 'save', 'bonus', 'reward'
  ];
  
  for (const indicator of promotionalIndicators) {
    if (text.includes(indicator) || parentText.includes(indicator)) {
      console.log('[Worth My Time] Skipping promotional context:', indicator);
      return true;
    }
  }
  
  return false;
}

// ===================================
// TIER 1: SITE-SPECIFIC DETECTORS
// ===================================

const SITE_DETECTORS = {
  amazon: {
    detect: function(hostname) {
      return hostname.includes('amazon.');
    },
    
    patterns: [
      // Pattern 1: Standard split price (.a-price structure)
      {
        name: 'Amazon Standard Split',
        find: () => document.querySelectorAll('.a-price'),
        extract: (container) => {
          const symbolEl = container.querySelector('.a-price-symbol');
          const wholeEl = container.querySelector('.a-price-whole');
          const fractionEl = container.querySelector('.a-price-fraction');
          
          if (symbolEl && wholeEl) {
            const symbol = symbolEl.textContent.trim();
            const whole = wholeEl.textContent.replace(/[^\d]/g, '');
            const fraction = fractionEl ? fractionEl.textContent.replace(/[^\d]/g, '') : '00';
            
            if (symbol === '$') {
              return { price: parseFloat(`${whole}.${fraction}`), element: container };
            }
          }
          return null;
        }
      },
      
      // Pattern 2: Inline price (.a-color-price)
      {
        name: 'Amazon Color Price',
        find: () => document.querySelectorAll('.a-color-price, .a-price-text-normal, .a-price-text'),
        extract: (element) => {
          const text = element.textContent.trim();
          const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
          if (match) {
            return { price: parsePrice(match[1]), element };
          }
          return null;
        }
      },
      
      // Pattern 3: Deal price
      {
        name: 'Amazon Deal Price',
        find: () => document.querySelectorAll('.dealPrice, [class*="deal"] .a-price, .priceBlockDealPrice'),
        extract: (element) => {
          const text = element.textContent.trim();
          const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
          if (match) {
            return { price: parsePrice(match[1]), element };
          }
          return null;
        }
      },
      
      // Pattern 4: Buy box price
      {
        name: 'Amazon Buy Box',
        find: () => document.querySelectorAll('#corePrice_feature_div .a-price, #corePriceDisplay_desktop_feature_div .a-price'),
        extract: (container) => {
          const symbolEl = container.querySelector('.a-price-symbol');
          const wholeEl = container.querySelector('.a-price-whole');
          const fractionEl = container.querySelector('.a-price-fraction');
          
          if (symbolEl && wholeEl) {
            const symbol = symbolEl.textContent.trim();
            const whole = wholeEl.textContent.replace(/[^\d]/g, '');
            const fraction = fractionEl ? fractionEl.textContent.replace(/[^\d]/g, '') : '00';
            
            if (symbol === '$') {
              return { price: parseFloat(`${whole}.${fraction}`), element: container };
            }
          }
          return null;
        }
      },
      
      // Pattern 5: Subscribe & Save
      {
        name: 'Amazon Subscribe & Save',
        find: () => document.querySelectorAll('.a-declarative .a-color-price, [class*="subscribe"] .a-price'),
        extract: (element) => {
          const text = element.textContent.trim();
          const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
          if (match) {
            return { price: parsePrice(match[1]), element };
          }
          return null;
        }
      },
      
      // Pattern 6: Search result price  
      {
        name: 'Amazon Search Result',
        find: () => document.querySelectorAll('.s-item__price .a-price, [data-component-type="s-search-result"] .a-price'),
        extract: (container) => {
          const symbolEl = container.querySelector('.a-price-symbol');
          const wholeEl = container.querySelector('.a-price-whole');
          const fractionEl = container.querySelector('.a-price-fraction');
          
          if (wholeEl) {
            const whole = wholeEl.textContent.replace(/[^\d]/g, '');
            const fraction = fractionEl ? fractionEl.textContent.replace(/[^\d]/g, '') : '00';
            const symbol = symbolEl ? symbolEl.textContent.trim() : '$';
            
            if (symbol === '$') {
              return { price: parseFloat(`${whole}.${fraction}`), element: container };
            }
          }
          return null;
        }
      }
    ],
    
    process: function() {
      console.log('[Worth My Time] Using Amazon-specific detector');
      let totalConverted = 0;
      
      this.patterns.forEach(pattern => {
        const elements = pattern.find();
        console.log(`[Worth My Time] ${pattern.name}: Found ${elements.length} elements`);
        
        elements.forEach(element => {
          if (processedElements.has(element)) return;
          if (element.querySelector('.timeprice-converted')) return;
          if (!isElementVisible(element)) return;
          if (isStrikethrough(element)) return;
          
          const priceData = pattern.extract(element);
          if (!priceData) return;
          
          const { price, element: targetElement } = priceData;
          if (price < 1) return;
          
          // Skip promotional/statistical numbers
          if (isPromotionalNumber(price, targetElement)) return;
          
          const productContainer = findProductContainer(targetElement);
          const priceKey = `${productContainer.id || productContainer.className}-${price}`;
          if (processedPrices.has(priceKey)) {
            console.log('[Worth My Time] Skipping duplicate price:', price);
            return;
          }
          
          const workTime = calculateWorkTime(price);
          if (!workTime) return;
          
          const timeElement = createConvertedElement(price, workTime);
          
          if (targetElement.nextSibling) {
            targetElement.parentNode.insertBefore(timeElement, targetElement.nextSibling);
          } else {
            targetElement.parentNode.appendChild(timeElement);
          }
          
          processedElements.add(element);
          processedElements.add(targetElement);
          processedPrices.set(priceKey, true);
          totalConverted++;
          
          console.log(`[Worth My Time] ${pattern.name}: $${price.toFixed(2)} → ${workTime}`);
        });
      });
      
      console.log(`[Worth My Time] Amazon detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },
  
  // APPLE
  apple: {
    detect: function(hostname) {
      return hostname.includes('apple.com');
    },
    
    patterns: [
      {
        name: 'Apple Product Page - Main Price',
        selector: '[data-autom="prices"], .as-producttile-price, .rf-pdp-pricing',
        validate: function(element) {
          // Skip if already has conversion
          if (element.querySelector('.timeprice-converted')) return false;
          
          // Skip if this is a parent container with child price elements
          const childPrices = element.querySelectorAll('[data-autom="prices"], .as-producttile-price');
          if (childPrices.length > 0 && childPrices[0] !== element) return false;
          
          return !isStrikethrough(element);
        }
      },
      {
        name: 'Apple Price Text Elements',
        selector: 'span',
        validate: function(element) {
          // Skip if already has conversion
          if (element.querySelector('.timeprice-converted')) return false;
          
          // Must be exactly a price format (nothing else)
          const text = element.textContent?.trim();
          if (!text) return false;
          
          // Match Apple's formats: "A$1,799" or "From A$1,799"
          if (!text.match(/^(From\s+)?A?\$\d{1,3}(?:,\d{3})*$/)) return false;
          
          // Skip if parent is already processed
          if (processedElements.has(element.parentElement)) return false;
          
          // Skip very small text
          const fontSize = window.getComputedStyle(element).fontSize;
          if (fontSize && parseFloat(fontSize) < 14) return false;
          
          // Skip if this element has children with the same price
          const children = Array.from(element.children);
          if (children.length > 0) {
            const hasChildPrice = children.some(child => {
              const childText = child.textContent?.trim();
              return childText && childText.match(/A?\$\d{1,3}(?:,\d{3})*$/);
            });
            if (hasChildPrice) return false;
          }
          
          return !isStrikethrough(element);
        }
      }
    ],
    
    process: function() {
      let totalConverted = 0;
      const seenPriceElements = new Set(); // Track exact elements
      const seenPriceValues = new Set(); // Track price values to avoid duplicates
      
      for (const pattern of this.patterns) {
        const elements = document.querySelectorAll(pattern.selector);
        console.log(`[Worth My Time] Apple ${pattern.name}: Found ${elements.length} elements`);
        
        elements.forEach(element => {
          if (processedElements.has(element)) return;
          if (seenPriceElements.has(element)) return;
          if (element.querySelector('.timeprice-converted')) return;
          if (!isElementVisible(element)) return;
          if (pattern.validate && !pattern.validate(element)) return;
          
          const text = element.textContent?.trim();
          if (!text) return;
          
          // Extract price (handle "From A$1,799" format)
          const match = text.match(/A?\$(\d{1,3}(?:,\d{3})*)/);
          if (!match) return;
          
          const price = parsePrice(match[1]);
          if (price <= 0 || price > 100000) return;
          if (isPromotionalNumber(price, element)) return;
          
          // On Apple pages, heavily deduplicate - only show each price value once
          if (seenPriceValues.has(price)) {
            console.log(`[Worth My Time] Apple: Skipping duplicate price $${price}`);
            return;
          }
          
          const workTime = calculateWorkTime(price);
          if (!workTime) return;
          
          element.appendChild(createConvertedElement(price, workTime));
          processedElements.add(element);
          seenPriceElements.add(element);
          seenPriceValues.add(price);
          processedPrices.add(price);
          totalConverted++;
          
          console.log(`[Worth My Time] Apple: Converted $${price} → ${workTime} (${pattern.name})`);
        });
      }
      
      console.log(`[Worth My Time] Apple detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },
  
  // WALMART
  walmart: {
    detect: function(hostname) {
      return hostname.includes('walmart.com');
    },
    
    patterns: [
      {
        name: 'Walmart Product Price',
        selector: '[itemprop="price"], [data-testid="price-wrap"] .price-main, .price-characteristic, span[class*="price"]',
        validate: function(element) {
          // Skip "Was" prices
          const ariaLabel = element.getAttribute('aria-label') || '';
          if (ariaLabel.toLowerCase().includes('was')) return false;
          
          // Skip strikethrough
          if (isStrikethrough(element)) return false;
          
          return true;
        }
      },
      {
        name: 'Walmart Search Results',
        selector: '[data-automation-id="product-price"], [data-testid="list-view"] span[class*="price"]',
        validate: function(element) {
          return !isStrikethrough(element);
        }
      }
    ],
    
    process: function() {
      let totalConverted = 0;
      
      for (const pattern of this.patterns) {
        const elements = document.querySelectorAll(pattern.selector);
        
        elements.forEach(element => {
          if (processedElements.has(element)) return;
          if (element.querySelector('.timeprice-converted')) return;
          if (!isElementVisible(element)) return;
          if (pattern.validate && !pattern.validate(element)) return;
          
          const text = element.textContent?.trim();
          if (!text) return;
          
          const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
          if (!match) return;
          
          const price = parsePrice(match[1]);
          if (price <= 0 || price > 1000000) return;
          if (isPromotionalNumber(price, element)) return;
          
          const workTime = calculateWorkTime(price);
          if (!workTime) return;
          
          element.appendChild(createConvertedElement(price, workTime));
          processedElements.add(element);
          processedPrices.add(price);
          totalConverted++;
        });
      }
      
      console.log(`[Worth My Time] Walmart detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },
  
  // TARGET
  target: {
    detect: function(hostname) {
      return hostname.includes('target.com');
    },
    
    patterns: [
      {
        name: 'Target Product Price',
        selector: '[data-test="product-price"], [data-test="current-price"], .h-text-red, span[class*="Price"]',
        validate: function(element) {
          // Skip "reg" prices (regular/was prices)
          const testAttr = element.getAttribute('data-test') || '';
          if (testAttr.includes('reg')) return false;
          
          return !isStrikethrough(element);
        }
      },
      {
        name: 'Target Search Results',
        selector: '[data-test*="ProductCard"] [data-test*="price"], [data-test*="product-price"]',
        validate: function(element) {
          return !isStrikethrough(element);
        }
      }
    ],
    
    process: function() {
      let totalConverted = 0;
      
      for (const pattern of this.patterns) {
        const elements = document.querySelectorAll(pattern.selector);
        
        elements.forEach(element => {
          if (processedElements.has(element)) return;
          if (element.querySelector('.timeprice-converted')) return;
          if (!isElementVisible(element)) return;
          if (pattern.validate && !pattern.validate(element)) return;
          
          const text = element.textContent?.trim();
          if (!text) return;
          
          const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
          if (!match) return;
          
          const price = parsePrice(match[1]);
          if (price <= 0 || price > 1000000) return;
          if (isPromotionalNumber(price, element)) return;
          
          const workTime = calculateWorkTime(price);
          if (!workTime) return;
          
          element.appendChild(createConvertedElement(price, workTime));
          processedElements.add(element);
          processedPrices.add(price);
          totalConverted++;
        });
      }
      
      console.log(`[Worth My Time] Target detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },
  
  // ETSY
  etsy: {
    detect: function(hostname) {
      return hostname.includes('etsy.com');
    },
    
    patterns: [
      {
        name: 'Etsy Product Price',
        selector: '[data-buy-box-region="price"] .currency-value, [data-selector="price-only"], .wt-text-title-03, p[class*="price"]',
        validate: function(element) {
          return !isStrikethrough(element);
        }
      },
      {
        name: 'Etsy Search Results',
        selector: '.v2-listing-card .currency-value, .wt-text-body-01, span[class*="currency"]',
        validate: function(element) {
          return !isStrikethrough(element);
        }
      }
    ],
    
    process: function() {
      let totalConverted = 0;
      
      for (const pattern of this.patterns) {
        const elements = document.querySelectorAll(pattern.selector);
        
        elements.forEach(element => {
          if (processedElements.has(element)) return;
          if (element.querySelector('.timeprice-converted')) return;
          if (!isElementVisible(element)) return;
          if (pattern.validate && !pattern.validate(element)) return;
          
          const text = element.textContent?.trim();
          if (!text) return;
          
          const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
          if (!match) return;
          
          const price = parsePrice(match[1]);
          if (price <= 0 || price > 1000000) return;
          if (isPromotionalNumber(price, element)) return;
          
          const workTime = calculateWorkTime(price);
          if (!workTime) return;
          
          element.appendChild(createConvertedElement(price, workTime));
          processedElements.add(element);
          processedPrices.add(price);
          totalConverted++;
        });
      }
      
      console.log(`[Worth My Time] Etsy detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },
  
  // BEST BUY
  bestbuy: {
    detect: function(hostname) {
      return hostname.includes('bestbuy.com');
    },
    
    patterns: [
      {
        name: 'Best Buy Product Price',
        selector: '[data-testid="customer-price"], .priceView-hero-price span, .priceView-customer-price, div[class*="price"]',
        validate: function(element) {
          // Skip regular price (was price)
          const classes = element.className || '';
          if (classes.includes('regular-price')) return false;
          
          return !isStrikethrough(element);
        }
      },
      {
        name: 'Best Buy Search Results',
        selector: '.priceView-layout-large .priceView-customer-price, .pricing-price span',
        validate: function(element) {
          return !isStrikethrough(element);
        }
      }
    ],
    
    process: function() {
      let totalConverted = 0;
      
      for (const pattern of this.patterns) {
        const elements = document.querySelectorAll(pattern.selector);
        
        elements.forEach(element => {
          if (processedElements.has(element)) return;
          if (element.querySelector('.timeprice-converted')) return;
          if (!isElementVisible(element)) return;
          if (pattern.validate && !pattern.validate(element)) return;
          
          const text = element.textContent?.trim();
          if (!text) return;
          
          const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
          if (!match) return;
          
          const price = parsePrice(match[1]);
          if (price <= 0 || price > 1000000) return;
          if (isPromotionalNumber(price, element)) return;
          
          const workTime = calculateWorkTime(price);
          if (!workTime) return;
          
          element.appendChild(createConvertedElement(price, workTime));
          processedElements.add(element);
          processedPrices.add(price);
          totalConverted++;
        });
      }
      
      console.log(`[Worth My Time] Best Buy detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },
  
  // HOME DEPOT
  homedepot: {
    detect: function(hostname) {
      return hostname.includes('homedepot.com');
    },
    
    patterns: [
      {
        name: 'Home Depot Product Price',
        selector: '[data-testid="price-format__main-price"], .price-format__main-price, .price, span[class*="price"]',
        validate: function(element) {
          // Skip strike prices
          const classes = element.className || '';
          if (classes.includes('strike')) return false;
          
          return !isStrikethrough(element);
        }
      },
      {
        name: 'Home Depot Search Results',
        selector: '.price-format__large .price, .product-pod__price, div[class*="price"]',
        validate: function(element) {
          return !isStrikethrough(element);
        }
      }
    ],
    
    process: function() {
      let totalConverted = 0;
      
      for (const pattern of this.patterns) {
        const elements = document.querySelectorAll(pattern.selector);
        
        elements.forEach(element => {
          if (processedElements.has(element)) return;
          if (element.querySelector('.timeprice-converted')) return;
          if (!isElementVisible(element)) return;
          if (pattern.validate && !pattern.validate(element)) return;
          
          const text = element.textContent?.trim();
          if (!text) return;
          
          const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
          if (!match) return;
          
          const price = parsePrice(match[1]);
          if (price <= 0 || price > 1000000) return;
          if (isPromotionalNumber(price, element)) return;
          
          const workTime = calculateWorkTime(price);
          if (!workTime) return;
          
          element.appendChild(createConvertedElement(price, workTime));
          processedElements.add(element);
          processedPrices.add(price);
          totalConverted++;
        });
      }
      
      console.log(`[Worth My Time] Home Depot detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },
  
  // COSTCO
  costco: {
    detect: function(hostname) {
      return hostname.includes('costco.com');
    },
    
    patterns: [
      {
        name: 'Costco Product Page - Main Price',
        selector: '[automation-id="productPriceOutput"]',
        validate: function(element) {
          if (element.querySelector('.timeprice-converted')) return false;
          return !isStrikethrough(element);
        }
      },
      {
        name: 'Costco Product Page - Your Price',
        selector: '.your-price',
        validate: function(element) {
          if (element.querySelector('.timeprice-converted')) return false;
          const specificChild = element.querySelector('[automation-id="productPriceOutput"]');
          if (specificChild) return false;
          return !isStrikethrough(element);
        }
      },
      {
        name: 'Costco Home/Listing - Price Spans',
        selector: 'span',
        validate: function(element) {
          if (element.querySelector('.timeprice-converted')) return false;
          const text = element.textContent?.trim();
          if (!text) return false;
          if (!text.match(/^\$\d{1,3}(?:,\d{3})*(?:\.\d{2})?$/)) return false;
          const children = Array.from(element.children);
          const hasChildPrice = children.some(child => {
            const childText = child.textContent?.trim();
            return childText && childText.match(/^\$\d{1,3}(?:,\d{3})*(?:\.\d{2})?$/);
          });
          if (hasChildPrice) return false;
          const fontSize = window.getComputedStyle(element).fontSize;
          if (fontSize && parseFloat(fontSize) < 14) return false;
          const parentText = element.parentElement?.textContent || '';
          if (parentText.toLowerCase().includes('save')) return false;
          return !isStrikethrough(element);
        }
      }
    ],
    
    process: function() {
      let totalConverted = 0;
      let attempts = 0;
      const maxAttempts = 3;
      
      const attemptConversion = () => {
        attempts++;
        let convertedThisRound = 0;
        const isProductPage = window.location.pathname.includes('/p/');
        const processedPatterns = new Set();
        
        for (const pattern of this.patterns) {
          const elements = document.querySelectorAll(pattern.selector);
          console.log(`[Worth My Time] Costco ${pattern.name}: Found ${elements.length} elements (attempt ${attempts})`);
          
          elements.forEach(element => {
            if (processedElements.has(element)) return;
            if (element.querySelector('.timeprice-converted')) return;
            if (!isElementVisible(element)) return;
            if (pattern.validate && !pattern.validate(element)) return;
            
            const text = element.textContent?.trim();
            if (!text) return;
            
            const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
            if (!match) return;
            
            const price = parsePrice(match[1]);
            if (price <= 0 || price > 1000000) return;
            if (isPromotionalNumber(price, element)) return;
            
            if (isProductPage) {
              const patternKey = `${pattern.name}`;
              if (processedPatterns.has(patternKey)) {
                console.log(`[Worth My Time] Costco: Skip duplicate pattern ${patternKey}`);
                return;
              }
              processedPatterns.add(patternKey);
            }
            
            const workTime = calculateWorkTime(price);
            if (!workTime) return;
            
            element.appendChild(createConvertedElement(price, workTime));
            processedElements.add(element);
            processedPrices.add(price);
            convertedThisRound++;
            totalConverted++;
            
            console.log(`[Worth My Time] Costco: Converted $${price} → ${workTime} (${pattern.name})`);
          });
        }
        
        if (convertedThisRound > 0 && attempts < maxAttempts) {
          console.log(`[Worth My Time] Costco: Retry ${attempts}/${maxAttempts}, found ${convertedThisRound} new prices`);
          setTimeout(attemptConversion, 800);
        } else {
          console.log(`[Worth My Time] Costco detector converted ${totalConverted} total prices after ${attempts} attempts`);
        }
      };
      
      attemptConversion();
      return totalConverted;
    }
  },
  
  // SHEIN
  shein: {
    detect: function(hostname) {
      return hostname.includes('shein.com') || hostname.includes('us.shein.com');
    },
    
    patterns: [
      {
        name: 'Shein Product Price',
        selector: '.product-intro__head-price, .from-price-text .price-text, .del-price-box__price, span[class*="price"]',
        validate: function(element) {
          // Skip original price
          const classes = element.className || '';
          if (classes.includes('original')) return false;
          
          return !isStrikethrough(element);
        }
      },
      {
        name: 'Shein Search Results',
        selector: '.S-product-item__price, .product-card__prices, .goods-price, div[class*="price"]',
        validate: function(element) {
          return !isStrikethrough(element);
        }
      }
    ],
    
    process: function() {
      let totalConverted = 0;
      
      for (const pattern of this.patterns) {
        const elements = document.querySelectorAll(pattern.selector);
        
        elements.forEach(element => {
          if (processedElements.has(element)) return;
          if (element.querySelector('.timeprice-converted')) return;
          if (!isElementVisible(element)) return;
          if (pattern.validate && !pattern.validate(element)) return;
          
          const text = element.textContent?.trim();
          if (!text) return;
          
          const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
          if (!match) return;
          
          const price = parsePrice(match[1]);
          if (price <= 0 || price > 1000000) return;
          if (isPromotionalNumber(price, element)) return;
          
          const workTime = calculateWorkTime(price);
          if (!workTime) return;
          
          element.appendChild(createConvertedElement(price, workTime));
          processedElements.add(element);
          processedPrices.add(price);
          totalConverted++;
        });
      }
      
      console.log(`[Worth My Time] Shein detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  }
  
  // Future site-specific detectors can be added here
};

// ===================================
// TIER 2: UNIVERSAL DETECTOR
// ===================================

const UniversalDetector = {
  process: function() {
    console.log('[Worth My Time] Using Universal detector');
    let totalConverted = 0;
    
    // Find all potential price elements
    const selectors = [
      'span', 'div', 'p', 'strong', 'b',
      'td', 'th', 'li',
      '[data-price]',
      '[itemprop*="price"]',
      '[class*="price"]',
      '[class*="cost"]',
      '[class*="amount"]'
    ];
    
    const elements = document.querySelectorAll(selectors.join(', '));
    
    elements.forEach(element => {
      if (processedElements.has(element)) return;
      if (element.querySelector('.timeprice-converted')) return;
      if (!isElementVisible(element)) return;
      if (isStrikethrough(element)) return;
      
      const text = element.textContent?.trim();
      if (!text || text.length > 100) return;
      
      // Look for price pattern
      const pattern = /\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/;
      const match = text.match(pattern);
      
      if (match) {
        const price = parsePrice(match[1]);
        
        if (price < 1 || price > 999999) return;
        
        // Skip promotional/statistical numbers
        if (isPromotionalNumber(price, element)) return;
        
        // Context validation
        if (!this.isPriceContext(element)) return;
        
        // Check for duplicates
        const productContainer = findProductContainer(element);
        const priceKey = `${productContainer.id || productContainer.className}-${price}`;
        if (processedPrices.has(priceKey)) return;
        
        const workTime = calculateWorkTime(price);
        if (workTime) {
          const timeElement = createConvertedElement(price, workTime);
          
          if (element.nextSibling) {
            element.parentNode.insertBefore(timeElement, element.nextSibling);
          } else {
            element.parentNode.appendChild(timeElement);
          }
          
          processedElements.add(element);
          processedPrices.set(priceKey, true);
          totalConverted++;
        }
      }
    });
    
    console.log(`[Worth My Time] Universal detector converted ${totalConverted} prices`);
    return totalConverted;
  },
  
  isPriceContext: function(element) {
    let current = element;
    let depth = 0;
    
    while (current && depth < 5) {
      const className = current.className?.toString().toLowerCase() || '';
      const id = current.id?.toLowerCase() || '';
      const tagName = current.tagName?.toUpperCase() || '';
      
      // Strong negative signals - skip these contexts
      if (
        tagName === 'BUTTON' ||
        tagName === 'A' && className.includes('button') ||
        className.includes('btn') ||
        className.includes('badge') ||
        className.includes('stat') ||
        className.includes('metric') ||
        className.includes('counter') ||
        className.includes('hero') ||
        className.includes('banner') ||
        className.includes('promo') ||
        className.includes('review') ||
        className.includes('rating') ||
        className.includes('dimension') ||
        className.includes('weight')
      ) {
        return false;
      }
      
      // Positive signals
      if (
        className.includes('price') ||
        className.includes('cost') ||
        className.includes('product') ||
        className.includes('item') ||
        id.includes('price') ||
        current.hasAttribute('data-price') ||
        current.querySelector('button')
      ) {
        return true;
      }
      
      current = current.parentElement;
      depth++;
    }
    
    return false;
  }
};

// ===================================
// TIER 3: LEARNED PATTERNS (Placeholder)
// ===================================

const LearnedPatterns = {
  // Will be populated with patterns from user feedback
  patterns: {},
  
  process: function() {
    const hostname = window.location.hostname;
    const pattern = this.patterns[hostname];
    
    if (!pattern) return 0;
    
    console.log('[Worth My Time] Using learned pattern for', hostname);
    // Implementation will be added when we have user-submitted patterns
    return 0;
  }
};

// ===================================
// MAIN DETECTION ORCHESTRATOR
// ===================================

function processAllPrices() {
  if (!settings.enabled || hourlyRate === 0) return;
  
  console.log('[Worth My Time] === Starting price detection ===');
  console.log('[Worth My Time] URL:', window.location.href);
  
  processedPrices.clear();
  
  const hostname = window.location.hostname;
  let totalConverted = 0;
  
  // TIER 1: Check for site-specific detector
  let siteDetector = null;
  for (const [name, detector] of Object.entries(SITE_DETECTORS)) {
    if (detector.detect(hostname)) {
      siteDetector = detector;
      console.log(`[Worth My Time] Matched site-specific detector: ${name}`);
      break;
    }
  }
  
  if (siteDetector) {
    totalConverted = siteDetector.process();
  } else {
    // TIER 2: Use universal detector
    totalConverted = UniversalDetector.process();
  }
  
  // TIER 3: Apply learned patterns (if any)
  totalConverted += LearnedPatterns.process();
  
  console.log(`[Worth My Time] === Detection complete: ${totalConverted} prices converted ===`);
}

// ===================================
// INITIALIZATION
// ===================================

async function init() {
  console.log('[Worth My Time] Initializing 3-Tier Detection System...');
  await loadSettings();
  
  if (!settings.enabled) {
    console.log('[Worth My Time] Extension is disabled');
    return;
  }
  
  if (hourlyRate === 0) {
    console.log('[Worth My Time] No salary configured');
    return;
  }
  
  // Initial detection attempts
  setTimeout(() => processAllPrices(), 500);
  setTimeout(() => processAllPrices(), 1500);
  setTimeout(() => processAllPrices(), 3000);
  
  // For Amazon, be more aggressive
  if (window.location.hostname.includes('amazon')) {
    console.log('[Worth My Time] Amazon detected - using aggressive retry');
    let attempts = 0;
    const interval = setInterval(() => {
      processAllPrices();
      attempts++;
      if (attempts >= 10) {
        clearInterval(interval);
        console.log('[Worth My Time] Amazon aggressive retry complete');
      }
    }, 500);
  }
  
  // Watch for dynamic content
  const observer = new MutationObserver((mutations) => {
    let shouldProcess = false;
    let hasPriceElements = false;
    
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (
            node.matches && (
              node.matches('.a-price') ||
              node.matches('[class*="price"]') ||
              node.querySelector('.a-price') ||
              node.querySelector('[class*="price"]')
            )
          ) {
            hasPriceElements = true;
          }
          shouldProcess = true;
        }
      });
    });
    
    if (shouldProcess) {
      if (hasPriceElements) {
        console.log('[Worth My Time] Price elements added, processing immediately');
        processAllPrices();
      } else {
        setTimeout(() => processAllPrices(), 100);
      }
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  console.log('[Worth My Time] Initialization complete');
}

// Listen for settings updates
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateSettings') {
    console.log('[Worth My Time] Settings updated, reloading settings and re-processing');
    
    // Reload settings and re-process
    loadSettings().then(() => {
      // Clear processed tracking
      processedElements = new WeakSet();
      processedPrices.clear();
      
      // Re-process all prices with new settings
      processAllPrices();
    });
  }
});

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

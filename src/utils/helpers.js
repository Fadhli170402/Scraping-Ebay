const delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const sanitizeText = (text) => {
  if (!text) return '';
  
  return text
    .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
    .replace(/\n/g, ' ') // Replace newlines with space
    .replace(/\t/g, ' ') // Replace tabs with space
    .trim()
    .substring(0, 1000); // Limit length to prevent huge descriptions
};

const formatPrice = (priceText) => {
  if (!priceText) return '-';
  
  // Extract price from common formats
  const priceMatch = priceText.match(/[\$€£¥₹]\s?\d+(?:[,\.]\d{2})?/);
  if (priceMatch) {
    return priceMatch[0];
  }
  
  // Fallback to original text if no standard format found
  return sanitizeText(priceText) || '-';
};

const isValidProduct = (product) => {
  if (!product) return false;
  
  const { product_name, product_price } = product;
  
  // Basic validation
  if (!product_name || product_name === '-' || product_name.trim() === '') {
    return false;
  }
  
  if (!product_price || product_price === '-') {
    return false;
  }
  
  // Filter out common non-product items
  const excludePatterns = [
    /shop on ebay/i,
    /more like this/i,
    /sponsored/i,
    /advertisement/i,
    /^new listing$/i,
    /^hot$/i
  ];
  
  return !excludePatterns.some(pattern => pattern.test(product_name));
};

const retryAsync = async (fn, retries = 3, delayMs = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      
      console.log(`Attempt ${i + 1} failed, retrying in ${delayMs}ms...`);
      await delay(delayMs);
      delayMs *= 2; // Exponential backoff
    }
  }
};

const chunkArray = (array, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

const normalizeUrl = (url) => {
  try {
    const urlObj = new URL(url);
    
    // Remove unnecessary parameters that might cause issues
    const paramsToKeep = ['_nkw', '_sacat', '_from', '_pgn', '_sop'];
    const newParams = new URLSearchParams();
    
    paramsToKeep.forEach(param => {
      if (urlObj.searchParams.has(param)) {
        newParams.set(param, urlObj.searchParams.get(param));
      }
    });
    
    urlObj.search = newParams.toString();
    return urlObj.toString();
    
  } catch (error) {
    return url;
  }
};

module.exports = {
  delay,
  sanitizeText,
  formatPrice,
  isValidProduct,
  retryAsync,
  chunkArray,
  normalizeUrl
};
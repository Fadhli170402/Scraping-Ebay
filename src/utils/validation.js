const validateUrl = (url) => {
  try {
    const urlObj = new URL(url);
    
    // Check if it's an eBay URL
    const validDomains = [
      'www.ebay.com',
      'ebay.com',
      'm.ebay.com'
    ];
    
    if (!validDomains.includes(urlObj.hostname)) {
      return false;
    }
    
    // Check if it's a search URL
    const validPaths = [
      '/sch/',
      '/itm/'
    ];
    
    const isValidPath = validPaths.some(path => urlObj.pathname.startsWith(path));
    
    return isValidPath;
    
  } catch (error) {
    return false;
  }
};

const sanitizeSearchQuery = (query) => {
  if (!query || typeof query !== 'string') {
    return '';
  }
  
  return query
    .trim()
    .replace(/[^\w\s\-]/g, '') // Remove special characters except hyphens
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .substring(0, 100); // Limit length
};

const validatePagination = (page, limit) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 50;
  
  return {
    page: Math.max(1, Math.min(pageNum, 100)), // Max 100 pages
    limit: Math.max(1, Math.min(limitNum, 200)) // Max 200 items per request
  };
};

module.exports = {
  validateUrl,
  sanitizeSearchQuery,
  validatePagination
};
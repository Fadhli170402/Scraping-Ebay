const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Testing eBay Scraper API...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check:', healthResponse.data.status);

    // Test 2: API info
    console.log('\n2. Testing API info endpoint...');
    const infoResponse = await axios.get(`${BASE_URL}/`);
    console.log('✅ API Info:', infoResponse.data.message);

    // Test 3: Scrape endpoint with valid URL
    console.log('\n3. Testing scrape endpoint...');
    const testUrl = 'https://www.ebay.com/sch/i.html?_nkw=nintendo&_sacat=0&_pgn=1';
    
    console.log(`🔍 Scraping: ${testUrl}`);
    console.log('⏳ This may take a while...');
    
    const scrapeResponse = await axios.get(`${BASE_URL}/scrape`, {
      params: {
        url: testUrl,
        maxPages: 2,
        delay: 1000
      },
      timeout: 120000 // 2 minutes timeout
    });

    const { data, metadata } = scrapeResponse.data;
    
    console.log('✅ Scraping Results:');
    console.log(`   📊 Total products: ${metadata.total_products}`);
    console.log(`   ⏱️  Scraping time: ${metadata.scraping_time_seconds}s`);
    
    if (data.length > 0) {
      console.log('\n📝 Sample product:');
      const sample = data[0];
      console.log(`   Name: ${sample.product_name.substring(0, 50)}...`);
      console.log(`   Price: ${sample.product_price}`);
      console.log(`   Description: ${sample.product_description.substring(0, 100)}...`);
    }

    // Test 4: Invalid URL
    console.log('\n4. Testing invalid URL...');
    try {
      await axios.get(`${BASE_URL}/scrape?url=https://google.com`);
    } catch (error) {
      if (error.response.status === 400) {
        console.log('✅ Invalid URL properly rejected');
      }
    }

    console.log('\n🎉 All tests completed successfully!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Run tests
if (require.main === module) {
  testAPI();
}

module.exports = testAPI;
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const axios = require('axios');

puppeteer.use(StealthPlugin());

// Ganti dengan API Key Deepseek kamu
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

// Fungsi minta AI parsing data produk
async function extractWithDeepseek(html) {
    try {
        const response = await axios.post(DEEPSEEK_API_URL, {
            model: "deepseek-chat",
            messages: [
                {
                    role: "system",
                    content: "You are an eBay product detail extractor. Return JSON only."
                },
                {
                    role: "user",
                    content: `
                    Extract the product_name, product_price, and product_description 
                    from the following HTML. Respond in JSON only, example:
                    {
                        "product_name": "...",
                        "product_price": "...",
                        "product_description": "..."
                    }
                    
                    HTML:
                    ${html}
                    `
                }
            ],
            temperature: 0
        }, {
            headers: {
                "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
                "Content-Type": "application/json"
            }
        });

        const text = response.data.choices[0].message.content;
        return JSON.parse(text);
    } catch (err) {
        console.error("[Deepseek ERROR]", err.message);
        return null;
    }
}

async function scrapeEbay(searchUrl) {
    const browser = await puppeteer.launch({
        headless: false,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled',
        ]
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1366, height: 768 });
    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => false });
        Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
        Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
    });

    console.log(`[INFO] Opening search page: ${searchUrl}`);
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 60000 });
    await page.waitForSelector('li.s-item[data-listingid], li.s-card[data-listingid]', { timeout: 60000 });

    const products = await page.$$eval(
        'li.s-item[data-listingid], li.s-card[data-listingid]',
        cards => cards.map(card => {
            const id = card.getAttribute('data-listingid');
            const linkEl = card.querySelector('a');
            return {
                id,
                url: linkEl ? linkEl.href : null
            };
        }).filter(p => p.url && p.id)
    );

    console.log(`[INFO] Found ${products.length} products`);

    const results = [];
    for (let i = 0; i < products.length; i++) {
        const { url } = products[i];
        console.log(`[INFO] Visiting product ${i + 1}/${products.length}: ${url}`);

        try {
            const prodPage = await browser.newPage();
            await prodPage.setUserAgent(await page.evaluate(() => navigator.userAgent));
            await prodPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

            // Tunggu elemen utama muncul biar aman
            await prodPage.waitForSelector('h1.x-item-title__mainTitle, h1 span[itemprop="name"], #itemTitle', { timeout: 30000 });

            const html = await prodPage.content();

            // Coba ambil dengan AI
            let data = await extractWithDeepseek(html);

            // Kalau AI gagal, fallback manual
            if (!data || !data.product_name) {
                const product_name = await prodPage.$eval(
                    'h1.x-item-title__mainTitle, h1 span[itemprop="name"], #itemTitle',
                    el => el.innerText.trim()
                ).catch(() => '-');

                const product_price = await prodPage.$eval(
                    '.x-price-approx__price, .x-price-primary, #prcIsum',
                    el => el.innerText.trim()
                ).catch(() => '-');

                let product_description = '-';
                try {
                    const descIframe = await prodPage.$('iframe#desc_ifr');
                    if (descIframe) {
                        const frame = await descIframe.contentFrame();
                        product_description = await frame.$eval('body', el => el.innerText.trim());
                    } else {
                        product_description = await prodPage.$eval(
                            '#viTabs_0_is, .d-item-description, .x-about-this-item',
                            el => el.innerText.trim()
                        );
                    }
                } catch (err) {
                    product_description = '-';
                }

                data = { product_name, product_price, product_description };
            }

            results.push(data);
            await prodPage.close();
        } catch (err) {
            console.error(`[ERROR] Failed to scrape product ${url}:`, err.message);
        }
    }

    await browser.close();

    return {
        success: true,
        data: results,
        metadata: {
            total_products: results.length,
            search_url: searchUrl,
            timestamp: new Date().toISOString()
        }
    };
}

module.exports = scrapeEbay;

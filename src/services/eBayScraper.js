const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const axios = require('axios');

puppeteer.use(StealthPlugin());

// Ganti dengan API Key Deepseek kamu
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

async function extractWithDeepseek(page) {
    try {
        // EXTRACT TITLE & PRICE SNIPPETS 
        const basicData = await page.evaluate(() => {
            const getText = (selectors) => {
                for (const sel of selectors) {
                    const el = document.querySelector(sel);
                    if (el) return el.innerText.trim();
                }
                return null;
            };

            const getHTML = (selectors) => {
                for (const sel of selectors) {
                    const el = document.querySelector(sel);
                    if (el) return el.outerHTML;
                }
                return null;
            };

            const titleHTML = getHTML([
                'h1.x-item-title__mainTitle',
                'h1 span[itemprop="name"]',
                '#itemTitle'
            ]);

            const priceHTML = getHTML([
                '.x-price-approx__price',
                '.x-price-primary',
                '#prcIsum',
                '.x-price-section'
            ]);

            return {
                titleHTML: titleHTML || '-',
                priceHTML: priceHTML || '-'
            };
        });

        // EXTRACT DESCRIPTION (HANDLE IFRAME & LAZY LOAD)
        let product_description = '-';
        
        try {
            // scroll ke bagian description untuk trigger lazy load
            await page.evaluate(() => {
                const descSection = document.querySelector('#viTabs_0_is, .d-item-description, [data-testid="x-item-description"]');
                if (descSection) {
                    descSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
            
            // Tunggu sebentar untuk lazy load
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Coba dari IFRAME dulu (prioritas utama di eBay)
            const descIframe = await page.$('iframe#desc_ifr');
            if (descIframe) {
                const frame = await descIframe.contentFrame();
                if (frame) {
                    product_description = await frame.$eval('body', el => el.innerText.trim())
                        .catch(() => '-');
                    console.log('[INFO] Description extracted from IFRAME');
                }
            }

            // Kalau iframe gagal, coba selector biasa
            if (product_description === '-') {
                product_description = await page.evaluate(() => {
                    const selectors = [
                        '#viTabs_0_is',
                        '.d-item-description',
                        '.x-about-this-item',
                        '[data-testid="x-item-description"]',
                        '#ds_div', // Selector tambahan eBay
                        '.vim.x-about-this-item'
                    ];

                    for (const sel of selectors) {
                        const el = document.querySelector(sel);
                        if (el && el.innerText.trim().length > 0) {
                            return el.innerText.trim();
                        }
                    }
                    return '-';
                });
                console.log('[INFO] Description extracted from DOM');
            }

            // Limit panjang description (opsional)
            if (product_description.length > 2000) {
                product_description = product_description.slice(0, 2000) + '...';
            }

        } catch (descErr) {
            console.error('[WARN] Failed to extract description:', descErr.message);
            product_description = '-';
        }

        if (basicData.titleHTML === '-' && basicData.priceHTML === '-') {
            return {
                product_name: "-",
                product_price: "-",
                product_description: product_description
            };
        }

        // PROMPT 
        const prompt = `
You are an AI specialized in extracting product data from eBay HTML snippets.

Extract these fields:
- product_name (from titleHTML - extract the exact product title)
- product_price (from priceHTML - extract the price with currency symbol)

RULES:
- Only return a valid JSON object.
- Do NOT include markdown code blocks.
- If a value is missing, return "-".
- Extract exact text, do not modify.

Title HTML:
${basicData.titleHTML}

Price HTML:
${basicData.priceHTML}

Output format:
{"product_name": "...", "product_price": "..."}
        `;

        // ========== 5. REQUEST KE DEEPSEEK ==========
        const response = await axios.post(DEEPSEEK_API_URL, {
            model: "deepseek-chat",
            messages: [
                { role: "system", content: "You are a strict JSON generator. Output valid JSON only." },
                { role: "user", content: prompt }
            ],
            temperature: 0,
            max_tokens: 300
        }, {
            headers: {
                "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
                "Content-Type": "application/json"
            },
            timeout: 20000
        });

        let text = response.data.choices[0].message.content.trim();
        console.log("[RAW AI RESPONSE]", text);

        text = autoFixJSON(text);
        const aiData = JSON.parse(text);

        // ========== 6. GABUNGKAN AI DATA + DESCRIPTION MANUAL ==========
        return {
            product_name: aiData.product_name || "-",
            product_price: aiData.product_price || "-",
            product_description: product_description // Dari ekstraksi manual
        };

    } catch (err) {
        console.error("[DEEPSEEK SAFE ERROR]", err.message);
        return {
            product_name: "-",
            product_price: "-",
            product_description: "-"
        };
    }
}

function autoFixJSON(text) {
    // Kalau sudah valid JSON → langsung dipakai
    try {
        JSON.parse(text);
        return text;
    } catch {}

    // Ambil bagian JSON saja
    const match = text.match(/\{[\s\S]*\}/);
    if (match) text = match[0];

    // Hilangkan trailing comma
    text = text.replace(/,\s*}/g, "}")
               .replace(/,\s*]/g, "]");

    // Replace kutip miring menjadi kutip valid
    text = text.replace(/[“”]/g, '"');

    return text;
};

async function scrapeEbay(searchUrl, maxPage = 1) {
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

    const allResults = [];

    // final URL with _pgn param
    function buildPageUrl(baseUrl, pageNum) {
        if (/_pgn=\d+/i.test(baseUrl)) {
            return baseUrl.replace(/_pgn=\d+/i, `_pgn=${pageNum}`);
        }
        // if url already has query params
        if (baseUrl.includes('?')) {
            return `${baseUrl}&_pgn=${pageNum}`;
        }
        return `${baseUrl}?_pgn=${pageNum}`;
    }

    for (let currentPage = 1; currentPage <= maxPage; currentPage++) {
        const finalURL = buildPageUrl(searchUrl, currentPage);

        console.log("\n=======================================");
        console.log(`Scraping Page ${currentPage} / ${maxPage}`);
        console.log(`URL: ${finalURL}`);
        console.log("=======================================");

        await page.goto(finalURL, { waitUntil: 'networkidle2', timeout: 60000 });

        // tunggu listing muncul
        await page.waitForSelector('li.s-item[data-listingid], li.s-card[data-listingid]', { timeout: 60000 });

        // ambil products untuk halaman ini
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

        console.log(`[INFO] Page ${currentPage} - Found ${products.length} products`);

        // Scraping detail per produk 
        for (let i = 0; i < products.length; i++) {
            const { url } = products[i];
            console.log(`[INFO] (${currentPage}) Visiting product ${i + 1}/${products.length}: ${url}`);

            try {
                const prodPage = await browser.newPage();
                
                const ua = await page.evaluate(() => navigator.userAgent).catch(() => null);
                if (ua) await prodPage.setUserAgent(ua);

                await prodPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

                // Tunggu elemen utama muncul biar aman
                await prodPage.waitForSelector('h1.x-item-title__mainTitle, h1 span[itemprop="name"], #itemTitle', { timeout: 40000 })
                    .catch(() => {}); // jika tidak muncul, lanjut dan fallback menangani

                const html = await prodPage.content();

                // Coba ambil dengan AI
                let data = await extractWithDeepseek(prodPage);
                let extractedBy = "AI-DEEPSEEK";

                // Kalau AI gagal, fallback manual
               if (!data || Object.values(data).every(v => v === "-")) {
                extractedBy = "Manual_Scraping";

                const product_name = await prodPage.$eval(
                    'h1.x-item-title__mainTitle, h1 span[itemprop="name"], #itemTitle, .x-item-title',
                    el => el.innerText.trim()
                ).catch(() => '-');

                const product_price = await prodPage.$eval(
                    '.x-price-approx__price, .x-price-primary, #prcIsum, .x-price-section .ux-textspans',
                    el => el.innerText.trim()
                ).catch(() => '-');

                let product_description = '-';
                try {
                    // Coba iframe dulu
                    const descIframe = await prodPage.$('iframe#desc_ifr');
                    if (descIframe) {
                        const frame = await descIframe.contentFrame();
                        product_description = await frame.$eval('body', el => el.innerText.trim().slice(0, 500));
                    } else {
                        // Coba selector biasa
                        product_description = await prodPage.$eval(
                            '#viTabs_0_is, .d-item-description, .x-about-this-item, [data-testid="x-item-description"]',
                            el => el.innerText.trim().slice(0, 500)
                        ).catch(() => '-');
                    }
                } catch (err) {
                    product_description = '-';
                }

                data = { product_name, product_price, product_description };
            }

                allResults.push({
                    page: currentPage,
                    url,
                    ...data,
                    extracted_by: extractedBy
                });

                await prodPage.close();
            } catch (err) {
                console.error(`[ERROR] Failed to scrape product ${url}:`, err.message);
            }
        } // end product loop per page
    } // end page loop

    await browser.close();

    return {
        success: true,
        maxPage,
        data: allResults,
        metadata: {
            total_products: allResults.length,
            timestamp: new Date().toISOString()
        }
    };
}
module.exports = scrapeEbay;
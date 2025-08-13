
const scrapeEbay = require('../services/eBayScraper');

exports.scrapeProducts = async (req, res) => {
    const { url } = req.query;
    if (!url) {
        return res.status(400).json({ error: 'Missing URL', message: 'Please provide ?url=' });
    }

    try {
        const result = await scrapeEbay(url);
        res.json(result);
    } catch (err) {
        console.error('[ERROR] Scraper failed:', err.message);
        res.status(500).json({ error: 'Scraping failed', message: err.message });
    }
};

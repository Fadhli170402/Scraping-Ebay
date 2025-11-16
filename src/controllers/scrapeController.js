const scrapeEbay = require('../services/eBayScraper');

exports.scrapeProducts = async (req, res) => {
    try{
        const url = req.query.url;
        const maxPage = parseInt(req.query.max) || 1;

        if (!url) {
            return res.status(400).json({
                error: "Missing URL",
                message: "Use the parameter ?url=<ebay_search_url> "
            });
        }

        console.log(`[API] Scraping URL: ${url}`);
        console.log(`[API] Max Page: ${maxPage}`);

        const result = await scrapeEbay(url, maxPage);

        res.json(result)
    }catch (err) {
        res.status(500).json({
            error: "Scraping Failed",
            message: err.message
        });
    }
};
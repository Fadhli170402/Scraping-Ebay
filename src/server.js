const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { RateLimiterMemory } = require('rate-limiter-flexible');
require('dotenv').config();

const scraperController = require('./controllers/scrapeController');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

//Rate Limiter
const rateLimiter = new RateLimiterMemory({
    keyMaker : (req) => req.ip,
    points : 5, // 5 requests
    duration : 60 // per 60 seconds
});

const rateLimiterMiddleware = (req, res, next) =>{
    rateLimiter.consume(req.ip)
        .then(() => {
            next();
        })
        .catch(() => {
            res.status(429).json({
                error: 'Too Many Requests',
                message: 'Rate limit exceeded. Please Try again in a minute.'
            });
        });
};

// Apply rete limiting to all routes
app.use(rateLimiterMiddleware);;

//Routes
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to eBay Scraper API',
        version: '1.0.0',
        endpoints: {
            scrape: '/scraper?url=<ebay_search_url>',
            health: '/health',
        },
        example: '/scraper?url=https://www.ebay.com/sch/i.html?_from=R40&_nkw=nike&_sacat=0&rt=nc&_pgn=1'
    });
});

app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

app.get('/scraper', scraperController.scrapeProducts);

//Error Handling Middleware
app.use((error, req, res, next) => {
    console.error('error: ', error);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Somthing went Wrong'
    });
});

// 404 hendler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'Endpoint not found'
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(' Server Scraping eBay API running on port', PORT);
    console.log(' API Documentation: http://localhost:${PORT}/');
    console.log(' Example : http://localhost:3000/scraper?url=https://www.ebay.com/sch/i.html?_nkw=nike');
})
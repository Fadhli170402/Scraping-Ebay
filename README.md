eBay Scraper API
Aplikasi web scraper untuk mengambil data produk dari eBay secara otomatis. Scraper ini dapat mengekstrak informasi produk seperti nama, harga, dan deskripsi dari halaman pencarian eBay dengan menggunakan teknologi AI untuk pemrosesan data yang lebih baik.
Requirements
Sebelum menjalankan program, pastikan sistem Anda telah terinstall:

Node.js versi 16.0.0 atau lebih tinggi
npm (Node Package Manager)

Cara Mengecek Versi Node.js dan npm:

```
node --version
npm --version
```

Installation:

1.  Clone Repository

    ```
    git clone https://github.com/Fadhli170402/Scraping-Ebay.git
    ```

2.  Install Dependencies

    ```
    npm install
    ```

3.  Install Dependencies

    ```
    cp .env.example .env
    ```

    ```
    masukan DEEPSEEK_API_KEY anda
    ```

4.  Jalankan Program

    ```
    npm start
    ```

Setelah program berhasil dijalankan, Anda dapat menggunakan scraper dengan cara:

1. Buka Browser
2. Jalankan Scraper

```

Salin dan tempelkan URL berikut di address bar browser:
http://localhost:3000/scraper?url=https://www.ebay.com/sch/i.html?_nkw=nike&_pgn=1&max=1

```

3. Hasil Scraping

```

Scraper akan menampilkan hasil dalam format JSON yang berisi:
{
      "page": 1,
      "url": "https://www.ebay.com/itm/127494494789?_skw=nike&epid=28076720590&itmmeta=01KA5D4Q2DVZS3EBSVW6SZMBPG&hash=item1daf439a45:g:L0QAAeSwGP9pF9KD&itmprp=enc%3AAQAKAAAAwFkggFvd1GGDu0w3yXCmi1dzPeTtsdrtm%2F6tm9%2FsCSGmj2SECbmNdYGZY%2FdYHN3IUaN8HRZaBMWPu469gA65l7TstEoHNl%2B%2FI%2B91YKHGCIZGm4EoHEWaAQRFc8g8JM%2BlpcSQ0Eyqhup84rzqL2v9hMZuE3vL0a%2BNc0gtn0Sv2SvXI9A40z%2BBg8XrdPRyeGnnROkd8THcUthIubf0uUF0iGtzM97R151P79pmcDGet8%2FQ3oMUG7aqMnY9y252gA1LxQ%3D%3D%7Ctkp%3ABk9SR8rxkq3RZg",
      "product_name": "Nike Air Jordan Retro 1 Low OG Chicago (2025) HQ6998-600 Sizes 7.5-14 Men’s New",
      "product_price": "IDR2,839,688.79",
      "product_description": "The product is a 2025 release of the Nike Air Jordan Retro 1 Low OG Chicago in red and white colors, designed for men in sizes 7.5-14. This sneaker is a part of the Air Jordan 1 Low model and features a low top shaft style, making it suitable for athletic use. The Retro theme adds a classic touch to the Jordan 1 Low OG silhouette, showcasing the iconic sneaker design that Nike is known for.",
      "extracted_by": "AI-DEEPSEEK"
    },

```

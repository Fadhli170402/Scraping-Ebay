eBay Scraper API
Aplikasi web scraper untuk mengambil data produk dari eBay secara otomatis. Scraper ini dapat mengekstrak informasi produk seperti nama, harga, dan deskripsi dari halaman pencarian eBay dengan menggunakan teknologi AI untuk pemrosesan data yang lebih baik.
Requirements
Sebelum menjalankan program, pastikan sistem Anda telah terinstall:

Node.js versi 16.0.0 atau lebih tinggi
npm (Node Package Manager)

Cara Mengecek Versi Node.js dan npm:
bash
node --version
npm --version

Installation:

1.  Clone Repository

    ```git clone https://github.com/Fadhli170402/Scraping-Ebay.git

    ```

2.  Install Dependencies

    ```npm install

    ```

3.  Install Dependencies

    ````cp .env.example .env
    ```masukan DEEPSEEK_API_KEY anda

    ````

4.  Jalankan Program
    ```npm start

    ```

Setelah program berhasil dijalankan, Anda dapat menggunakan scraper dengan cara:

1. Buka Browser
2. Jalankan Scraper

   ````Salin dan tempelkan URL berikut di address bar browser:
   ```http://localhost:3000/scrape?url=https://www.ebay.com/sch/i.html?_nkw=nike

   ````

3. Hasil Scraping
   ````Scraper akan menampilkan hasil dalam format JSON yang berisi:
   ```product_name: Nama produk
   ```product_price: Harga produk
   ```product_description: Deskripsi lengkap produk
   ````

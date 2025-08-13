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

````

Salin dan tempelkan URL berikut di address bar browser:
http://localhost:3000/scrape?url=https://www.ebay.com/sch/i.html?_nkw=nike

```

3. Hasil Scraping

```

Scraper akan menampilkan hasil dalam format JSON yang berisi:
"success": true,
"data": [
{
"product_name": "NIKE Shox R4 HQ1988-600 University Red Black Metallic Silver Men's Size",
"product_price": "US $141.40",
"product_description": "Description\n\nAll my products are 100% Authentic.\n\nThis item follows Men’s sizing. Please refer to the \"US M\" size listed.\nKindly note that we do not accept returns or exchanges for size-related issues due to incorrect purchases.\n\nA remake of an iconic shoe from the early 2000s, the Nike Shox R4 carries over the futuristic design lines and high-performance cushioning from the original model. Nike Shox technology's cylindrical construction is employed in the heel. It distributes weight to maximize comfort while creating a bold style on the street.\n\n\n\n\n◇Features◇\n\n・Soft and durable synthetic and textile upper.\n\n・Nike Shox technology features a flexible cylinder construction for superior resilience. Recovers its shape under compression to provide exceptional cushioning.\n\n・Improved circular waffle outsole provides exceptional traction.\n\n・Laser-cut vents for enhanced breathability.\n\n\n\n\nPlease feel free to contact us if you have any question.\n\n\n Shipping\n\nWe ship using FedEx, DHL and Japan Post.\n\n Payment\n\nWe usually ship within 5〜10 business days of receiving cleared payment.\n\n\n\n\n International Buyers - Please Note:\n\nImport duties, taxes and charges are not included in the item price or shipping charges.These charges are the buyer’s responsibility.Please check with your country’s customs office to determine what these additional costs will be prior to bidding/buying. These charges are normally collected by the delivering freight (shipping) company or when you pick the item up do not confuse them for additional shipping charges. I do not mark merchandise values below value or mark items as \"gifts\" - US and International government regulations prohibit such behavior."
},

```

```
````

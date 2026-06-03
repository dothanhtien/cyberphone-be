import { Brand } from '@/brands/entities';
import { Category } from '@/categories/entities';
import { ProductVariantStockStatus } from '@/common/enums';
import { ProductAttribute } from '@/products/entities/product-attribute.entity';
import { ProductCategory } from '@/products/entities/product-category.entity';
import { ProductVariant } from '@/products/entities/product-variant.entity';
import { Product } from '@/products/entities/product.entity';
import { VariantAttribute } from '@/products/entities/variant-attribute.entity';
import { Injectable, Logger } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';

interface VariantSeed {
  sku: string;
  name: string;
  price: string;
  salePrice?: string;
  costPrice?: string;
  stockQuantity: number;
  isDefault: boolean;
  attributes: Record<string, string>;
}

interface ProductSeed {
  name: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  brandSlug: string;
  categorySlug: string;
  isFeatured: boolean;
  isBestseller: boolean;
  attributeKeys: { key: string; display: string }[];
  variants: VariantSeed[];
}

const PRODUCTS: ProductSeed[] = [
  {
    name: 'iPhone 15 Pro',
    slug: 'iphone-15-pro',
    shortDescription:
      'Apple iPhone 15 Pro with A17 Pro chip, titanium design, and advanced camera system.',
    longDescription:
      'The iPhone 15 Pro features the powerful A17 Pro chip built on 3-nanometer technology, a durable titanium frame, and a versatile 48MP main camera with support for Apple ProRAW and ProRes video. Available in multiple storage options.',
    brandSlug: 'apple',
    categorySlug: 'ios',
    isFeatured: true,
    isBestseller: true,
    attributeKeys: [
      { key: 'color', display: 'Color' },
      { key: 'storage', display: 'Storage' },
      { key: 'ram', display: 'RAM' },
    ],
    variants: [
      {
        sku: 'IPH15PRO-128-BT',
        name: 'iPhone 15 Pro 128GB Black Titanium',
        price: '25990000',
        salePrice: '23990000',
        costPrice: '17000000',
        stockQuantity: 50,
        isDefault: true,
        attributes: { color: 'Black Titanium', storage: '128GB', ram: '8GB' },
      },
      {
        sku: 'IPH15PRO-256-NT',
        name: 'iPhone 15 Pro 256GB Natural Titanium',
        price: '28990000',
        costPrice: '19000000',
        stockQuantity: 40,
        isDefault: false,
        attributes: { color: 'Natural Titanium', storage: '256GB', ram: '8GB' },
      },
      {
        sku: 'IPH15PRO-512-WT',
        name: 'iPhone 15 Pro 512GB White Titanium',
        price: '34990000',
        costPrice: '22500000',
        stockQuantity: 25,
        isDefault: false,
        attributes: { color: 'White Titanium', storage: '512GB', ram: '8GB' },
      },
      {
        sku: 'IPH15PRO-1T-BT',
        name: 'iPhone 15 Pro 1TB Black Titanium',
        price: '41990000',
        costPrice: '27000000',
        stockQuantity: 15,
        isDefault: false,
        attributes: { color: 'Black Titanium', storage: '1TB', ram: '8GB' },
      },
    ],
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    slug: 'samsung-galaxy-s24-ultra',
    shortDescription:
      'Samsung Galaxy S24 Ultra with Snapdragon 8 Gen 3, built-in S Pen, and 200MP camera.',
    longDescription:
      'The Galaxy S24 Ultra redefines premium Android with the Snapdragon 8 Gen 3 processor, an integrated S Pen, and a 200MP quad-camera system. Its titanium frame and 6.8-inch QHD+ Dynamic AMOLED display deliver an unmatched experience.',
    brandSlug: 'samsung',
    categorySlug: 'android',
    isFeatured: true,
    isBestseller: true,
    attributeKeys: [
      { key: 'color', display: 'Color' },
      { key: 'storage', display: 'Storage' },
      { key: 'ram', display: 'RAM' },
    ],
    variants: [
      {
        sku: 'SGS24U-256-TBK',
        name: 'Galaxy S24 Ultra 256GB Titanium Black',
        price: '29990000',
        salePrice: '27990000',
        costPrice: '19500000',
        stockQuantity: 45,
        isDefault: true,
        attributes: {
          color: 'Titanium Black',
          storage: '256GB',
          ram: '12GB',
        },
      },
      {
        sku: 'SGS24U-512-TGY',
        name: 'Galaxy S24 Ultra 512GB Titanium Gray',
        price: '33990000',
        costPrice: '22000000',
        stockQuantity: 30,
        isDefault: false,
        attributes: { color: 'Titanium Gray', storage: '512GB', ram: '12GB' },
      },
      {
        sku: 'SGS24U-1T-TVT',
        name: 'Galaxy S24 Ultra 1TB Titanium Violet',
        price: '39990000',
        costPrice: '26000000',
        stockQuantity: 10,
        isDefault: false,
        attributes: { color: 'Titanium Violet', storage: '1TB', ram: '12GB' },
      },
    ],
  },
  {
    name: 'Google Pixel 9 Pro',
    slug: 'google-pixel-9-pro',
    shortDescription:
      'Google Pixel 9 Pro with Google Tensor G4, advanced AI features, and triple camera system.',
    longDescription:
      'The Pixel 9 Pro is powered by the Google Tensor G4 chip with on-device AI, featuring a 50MP triple camera system with advanced computational photography. Enjoy seven years of OS and security updates.',
    brandSlug: 'google',
    categorySlug: 'android',
    isFeatured: true,
    isBestseller: false,
    attributeKeys: [
      { key: 'color', display: 'Color' },
      { key: 'storage', display: 'Storage' },
      { key: 'ram', display: 'RAM' },
    ],
    variants: [
      {
        sku: 'GPX9PRO-128-OB',
        name: 'Pixel 9 Pro 128GB Obsidian',
        price: '23990000',
        salePrice: '21990000',
        costPrice: '15000000',
        stockQuantity: 40,
        isDefault: true,
        attributes: { color: 'Obsidian', storage: '128GB', ram: '16GB' },
      },
      {
        sku: 'GPX9PRO-256-PR',
        name: 'Pixel 9 Pro 256GB Porcelain',
        price: '25990000',
        costPrice: '16500000',
        stockQuantity: 35,
        isDefault: false,
        attributes: { color: 'Porcelain', storage: '256GB', ram: '16GB' },
      },
      {
        sku: 'GPX9PRO-512-HZ',
        name: 'Pixel 9 Pro 512GB Hazel',
        price: '31990000',
        costPrice: '20000000',
        stockQuantity: 20,
        isDefault: false,
        attributes: { color: 'Hazel', storage: '512GB', ram: '16GB' },
      },
    ],
  },
  {
    name: 'Xiaomi 14 Ultra',
    slug: 'xiaomi-14-ultra',
    shortDescription:
      'Xiaomi 14 Ultra with Snapdragon 8 Gen 3, Leica quad-camera, and 90W wireless charging.',
    longDescription:
      'The Xiaomi 14 Ultra pushes smartphone photography to new heights with a Leica-engineered 50MP quad-camera system. Powered by Snapdragon 8 Gen 3 and featuring 90W wireless charging and a 5000mAh battery.',
    brandSlug: 'xiaomi',
    categorySlug: 'android',
    isFeatured: false,
    isBestseller: false,
    attributeKeys: [
      { key: 'color', display: 'Color' },
      { key: 'storage', display: 'Storage' },
      { key: 'ram', display: 'RAM' },
    ],
    variants: [
      {
        sku: 'XMI14U-256-BK',
        name: 'Xiaomi 14 Ultra 256GB Black',
        price: '25990000',
        costPrice: '16500000',
        stockQuantity: 35,
        isDefault: true,
        attributes: { color: 'Black', storage: '256GB', ram: '12GB' },
      },
      {
        sku: 'XMI14U-512-WH',
        name: 'Xiaomi 14 Ultra 512GB White',
        price: '29990000',
        costPrice: '19000000',
        stockQuantity: 20,
        isDefault: false,
        attributes: { color: 'White', storage: '512GB', ram: '16GB' },
      },
    ],
  },
  {
    name: 'OnePlus 12',
    slug: 'oneplus-12',
    shortDescription:
      'OnePlus 12 with Snapdragon 8 Gen 3, Hasselblad triple camera, and 100W SUPERVOOC charging.',
    longDescription:
      'The OnePlus 12 delivers flagship performance with Snapdragon 8 Gen 3, a Hasselblad-tuned triple camera system, and blazing-fast 100W SUPERVOOC wired charging plus 50W AIRVOOC wireless charging.',
    brandSlug: 'oneplus',
    categorySlug: 'android',
    isFeatured: false,
    isBestseller: false,
    attributeKeys: [
      { key: 'color', display: 'Color' },
      { key: 'storage', display: 'Storage' },
      { key: 'ram', display: 'RAM' },
    ],
    variants: [
      {
        sku: 'OP12-256-SBK',
        name: 'OnePlus 12 256GB Silky Black',
        price: '18990000',
        salePrice: '17490000',
        costPrice: '12000000',
        stockQuantity: 60,
        isDefault: true,
        attributes: { color: 'Silky Black', storage: '256GB', ram: '12GB' },
      },
      {
        sku: 'OP12-256-FG',
        name: 'OnePlus 12 256GB Flowy Emerald',
        price: '18990000',
        costPrice: '12000000',
        stockQuantity: 45,
        isDefault: false,
        attributes: { color: 'Flowy Emerald', storage: '256GB', ram: '12GB' },
      },
      {
        sku: 'OP12-512-SBK',
        name: 'OnePlus 12 512GB Silky Black',
        price: '21990000',
        costPrice: '13500000',
        stockQuantity: 30,
        isDefault: false,
        attributes: { color: 'Silky Black', storage: '512GB', ram: '16GB' },
      },
    ],
  },
  {
    name: 'MacBook Pro 16 M4 Pro',
    slug: 'macbook-pro-16-m4-pro',
    shortDescription:
      'Apple MacBook Pro 16-inch with M4 Pro chip, Liquid Retina XDR display, and up to 24 hours battery life.',
    longDescription:
      'The MacBook Pro 16-inch with M4 Pro delivers extraordinary performance for demanding workflows. Featuring a stunning Liquid Retina XDR display, up to 48GB unified memory, and all-day battery life, it is the ultimate pro laptop for developers, designers, and creators.',
    brandSlug: 'apple',
    categorySlug: 'laptops',
    isFeatured: true,
    isBestseller: true,
    attributeKeys: [
      { key: 'color', display: 'Color' },
      { key: 'storage', display: 'Storage' },
      { key: 'ram', display: 'RAM' },
    ],
    variants: [
      {
        sku: 'MBP16-M4P-24-512-SB',
        name: 'MacBook Pro 16 M4 Pro 24GB 512GB Space Black',
        price: '62990000',
        salePrice: '59990000',
        costPrice: '42000000',
        stockQuantity: 30,
        isDefault: true,
        attributes: { color: 'Space Black', storage: '512GB', ram: '24GB' },
      },
      {
        sku: 'MBP16-M4P-24-1T-SB',
        name: 'MacBook Pro 16 M4 Pro 24GB 1TB Space Black',
        price: '69990000',
        costPrice: '46000000',
        stockQuantity: 20,
        isDefault: false,
        attributes: { color: 'Space Black', storage: '1TB', ram: '24GB' },
      },
      {
        sku: 'MBP16-M4P-48-1T-SL',
        name: 'MacBook Pro 16 M4 Pro 48GB 1TB Silver',
        price: '79990000',
        costPrice: '52000000',
        stockQuantity: 15,
        isDefault: false,
        attributes: { color: 'Silver', storage: '1TB', ram: '48GB' },
      },
      {
        sku: 'MBP16-M4P-48-2T-SL',
        name: 'MacBook Pro 16 M4 Pro 48GB 2TB Silver',
        price: '89990000',
        costPrice: '60000000',
        stockQuantity: 10,
        isDefault: false,
        attributes: { color: 'Silver', storage: '2TB', ram: '48GB' },
      },
    ],
  },
  {
    name: 'MacBook Air 13 M3',
    slug: 'macbook-air-13-m3',
    shortDescription:
      'Apple MacBook Air 13-inch with M3 chip, fanless design, and all-day battery life.',
    longDescription:
      "The MacBook Air 13-inch with M3 is impossibly thin and light, yet delivers outstanding performance for everyday tasks and creative work. Its fanless design, stunning Liquid Retina display, and MagSafe charging make it the world's best consumer laptop.",
    brandSlug: 'apple',
    categorySlug: 'laptops',
    isFeatured: true,
    isBestseller: true,
    attributeKeys: [
      { key: 'color', display: 'Color' },
      { key: 'storage', display: 'Storage' },
      { key: 'ram', display: 'RAM' },
    ],
    variants: [
      {
        sku: 'MBA13-M3-8-256-MN',
        name: 'MacBook Air 13 M3 8GB 256GB Midnight',
        price: '27990000',
        salePrice: '24990000',
        costPrice: '17500000',
        stockQuantity: 50,
        isDefault: true,
        attributes: { color: 'Midnight', storage: '256GB', ram: '8GB' },
      },
      {
        sku: 'MBA13-M3-8-512-ST',
        name: 'MacBook Air 13 M3 8GB 512GB Starlight',
        price: '32990000',
        costPrice: '20500000',
        stockQuantity: 40,
        isDefault: false,
        attributes: { color: 'Starlight', storage: '512GB', ram: '8GB' },
      },
      {
        sku: 'MBA13-M3-16-512-SG',
        name: 'MacBook Air 13 M3 16GB 512GB Space Gray',
        price: '37990000',
        costPrice: '24000000',
        stockQuantity: 30,
        isDefault: false,
        attributes: { color: 'Space Gray', storage: '512GB', ram: '16GB' },
      },
      {
        sku: 'MBA13-M3-24-1T-MN',
        name: 'MacBook Air 13 M3 24GB 1TB Midnight',
        price: '47990000',
        costPrice: '31000000',
        stockQuantity: 15,
        isDefault: false,
        attributes: { color: 'Midnight', storage: '1TB', ram: '24GB' },
      },
    ],
  },
  {
    name: 'Samsung Galaxy Book4 Pro 360',
    slug: 'samsung-galaxy-book4-pro-360',
    shortDescription:
      'Samsung Galaxy Book4 Pro 360 with Intel Core Ultra 7, 2-in-1 AMOLED touchscreen, and S Pen.',
    longDescription:
      'The Galaxy Book4 Pro 360 is a premium 2-in-1 laptop featuring a 16-inch 3K AMOLED touchscreen, Intel Core Ultra 7 processor, and an included S Pen. Seamlessly connect with your Galaxy ecosystem for a fluid multi-device experience.',
    brandSlug: 'samsung',
    categorySlug: 'laptops',
    isFeatured: false,
    isBestseller: false,
    attributeKeys: [
      { key: 'color', display: 'Color' },
      { key: 'storage', display: 'Storage' },
      { key: 'ram', display: 'RAM' },
    ],
    variants: [
      {
        sku: 'GBK4P360-16-512-MN',
        name: 'Galaxy Book4 Pro 360 16GB 512GB Moonstone Gray',
        price: '39990000',
        salePrice: '37490000',
        costPrice: '25500000',
        stockQuantity: 25,
        isDefault: true,
        attributes: { color: 'Moonstone Gray', storage: '512GB', ram: '16GB' },
      },
      {
        sku: 'GBK4P360-16-1T-MN',
        name: 'Galaxy Book4 Pro 360 16GB 1TB Moonstone Gray',
        price: '44990000',
        costPrice: '28500000',
        stockQuantity: 20,
        isDefault: false,
        attributes: { color: 'Moonstone Gray', storage: '1TB', ram: '16GB' },
      },
      {
        sku: 'GBK4P360-32-1T-SL',
        name: 'Galaxy Book4 Pro 360 32GB 1TB Silver',
        price: '49990000',
        costPrice: '32000000',
        stockQuantity: 10,
        isDefault: false,
        attributes: { color: 'Silver', storage: '1TB', ram: '32GB' },
      },
    ],
  },
  {
    name: 'Apple Watch Series 10',
    slug: 'apple-watch-series-10',
    shortDescription:
      'Apple Watch Series 10 with the largest display ever, sleep apnea detection, and faster charging.',
    longDescription:
      'Apple Watch Series 10 features the thinnest Apple Watch design ever with the largest display, advanced health sensors including sleep apnea detection and depth gauge, and up to 18 hours of battery life. Available in aluminium and titanium finishes.',
    brandSlug: 'apple',
    categorySlug: 'smart-watches',
    isFeatured: true,
    isBestseller: true,
    attributeKeys: [
      { key: 'color', display: 'Color' },
      { key: 'casesize', display: 'Case Size' },
      { key: 'material', display: 'Material' },
    ],
    variants: [
      {
        sku: 'AW10-42-AL-JB',
        name: 'Apple Watch Series 10 42mm Jet Black Aluminium',
        price: '9990000',
        salePrice: '9490000',
        costPrice: '6500000',
        stockQuantity: 60,
        isDefault: true,
        attributes: {
          color: 'Jet Black',
          casesize: '42mm',
          material: 'Aluminium',
        },
      },
      {
        sku: 'AW10-42-AL-SL',
        name: 'Apple Watch Series 10 42mm Silver Aluminium',
        price: '9990000',
        costPrice: '6500000',
        stockQuantity: 50,
        isDefault: false,
        attributes: {
          color: 'Silver',
          casesize: '42mm',
          material: 'Aluminium',
        },
      },
      {
        sku: 'AW10-46-AL-RG',
        name: 'Apple Watch Series 10 46mm Rose Gold Aluminium',
        price: '10990000',
        costPrice: '7200000',
        stockQuantity: 40,
        isDefault: false,
        attributes: {
          color: 'Rose Gold',
          casesize: '46mm',
          material: 'Aluminium',
        },
      },
      {
        sku: 'AW10-46-TI-SL',
        name: 'Apple Watch Series 10 46mm Natural Titanium',
        price: '17990000',
        costPrice: '11500000',
        stockQuantity: 20,
        isDefault: false,
        attributes: {
          color: 'Natural Titanium',
          casesize: '46mm',
          material: 'Titanium',
        },
      },
      {
        sku: 'AW10-46-TI-BK',
        name: 'Apple Watch Series 10 46mm Black Titanium',
        price: '17990000',
        costPrice: '11500000',
        stockQuantity: 15,
        isDefault: false,
        attributes: {
          color: 'Black Titanium',
          casesize: '46mm',
          material: 'Titanium',
        },
      },
    ],
  },
  {
    name: 'Samsung Galaxy Watch 7',
    slug: 'samsung-galaxy-watch-7',
    shortDescription:
      'Samsung Galaxy Watch 7 with advanced health tracking, AI-powered insights, and Galaxy AI features.',
    longDescription:
      'The Galaxy Watch 7 brings powerful Galaxy AI to your wrist, offering advanced sleep coaching, body composition analysis, and energy score tracking. Powered by a 3nm processor for exceptional performance and efficiency.',
    brandSlug: 'samsung',
    categorySlug: 'smart-watches',
    isFeatured: true,
    isBestseller: true,
    attributeKeys: [
      { key: 'color', display: 'Color' },
      { key: 'casesize', display: 'Case Size' },
    ],
    variants: [
      {
        sku: 'SGW7-40-GG',
        name: 'Galaxy Watch 7 40mm Green',
        price: '7490000',
        salePrice: '6990000',
        costPrice: '4800000',
        stockQuantity: 55,
        isDefault: true,
        attributes: { color: 'Green', casesize: '40mm' },
      },
      {
        sku: 'SGW7-40-CR',
        name: 'Galaxy Watch 7 40mm Cream',
        price: '7490000',
        costPrice: '4800000',
        stockQuantity: 50,
        isDefault: false,
        attributes: { color: 'Cream', casesize: '40mm' },
      },
      {
        sku: 'SGW7-44-GR',
        name: 'Galaxy Watch 7 44mm Green',
        price: '7990000',
        costPrice: '5200000',
        stockQuantity: 40,
        isDefault: false,
        attributes: { color: 'Green', casesize: '44mm' },
      },
      {
        sku: 'SGW7-44-SL',
        name: 'Galaxy Watch 7 44mm Silver',
        price: '7990000',
        costPrice: '5200000',
        stockQuantity: 35,
        isDefault: false,
        attributes: { color: 'Silver', casesize: '44mm' },
      },
    ],
  },
  {
    name: 'Google Pixel Watch 3',
    slug: 'google-pixel-watch-3',
    shortDescription:
      'Google Pixel Watch 3 with Fitbit health features, loss of pulse detection, and up to 24 hours battery.',
    longDescription:
      'Pixel Watch 3 combines the best of Google and Fitbit into a refined circular design. It features loss of pulse detection, ECG, advanced running metrics, and seamless integration with Android phones via the Pixel ecosystem.',
    brandSlug: 'google',
    categorySlug: 'smart-watches',
    isFeatured: false,
    isBestseller: false,
    attributeKeys: [
      { key: 'color', display: 'Color' },
      { key: 'casesize', display: 'Case Size' },
    ],
    variants: [
      {
        sku: 'GPW3-41-OB',
        name: 'Pixel Watch 3 41mm Obsidian',
        price: '8990000',
        salePrice: '7490000',
        costPrice: '5500000',
        stockQuantity: 40,
        isDefault: true,
        attributes: { color: 'Obsidian', casesize: '41mm' },
      },
      {
        sku: 'GPW3-41-PR',
        name: 'Pixel Watch 3 41mm Porcelain',
        price: '8990000',
        costPrice: '5500000',
        stockQuantity: 35,
        isDefault: false,
        attributes: { color: 'Porcelain', casesize: '41mm' },
      },
      {
        sku: 'GPW3-45-OB',
        name: 'Pixel Watch 3 45mm Obsidian',
        price: '11490000',
        costPrice: '7200000',
        stockQuantity: 30,
        isDefault: false,
        attributes: { color: 'Obsidian', casesize: '45mm' },
      },
      {
        sku: 'GPW3-45-HZ',
        name: 'Pixel Watch 3 45mm Hazel',
        price: '11490000',
        costPrice: '7200000',
        stockQuantity: 25,
        isDefault: false,
        attributes: { color: 'Hazel', casesize: '45mm' },
      },
    ],
  },
  {
    name: 'Xiaomi Watch S3',
    slug: 'xiaomi-watch-s3',
    shortDescription:
      'Xiaomi Watch S3 with AMOLED display, 15-day battery life, and comprehensive health monitoring.',
    longDescription:
      'The Xiaomi Watch S3 delivers premium smartwatch features at an accessible price. Its large 1.43-inch AMOLED display, up to 15 days of battery life, and over 150 workout modes make it an excellent choice for fitness enthusiasts.',
    brandSlug: 'xiaomi',
    categorySlug: 'smart-watches',
    isFeatured: false,
    isBestseller: false,
    attributeKeys: [{ key: 'color', display: 'Color' }],
    variants: [
      {
        sku: 'XWS3-BK',
        name: 'Xiaomi Watch S3 Black',
        price: '4990000',
        salePrice: '4490000',
        costPrice: '3000000',
        stockQuantity: 70,
        isDefault: true,
        attributes: { color: 'Black' },
      },
      {
        sku: 'XWS3-SL',
        name: 'Xiaomi Watch S3 Silver',
        price: '4990000',
        costPrice: '3000000',
        stockQuantity: 60,
        isDefault: false,
        attributes: { color: 'Silver' },
      },
      {
        sku: 'XWS3-GD',
        name: 'Xiaomi Watch S3 Gold',
        price: '4990000',
        costPrice: '3000000',
        stockQuantity: 40,
        isDefault: false,
        attributes: { color: 'Gold' },
      },
    ],
  },
  {
    name: 'Xiaomi Mi Notebook Pro X 15',
    slug: 'xiaomi-mi-notebook-pro-x-15',
    shortDescription:
      'Xiaomi Mi Notebook Pro X 15 with Intel Core i9, OLED display, and NVIDIA RTX 3050 Ti graphics.',
    longDescription:
      'The Mi Notebook Pro X 15 combines a vivid 3.5K OLED display with powerful Intel Core i9 performance and dedicated NVIDIA RTX graphics, making it ideal for creative professionals and power users who demand both visual fidelity and raw computing power.',
    brandSlug: 'xiaomi',
    categorySlug: 'laptops',
    isFeatured: false,
    isBestseller: false,
    attributeKeys: [
      { key: 'color', display: 'Color' },
      { key: 'storage', display: 'Storage' },
      { key: 'ram', display: 'RAM' },
    ],
    variants: [
      {
        sku: 'XMNBPX15-16-512-SL',
        name: 'Mi Notebook Pro X 15 16GB 512GB Silver',
        price: '29990000',
        salePrice: '26990000',
        costPrice: '18500000',
        stockQuantity: 20,
        isDefault: true,
        attributes: { color: 'Silver', storage: '512GB', ram: '16GB' },
      },
      {
        sku: 'XMNBPX15-32-1T-SL',
        name: 'Mi Notebook Pro X 15 32GB 1TB Silver',
        price: '37990000',
        costPrice: '23500000',
        stockQuantity: 15,
        isDefault: false,
        attributes: { color: 'Silver', storage: '1TB', ram: '32GB' },
      },
    ],
  },
  {
    name: 'iPhone 17',
    slug: 'iphone-17',
    shortDescription:
      'Apple iPhone 17 with A19 chip, redesigned aluminum frame, and improved camera system.',
    longDescription:
      "The iPhone 17 introduces Apple's A19 chip for next-generation performance, a thinner aluminum design, and an upgraded 48MP main camera with enhanced computational photography. It features a 6.1-inch Super Retina XDR display, USB-C connectivity, and up to 26 hours of video playback battery life.",
    brandSlug: 'apple',
    categorySlug: 'ios',
    isFeatured: true,
    isBestseller: false,
    attributeKeys: [
      { key: 'color', display: 'Color' },
      { key: 'storage', display: 'Storage' },
      { key: 'ram', display: 'RAM' },
    ],
    variants: [
      {
        sku: 'IPH17-128-BK',
        name: 'iPhone 17 128GB Black',
        price: '27990000',
        salePrice: '25990000',
        costPrice: '18000000',
        stockQuantity: 60,
        isDefault: true,
        attributes: { color: 'Black', storage: '128GB', ram: '8GB' },
      },
      {
        sku: 'IPH17-128-WH',
        name: 'iPhone 17 128GB White',
        price: '27990000',
        salePrice: '25990000',
        costPrice: '18000000',
        stockQuantity: 50,
        isDefault: false,
        attributes: { color: 'White', storage: '128GB', ram: '8GB' },
      },
      {
        sku: 'IPH17-256-BK',
        name: 'iPhone 17 256GB Black',
        price: '31990000',
        costPrice: '21000000',
        stockQuantity: 45,
        isDefault: false,
        attributes: { color: 'Black', storage: '256GB', ram: '8GB' },
      },
      {
        sku: 'IPH17-256-PK',
        name: 'iPhone 17 256GB Pink',
        price: '31990000',
        costPrice: '21000000',
        stockQuantity: 40,
        isDefault: false,
        attributes: { color: 'Pink', storage: '256GB', ram: '8GB' },
      },
      {
        sku: 'IPH17-512-WH',
        name: 'iPhone 17 512GB White',
        price: '37990000',
        costPrice: '24500000',
        stockQuantity: 25,
        isDefault: false,
        attributes: { color: 'White', storage: '512GB', ram: '8GB' },
      },
    ],
  },
];

@Injectable()
export class SeedProductsRunner {
  private readonly logger = new Logger(SeedProductsRunner.name);

  constructor(private readonly dataSource: DataSource) {}

  async run(): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const brandRepo = manager.getRepository(Brand);
      const categoryRepo = manager.getRepository(Category);

      for (const productSeed of PRODUCTS) {
        const productRepo = manager.getRepository(Product);
        const existing = await productRepo.findOne({
          where: { slug: productSeed.slug, isActive: true },
        });

        if (existing) {
          this.logger.log(`Product already exists: ${productSeed.name}`);
          continue;
        }

        const brand = await brandRepo.findOne({
          where: { slug: productSeed.brandSlug, isActive: true },
        });

        if (!brand) {
          this.logger.warn(
            `Brand not found: ${productSeed.brandSlug} — skipping ${productSeed.name}`,
          );
          continue;
        }

        const category = await categoryRepo.findOne({
          where: { slug: productSeed.categorySlug, isActive: true },
        });

        if (!category) {
          this.logger.warn(
            `Category not found: ${productSeed.categorySlug} — skipping ${productSeed.name}`,
          );
          continue;
        }

        const product = await this.createProduct(
          manager,
          productSeed,
          brand.id,
        );
        await this.createProductCategory(manager, product.id, category.id);
        const attrMap = await this.createProductAttributes(
          manager,
          product.id,
          productSeed.attributeKeys,
        );
        await this.createVariants(
          manager,
          product.id,
          productSeed.variants,
          attrMap,
        );

        this.logger.log(`Created product: ${productSeed.name}`);
      }
    });
  }

  private async createProduct(
    manager: EntityManager,
    seed: ProductSeed,
    brandId: string,
  ): Promise<Product> {
    const repo = manager.getRepository(Product);
    return repo.save(
      repo.create({
        name: seed.name,
        slug: seed.slug,
        shortDescription: seed.shortDescription,
        longDescription: seed.longDescription,
        status: 'active',
        isFeatured: seed.isFeatured,
        isBestseller: seed.isBestseller,
        brandId,
        createdBy: 'system',
      }),
    );
  }

  private async createProductCategory(
    manager: EntityManager,
    productId: string,
    categoryId: string,
  ): Promise<void> {
    const repo = manager.getRepository(ProductCategory);
    await repo.save(repo.create({ productId, categoryId }));
  }

  private async createProductAttributes(
    manager: EntityManager,
    productId: string,
    attributeKeys: { key: string; display: string }[],
  ): Promise<Map<string, string>> {
    const repo = manager.getRepository(ProductAttribute);
    const attrMap = new Map<string, string>();

    for (let i = 0; i < attributeKeys.length; i++) {
      const { key, display } = attributeKeys[i];
      const saved = await repo.save(
        repo.create({
          productId,
          attributeKey: key,
          attributeKeyDisplay: display,
          displayOrder: i,
          createdBy: 'system',
        }),
      );
      attrMap.set(key, saved.id);
    }

    return attrMap;
  }

  private async createVariants(
    manager: EntityManager,
    productId: string,
    variants: VariantSeed[],
    attrMap: Map<string, string>,
  ): Promise<void> {
    const variantRepo = manager.getRepository(ProductVariant);
    const variantAttrRepo = manager.getRepository(VariantAttribute);

    for (const v of variants) {
      const stockStatus =
        v.stockQuantity > 0
          ? ProductVariantStockStatus.IN_STOCK
          : ProductVariantStockStatus.OUT_OF_STOCK;

      const variant = await variantRepo.save(
        variantRepo.create({
          productId,
          sku: v.sku,
          name: v.name,
          price: v.price,
          salePrice: v.salePrice ?? null,
          costPrice: v.costPrice ?? null,
          stockQuantity: v.stockQuantity,
          stockStatus,
          isDefault: v.isDefault,
          createdBy: 'system',
        }),
      );

      for (const [key, value] of Object.entries(v.attributes)) {
        const productAttributeId = attrMap.get(key);
        if (!productAttributeId) {
          throw new Error(
            `Unknown attribute key "${key}" for variant "${v.sku}" (product ${productId})`,
          );
        }

        await variantAttrRepo.save(
          variantAttrRepo.create({
            variantId: variant.id,
            productAttributeId,
            attributeValue: value,
            attributeValueDisplay: value,
            createdBy: 'system',
          }),
        );
      }
    }
  }
}

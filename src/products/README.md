# Product Module

## Overview

The product module handles product management for admin users and product discovery for the storefront.

It covers:

- core product records
- product-to-category assignments
- product images and media assets
- product-level attributes
- storefront product listing and detail retrieval

Related but separate responsibility:

- product variant creation and maintenance live in `src/product-variants`

## Module Composition

Main files:

- `src/products/products.module.ts`: module wiring
- `src/products/admin/admin-products.controller.ts`: admin product endpoints
- `src/products/admin/admin-products.service.ts`: admin product orchestration
- `src/products/admin/admin-product-attributes.controller.ts`: admin attribute read endpoint
- `src/products/admin/admin-product-attributes.service.ts`: attribute create/sync logic
- `src/products/admin/admin-product-images.service.ts`: image metadata sync and media-asset mapping
- `src/products/admin/admin-product-categories.service.ts`: category assignment sync
- `src/products/admin/admin-product-validators.service.ts`: slug, brand, category, and upload validation
- `src/products/storefront/storefront-products.controller.ts`: public storefront endpoints
- `src/products/storefront/storefront-products.service.ts`: storefront query layer

Dependencies:

- `BrandsModule`
- `CategoriesModule`
- `StorageModule`
- `MediaModule`

## Domain Model

### Product

Key fields:

- `id`
- `name`
- `slug`
- `shortDescription`
- `longDescription`
- `status`
- `isFeatured`
- `isBestseller`
- `brandId`
- `isActive`
- `createdAt`
- `createdBy`
- `updatedAt`
- `updatedBy`

Important constraint:

- `slug` must be unique among active products

Product statuses used by this module:

- `draft`
- `active`
- `inactive`
- `discontinued`

### Product Category

Join table between products and categories.

Important constraint:

- each `productId + categoryId` pair must be unique

### Product Attribute

Defines product-level attribute keys such as `color`, `storage`, or `size` that variants can reference later.

Key fields:

- `id`
- `productId`
- `attributeKey`
- `attributeKeyDisplay`
- `displayOrder`
- `isActive`

Important constraints:

- active `attributeKey` must be unique per product
- active `displayOrder` must be unique per product

### Product Image

Stores image metadata for a product and links to uploaded media through `media_assets`.

Key fields:

- `id`
- `productId`
- `variantId`
- `imageType`
- `altText`
- `title`
- `displayOrder`
- `isActive`

Supported image types:

- `main`
- `thumbnail`
- `gallery`

## Ownership Boundaries

This module owns:

- product CRUD
- category linking
- image metadata and media asset records
- product attribute CRUD-by-sync
- storefront list/detail reads

This module does not own:

- product variant CRUD
- variant attribute values

Those are implemented in `src/product-variants`, although storefront product detail queries include variant data for convenience.

## Admin API

Base path: `/admin/products`

These routes are protected by the app-wide JWT guard unless another module marks them public. The product admin controllers themselves do not use `@Public()`.

### `POST /admin/products`

Creates a product and optionally its categories, attributes, images, and media assets.

Transport details:

- accepts multipart form-data
- uploaded files use field name `images`
- up to 20 files
- max file size is 5 MB per file

Body fields:

```json
{
  "name": "iPhone 16",
  "slug": "iphone-16",
  "shortDescription": "Short summary",
  "longDescription": "Long description",
  "status": "active",
  "isFeatured": true,
  "isBestseller": false,
  "brandId": "brand-uuid",
  "categoryIds": ["category-uuid-1", "category-uuid-2"],
  "imageMetas": [
    {
      "id": "image-uuid-1",
      "imageType": "main",
      "altText": "Front view",
      "title": "Main image",
      "displayOrder": 0
    }
  ],
  "attributes": [
    {
      "attributeKey": "color",
      "attributeKeyDisplay": "Color",
      "displayOrder": 0
    }
  ]
}
```

Validation highlights:

- `name` is required and max length 255
- `slug` is required, normalized, and max length 255
- `status` must match the product status enum
- `brandId` must be a UUID
- `categoryIds` must be a non-empty UUID array with no duplicates
- `attributes` cannot duplicate `attributeKey` or `displayOrder`
- `imageMetas` is optional, but required when image files are uploaded
- image meta IDs must match uploaded filenames without extension

Behavior:

1. Validates image metadata against uploaded files.
2. Ensures slug is not already used by another active product.
3. Ensures brand exists.
4. Ensures all referenced categories exist and are active.
5. Uploads image files to the storage provider.
6. Creates the product inside a transaction.
7. Creates category links, product attributes, and product-image metadata.
8. Creates media-asset rows for uploaded images.

Response:

```json
{
  "id": "product-uuid"
}
```

Possible errors:

- `Slug already exists`
- `Brand not found`
- `One or more categories are invalid or inactive`
- `imageMetas is required when uploading images`
- `Missing meta for image: <filename>`

### `GET /admin/products`

Returns paginated active products for admin listing.

Query params:

- `page`
- `limit`

Response shape:

```json
{
  "items": [
    {
      "id": "product-uuid",
      "name": "iPhone 16",
      "slug": "iphone-16",
      "status": "active",
      "isFeatured": true,
      "isBestseller": false,
      "brand": { "id": "brand-uuid", "name": "Apple" },
      "categories": [{ "id": "category-uuid", "name": "Phones" }],
      "images": [
        {
          "id": "image-uuid",
          "imageType": "main",
          "altText": "Front view",
          "url": "https://..."
        }
      ],
      "variantCount": 2
    }
  ],
  "totalCount": 10,
  "currentPage": 1,
  "itemsPerPage": 20
}
```

Notes:

- admin listing returns active products only
- list query includes brand, categories, main images, and `variantCount`

### `GET /admin/products/:id`

Returns one active product by UUID.

Response includes:

- core product fields
- brand
- categories
- all active product images
- all active product attributes

Possible errors:

- `Product not found`

### `PATCH /admin/products/:id`

Updates product fields and optionally syncs categories, attributes, and images.

Transport details:

- accepts multipart form-data
- uploaded files use field name `images`

Supported updates:

- `name`
- `slug`
- `shortDescription`
- `longDescription`
- `status`
- `isFeatured`
- `isBestseller`
- `brandId`
- `categoryIds`
- `attributes`
- `imageMetas`

Behavior:

1. Loads the active product.
2. Validates changed brand, categories, slug, and uploaded images.
3. Uploads any new image files.
4. Updates the product row in a transaction.
5. Syncs categories when `categoryIds` is provided and non-empty.
6. Syncs attributes when `attributes` is provided and non-empty.
7. Syncs images when `imageMetas` is provided and non-empty.
8. Creates media assets for newly inserted images.

Response:

```json
{
  "id": "product-uuid"
}
```

Important update semantics:

- omitted fields are left unchanged
- relation sync only runs when the corresponding array is present and non-empty
- sending an empty array does not currently clear categories, attributes, or images

Possible errors:

- `Product not found`
- `Slug already exists`
- `Brand not found`
- `One or more categories are invalid or inactive`

### `DELETE /admin/products/:id`

Soft-deletes a product by marking `isActive = false`.

Behavior:

- delegates to `update()` with `isActive: false`
- does not physically delete the row

Response:

```json
true
```

### `GET /admin/products/:id/attributes`

Returns active product attributes ordered by `displayOrder`.

Response example:

```json
[
  {
    "id": "attribute-uuid",
    "attributeKey": "color",
    "attributeKeyDisplay": "Color",
    "displayOrder": 0
  }
]
```

## Storefront API

Base path: `/products`

These routes are public because `StorefrontProductsController` uses `@Public()`.

### `GET /products`

Returns paginated active storefront products.

Query params:

- `page`
- `limit`
- `search`
- `sort`

Supported sort values:

- `newest`
- `price_asc`
- `price_desc`

Filtering behavior:

- only products with `is_active = true` and `status = 'active'` are returned
- products must have an active default variant to appear
- `search` filters by product name with `ILIKE`

Sort behavior:

- default: newest first
- price sorts by `COALESCE(sale_price, price)` of the default variant

Response shape:

```json
{
  "items": [
    {
      "id": "product-uuid",
      "name": "iPhone 16",
      "slug": "iphone-16",
      "shortDescription": "Short summary",
      "isFeatured": true,
      "isBestseller": false,
      "price": 15000000,
      "salePrice": 14500000,
      "inStock": true,
      "mainImage": "https://...",
      "variantId": "default-variant-uuid"
    }
  ],
  "totalCount": 10,
  "currentPage": 1,
  "itemsPerPage": 20
}
```

### `GET /products/:slug`

Returns a storefront product detail by slug.

Response includes:

- core product info
- all active variants
- product-level attributes
- active images with media URLs

Variant payload includes:

- `id`
- `name`
- `price`
- `salePrice`
- `stockQuantity`
- `isDefault`
- `attributes`

Possible errors:

- `Product not found`

## Image Upload and Media Model

Product images are split across two layers:

1. `product_images` stores metadata such as `imageType`, `displayOrder`, and optional `altText`
2. `media_assets` stores the uploaded file URL and storage metadata

Image upload flow:

1. Client sends image files in `images`
2. Client sends matching `imageMetas`
3. File name without extension must match `imageMetas[].id`
4. Files are uploaded through the configured storage provider
5. The module creates `product_images`
6. The module creates corresponding `media_assets`

If any upload fails:

- succeeded uploads are cleaned up
- the request fails

## Attribute Sync Rules

Product attributes are synced rather than patched one-by-one.

When syncing:

- incoming attribute items with known IDs are updated
- incoming attribute items without known IDs are inserted
- existing attributes missing from the incoming list are removed

Removal behavior depends on variant usage:

- if an attribute is referenced by `variant_attributes`, it is soft-deleted with `isActive = false`
- otherwise it is hard-deleted

This preserves referential integrity for variant attribute history.

## Category Sync Rules

Categories are synced by diff:

- new category IDs are inserted
- missing category IDs are deleted from the join table
- unchanged category IDs are preserved

Category references must point to active categories.

## Repository Behavior

### Admin repository

`ProductRepository` provides:

- create active products
- validate slug uniqueness among active products
- fetch paginated admin list
- fetch detailed admin product view
- count active products
- update product rows

Admin list query joins:

- brand
- categories
- main product images
- media asset URLs
- active variant count

### Storefront repository

`StorefrontProductRepository` provides:

- filtered storefront product list
- storefront product detail by slug

Storefront list is built from the default active variant only.

Storefront detail includes:

- all active variants
- variant attribute values
- active product attributes
- active images with media URLs

## End-to-End Flows

### Admin create flow

1. Admin submits product metadata and optional files.
2. Validators confirm slug, brand, categories, and image metadata.
3. Files upload to storage.
4. Product, categories, attributes, images, and media assets are created transactionally.

### Admin update flow

1. Admin submits changed product data.
2. Product is loaded and validated.
3. New files upload if present.
4. Product row and relations are synced in one transaction.

### Storefront browse flow

1. Client requests `/products` with optional search and sort.
2. Repository returns active products that have an active default variant.
3. Response exposes summary pricing and one main image per product.

### Storefront detail flow

1. Client requests `/products/:slug`.
2. Repository loads product, variants, attributes, and images.
3. Client receives a product-detail view model ready for PDP rendering.

## Frontend Integration Notes

- admin create and update should use multipart form-data when sending files
- `categoryIds`, `attributes`, and `imageMetas` may be sent as JSON strings and are parsed server-side
- uploaded image filenames should match `imageMetas[].id`
- storefront list pricing comes from the default variant, not from an aggregate across all variants
- storefront detail should be used when the UI needs full variant and attribute data

## Implementation Notes

- admin delete is a soft delete
- admin list and detail return active products only
- storefront list returns only products with `status = active`
- storefront queries do not expose draft, inactive, or discontinued products
- update sync for categories, attributes, and images only runs when the arrays are present and non-empty

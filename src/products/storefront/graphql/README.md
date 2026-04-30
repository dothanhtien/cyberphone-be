# Storefront Product GraphQL API

Endpoint: `POST /graphql`  
Playground: `http://localhost:3000/graphql` (dev only)

All queries are public — no authentication required.

---

## Queries

### `newProducts`

Returns the latest active products sorted by creation date.

| Argument | Type  | Default | Description                      |
| -------- | ----- | ------- | -------------------------------- |
| `limit`  | `Int` | `8`     | Max number of products to return |

### `featuredProducts`

Returns products flagged as featured (`isFeatured = true`).

| Argument | Type  | Default | Description                      |
| -------- | ----- | ------- | -------------------------------- |
| `limit`  | `Int` | `8`     | Max number of products to return |

### `categoryProducts`

Returns products belonging to a specific category by slug.

| Argument       | Type      | Default | Description                       |
| -------------- | --------- | ------- | --------------------------------- |
| `categorySlug` | `String!` | —       | Slug of the category to filter by |
| `limit`        | `Int`     | `8`     | Max number of products to return  |

---

## Homepage in one request

Use GraphQL **aliases** to fetch all sections in a single request:

```graphql
query StorefrontHome {
  newProducts(limit: 8) {
    id
    name
    slug
    shortDescription
    isFeatured
    isBestseller
    price
    salePrice
    inStock
    mainImage
    variantId
  }
  featuredProducts(limit: 8) {
    id
    name
    slug
    shortDescription
    isFeatured
    isBestseller
    price
    salePrice
    inStock
    mainImage
    variantId
  }
  smartphones: categoryProducts(categorySlug: "smartphones", limit: 8) {
    id
    name
    slug
    shortDescription
    isFeatured
    isBestseller
    price
    salePrice
    inStock
    mainImage
    variantId
  }
  tablets: categoryProducts(categorySlug: "tablets", limit: 8) {
    id
    name
    slug
    shortDescription
    isFeatured
    isBestseller
    price
    salePrice
    inStock
    mainImage
    variantId
  }
}
```

---

## Product fields

| Field              | Type      | Description                           |
| ------------------ | --------- | ------------------------------------- |
| `id`               | `ID`      | Product UUID                          |
| `name`             | `String`  | Product name                          |
| `slug`             | `String`  | URL-friendly identifier               |
| `shortDescription` | `String`  | Short description (nullable)          |
| `isFeatured`       | `Boolean` | Featured flag                         |
| `isBestseller`     | `Boolean` | Bestseller flag                       |
| `price`            | `Float`   | Base price of default variant         |
| `salePrice`        | `Float`   | Sale price (nullable)                 |
| `inStock`          | `Boolean` | Whether the default variant has stock |
| `mainImage`        | `String`  | Main image URL (nullable)             |
| `variantId`        | `ID`      | Default variant UUID                  |

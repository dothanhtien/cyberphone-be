# Cart Module

## Overview

The cart module manages storefront carts for both guest sessions and identified customers.

It supports:

- resolving or creating an active cart from `sessionId` or `customerId`
- adding product variants to a cart
- increasing or decreasing item quantity
- soft-removing cart items
- returning cart data enriched with variant pricing, stock status, and image

All cart endpoints are public because the storefront cart is designed to work before authentication.

## Module Composition

Main files:

- `src/carts/carts.module.ts`: module wiring
- `src/carts/storefront/storefront-carts.controller.ts`: public HTTP endpoints
- `src/carts/storefront/storefront-carts.service.ts`: cart business logic
- `src/carts/repositories/cart.repository.ts`: cart persistence and storefront cart query
- `src/carts/repositories/cart-item.repository.ts`: cart item persistence and storefront item query
- `src/carts/entities/cart.entity.ts`: cart table mapping
- `src/carts/entities/cart-item.entity.ts`: cart-item table mapping

Dependency:

- `ProductVariantsModule`

## Data Model

### Cart

Main fields:

- `id`
- `customerId`
- `sessionId`
- `expiresAt`
- `status`
- `createdAt`
- `updatedAt`

Cart statuses:

- `active`
- `inactive`
- `converted`

Important constraint:

- each customer can have only one active cart at a time

### Cart Item

Main fields:

- `id`
- `cartId`
- `variantId`
- `quantity`
- `isActive`
- `createdAt`
- `updatedAt`

Important constraint:

- only one active cart item is allowed for the same `cartId + variantId` pair

Because of that uniqueness rule, adding the same variant again increases quantity instead of creating a duplicate active row.

## Public API

Base path: `/carts`

### `POST /carts/resolve`

Resolves the current active cart for a customer or guest session. If no active cart exists, a new one is created.

Request body:

```json
{
  "customerId": "uuid-optional",
  "sessionId": "uuid-optional"
}
```

Validation:

- `customerId` is optional but must be a UUID v4 when provided
- `sessionId` is optional but must be a UUID v4 when provided

Behavior:

1. Looks for an active cart by `customerId` or `sessionId`.
2. If no cart exists, creates a new cart with a generated UUID session ID.
3. Sets or refreshes `expiresAt` to 7 days from now.
4. Returns the storefront cart response with item details.

Notes:

- if both `customerId` and `sessionId` are present, the repository searches with an `OR` condition
- when an existing cart is found, the stored `sessionId` is not replaced
- if neither `customerId` nor `sessionId` is provided, the current implementation falls through to cart creation

Response shape:

```json
{
  "id": "cart-uuid",
  "customerId": "customer-uuid-or-null",
  "sessionId": "session-uuid",
  "expiresAt": "2026-04-20T12:00:00.000Z",
  "items": []
}
```

Possible errors:

- `Cart already exists`

### `POST /carts/:id/items`

Adds a variant to an active cart.

Path params:

- `id`: cart ID

Request body:

```json
{
  "variantId": "variant-uuid",
  "quantity": 2
}
```

Validation:

- `variantId` must be a UUID v4
- `quantity` must be an integer
- `quantity` must be greater than or equal to `0`

Behavior:

1. Loads the active cart.
2. Loads the active product variant.
3. Checks whether an active cart item already exists for the same variant.
4. If it exists, adds the new quantity to the existing quantity.
5. If it does not exist, creates a new active cart item.
6. Validates stock before saving.
7. Returns the updated cart item summary.

Stock rule:

- rejects when the variant is `out_of_stock`
- rejects when `stockQuantity < requestedQuantity`

Response shape:

```json
{
  "id": "cart-item-uuid",
  "quantity": 2,
  "variantId": "variant-uuid",
  "variantName": "Black / 128GB",
  "price": "15000000",
  "salePrice": "14500000",
  "stockStatus": "in_stock",
  "imageUrl": "https://..."
}
```

Possible errors:

- `Cart not found`
- `Product variant not found`
- `Not enough stock for this product`

### `PATCH /carts/:id/items/:itemId/increase`

Increases an active cart item quantity by 1.

Behavior:

1. Loads the active cart item.
2. Verifies the item belongs to the target cart.
3. Loads the active cart and variant.
4. Checks stock for `currentQuantity + 1`.
5. Updates the quantity.

Response:

```json
true
```

Possible errors:

- `Cart item not found`
- `Cart not found`
- `Variant not found`
- `Not enough stock for this product`

### `PATCH /carts/:id/items/:itemId/decrease`

Decreases an active cart item quantity by 1.

Behavior:

1. Loads the active cart item.
2. Verifies the item belongs to the target cart.
3. Loads the active cart and variant.
4. Decreases quantity by 1.
5. If quantity becomes `0` or less, marks the item inactive and stores quantity as `0`.

Response:

```json
true
```

This endpoint soft-removes the item when the quantity reaches zero.

Possible errors:

- `Cart item not found`
- `Cart not found`
- `Variant not found`

### `DELETE /carts/:id/items/:itemId`

Soft-removes an active item from the cart.

Behavior:

1. Loads the active cart item.
2. Verifies the item belongs to the target cart.
3. Sets `isActive = false`.

Response:

```json
true
```

Possible errors:

- `Cart item not found`

## Storefront Response Model

### Cart response

```ts
{
  id: string;
  customerId: string | null;
  sessionId: string;
  expiresAt: string;
  items: CartItemResponseDto[];
}
```

### Cart item response

```ts
{
  id: string;
  quantity: number;
  variantId: string;
  variantName: string;
  price: string;
  salePrice: string | null;
  stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  imageUrl: string | null;
}
```

Storefront queries enrich cart items with:

- variant name
- price and sale price
- current stock status
- one product image URL when available

## Business Rules

### Active cart resolution

- carts are looked up by active `customerId` or active `sessionId`
- resolving a cart extends expiry by 7 days
- new carts always receive a generated UUID session ID

### Quantity merge

- adding the same variant again merges into the same active cart item
- the service does not create duplicate active rows for the same variant

### Soft deletion

- removing an item does not delete the database row
- the row is hidden from storefront reads by setting `isActive = false`
- decreasing to zero behaves like a soft delete

### Stock enforcement

- stock is validated before add and increase operations
- out-of-stock variants cannot be added
- quantity cannot exceed the variant stock quantity

## Persistence Details

### Cart repository

`CartRepository` provides:

- create a cart
- find an active cart by `customerId` or `sessionId`
- find an active cart by ID
- load storefront cart data with joined item details
- update a cart

The storefront cart query uses SQL joins to return:

- active cart items only
- active product variants only
- active products only
- a main product image when available

### Cart item repository

`CartItemRepository` provides:

- create a cart item
- find an active item by cart and variant
- find an active item by ID
- load storefront cart-item data with variant details
- update a cart item

## End-to-End Flow

### Guest cart flow

1. Frontend calls `POST /carts/resolve` with a guest `sessionId` if it has one.
2. Backend returns the active cart or creates a new one.
3. Frontend stores the returned `sessionId`.

### Add item flow

1. Frontend calls `POST /carts/:id/items`.
2. Backend validates cart, variant, and stock.
3. Backend creates or merges the cart item.
4. Backend returns the updated item snapshot.

### Quantity update flow

1. Frontend calls either `increase` or `decrease`.
2. Backend updates quantity.
3. If quantity drops to zero, the item becomes inactive.

### Remove item flow

1. Frontend calls `DELETE /carts/:id/items/:itemId`.
2. Backend soft-removes the cart item.

## Frontend Integration Notes

- treat `sessionId` as the guest-cart key and persist it client-side
- call `resolve` before the first cart mutation if the user does not already have a cart ID
- expect `increase`, `decrease`, and `delete` endpoints to return `true`, not the full cart
- refresh the cart view after quantity mutations if the UI needs full totals or item lists
- when a customer logs in, pass `customerId` to `resolve` so the backend can locate the active customer cart

Example:

```ts
const cart = await fetch('/carts/resolve', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ sessionId }),
}).then((res) => res.json());

await fetch(`/carts/${cart.id}/items`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    variantId,
    quantity: 1,
  }),
});
```

## Implementation Notes

- the controller is decorated with `@Public()`, so cart routes bypass the global JWT guard
- `addToCart` runs inside a database transaction
- `resolve` may raise a uniqueness conflict if concurrent requests try to create the same active customer cart
- `quantity` currently accepts `0` at DTO level, although the main business flow expects positive adds

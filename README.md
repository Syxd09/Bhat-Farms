# Bhat & Bhat Harvest Hub

Bhat & Bhat Farms — Complete E-Commerce Website

Build a completely new, production-ready e-commerce website for Bhat & Bhat Farms.

The website must be a serious, scalable online store for a farm and natural-food business. It should be easy for customers to browse products, understand products, add products to cart, purchase products, manage orders, and return to purchase again.

Do not use mock data, fake products, fake reviews, fake orders, or placeholder business information where real data is already available.

The implementation should be structured so that the website can grow to hundreds or thousands of products and customers without requiring a major rebuild.

Brand Colors

Use only the following primary brand colors based on the existing Bhat & Bhat Farms logo:

Primary Dark Green: #0C4607

Primary Green: #088C3D

Orange: #FAA61A

Dark Brown/Olive: #3C2F07

White: #FFFFFF

Light Gray: #E8E8E8

The colors should be used consistently throughout the website and e-commerce components.

Do not introduce unrelated brand colors.

Business

Brand name:

Bhat & Bhat Farms

Website:

bhatnbhatfarm.com

The business sells farm and natural products including:

Milk

A2 dairy products

Ghee

Curd

Traditional sweets

Honey

Cold-pressed oils

Bull-driven oils

Fruits

Vegetables

Spices

Powders

Dry fruits

Coffee

Garden products

Desi cow manure

Other farm products

The product catalogue must be built so additional categories and products can easily be added later.

1. Core E-Commerce Functionality

Build a complete working e-commerce system.

Customers must be able to:

Browse products

Browse categories

Search products

Filter products

Sort products

Open individual product pages

Select product variants

Select quantities

Add products to cart

Update cart quantities

Remove products

See subtotal

See applicable delivery charges

Apply coupons

See final payable amount

Proceed to checkout

Enter delivery details

Select payment method

Place an order

Receive order confirmation

View order status

View previous orders

Reorder previously purchased products

Do not create fake functionality.

Every major e-commerce interaction should actually work.

2. Product System

Create a scalable product architecture.

Each product should support:

Product ID

Product name

Slug

Category

Subcategory

Description

Short description

Product images

Price

Compare-at price where applicable

Discount

Stock quantity

Stock status

SKU

Product variants

Variant-specific pricing

Variant-specific stock

Weight/volume

Ingredients where applicable

Storage information

Usage information

Product specifications

Delivery information

Product status

Featured product status

Best seller status

New product status

Products should support multiple variants.

Example:

A2 Gir Cow Ghee

250 ml

500 g

1 L

5 L

These should be handled as variants of one product rather than unnecessarily creating disconnected products.

3. Categories

Create a scalable category system.

Initial categories:

Ghee & Dairy

Milk

Ghee

Curd

Traditional Sweets

Cold-Pressed Oils

Coconut Oil

Sesame Oil

Safflower Oil

Castor Oil

Niger Oil

Other Oils

Forest Honey

Fruits & Vegetables

Fruits

Vegetables

Flowers

Spices

Powders

Groceries

Dry Fruits

Coffee

Garden Needs

Desi Cow Manure

The admin should be able to create additional categories and subcategories without modifying the application code.

4. Search

Implement real product search.

Search should work with:

Product name

Category

Subcategory

Product keywords

SKU

Relevant product attributes

Search results should update correctly and handle partial searches.

Examples:

Searching:

ghee

should find relevant ghee products.

Searching:

coconut

should find coconut-related products.

Searching:

milk

should find relevant milk products.

5. Product Discovery

Customers should be able to discover:

Featured products

Best sellers

New products

Recommended products

Related products

Products from the same category

Recently viewed products

Recommendations must be based on actual product data.

Do not use fake recommendation data.

6. Customer Accounts

Create a proper customer account system.

Customers should be able to:

Register

Login

Logout

Reset password

Manage profile

Manage phone number

Manage email

Save addresses

Add multiple delivery addresses

Set a default address

View orders

View individual order details

Track order status

Reorder products

View previous purchases

Keep customer information secure.

7. Cart

Create a persistent shopping cart.

The cart should correctly handle:

Product variants

Quantity changes

Stock availability

Price calculations

Discounts

Coupons

Delivery charges

Final total

The cart should remain available when the customer returns to the website.

Do not allow customers to purchase quantities that exceed available inventory.

8. Checkout

Build a complete checkout process.

Checkout should collect:

Customer name

Phone number

Email

Delivery address

City

State

PIN code

Delivery instructions

The customer should clearly see:

Products

Quantities

Product prices

Subtotal

Discount

Delivery fee

Taxes if applicable

Final amount

Before payment, provide a clear final order summary.

9. Payments

Structure the payment system so a real payment provider can be connected.

Prioritize support for:

UPI

Credit/debit cards

Net banking

Other supported online payment methods

Do not create fake successful payment responses.

Payment status must be verified through the payment provider before marking an order as paid.

Keep the payment integration modular so the provider can be changed later.

10. Orders

Create a proper order-management system.

Each order should contain:

Unique order ID

Customer

Products

Variants

Quantities

Prices

Discounts

Delivery charges

Taxes if applicable

Final amount

Payment status

Order status

Delivery address

Order date

Updated date

Order statuses should support:

Pending

Confirmed

Processing

Packed

Out for Delivery

Delivered

Cancelled

Refunded

Customers should be able to see their current order status.

11. Milk Subscription

This is a major business feature and should be treated separately from normal one-time purchases.

Create a proper milk subscription system.

Customers should be able to:

Choose milk product

Select quantity

Select delivery frequency

Select start date

Select delivery days where applicable

Enter delivery address

Subscribe

Pause subscription

Resume subscription

Modify quantity

Change address

Cancel subscription

View subscription status

The architecture must support recurring billing/payment integration later.

Do not implement fake recurring payments.

The subscription system should be modular so a real recurring-payment provider can be connected.

12. Delivery System

Create a delivery architecture that can scale by location.

The system should support:

PIN-code based delivery availability

Delivery charges

Free-delivery thresholds

Different delivery areas

Different delivery rules

Delivery slots

Delivery instructions

Customers should be able to check whether their location is serviceable before completing checkout.

The admin must be able to manage delivery areas without changing code.

13. Coupons & Discounts

Create a proper coupon system.

Support:

Percentage discounts

Fixed discounts

Minimum order value

Maximum discount

Product-specific coupons

Category-specific coupons

First-order coupons

Expiry dates

Usage limits

Customer usage limits

Active/inactive status

The system must validate coupons server-side.

14. Inventory

Build proper inventory management.

The system should track:

Stock quantity

Reserved quantity

Available quantity

Low-stock threshold

Out-of-stock status

Variant stock

When an order is successfully placed, inventory must update correctly.

Avoid overselling.

15. Reviews

Build a real customer review system.

Customers should only be able to review products they have actually purchased.

Reviews should support:

Rating

Written review

Verified purchase indicator

Review date

Admin should be able to moderate reviews.

Do not generate fake reviews.

16. Admin Panel

Create a complete admin dashboard.

Admin should be able to manage:

Products

Create

Edit

Delete

Disable

Update price

Update stock

Manage variants

Upload images

Categories

Create

Edit

Delete

Reorder

Enable/disable

Orders

View

Search

Filter

Update status

View customer

View payment status

View products

View delivery information

Customers

View

Search

View order history

View subscriptions

Subscriptions

View

Search

Pause

Resume

Cancel

Modify

Coupons

Create

Edit

Disable

Delete

View usage

Inventory

View stock

Update stock

Low-stock alerts

Reviews

Approve

Reject

Remove

17. Dashboard Analytics

Admin dashboard should show real database information.

Include:

Total sales

Today's sales

Monthly sales

Number of orders

Pending orders

Delivered orders

Cancelled orders

Total customers

New customers

Active milk subscriptions

Top-selling products

Low-stock products

Average order value

Repeat customers

Do not use dummy analytics.

18. Customer Retention

Build the architecture for repeat purchases.

Customers should be able to:

Reorder

Save products

Save addresses

View purchase history

Manage subscriptions

Receive order updates

Receive useful transactional notifications

The system should make repeat purchasing easy.

19. Notifications

Prepare a notification architecture for:

Order confirmation

Payment confirmation

Order status changes

Out-for-delivery notification

Delivery confirmation

Subscription confirmation

Subscription changes

Password reset

Keep notifications modular so email, SMS and WhatsApp providers can be connected later.

Do not create fake notifications.

20. SEO

Build the website so products and categories can be indexed properly.

Every product should have:

SEO title

Meta description

Canonical URL

Clean URL

Open Graph information

Structured product information

Categories should also have their own SEO information.

Generate:

Sitemap

Robots.txt

Product structured data

Organization structured data

Local business structured data

Breadcrumb structured data

Use clean, crawlable URLs.

21. Business Information

Use the real Bhat & Bhat Farms business information available on the existing website.

Do not invent:

addresses

phone numbers

reviews

certifications

awards

claims

statistics

farm sizes

production numbers

customer numbers

If information is unavailable, create the appropriate admin/content field rather than inventing it.

22. Content Management

Build the architecture so the business can later manage:

Homepage content

About information

Farm information

Product information

FAQ

Blog/articles

Recipes

Announcements

Promotional sections

without needing to modify application code.

23. Scalability

The website must be built with scalability in mind.

Avoid hardcoded product/category/order/customer data.

Use a proper database architecture.

Separate:

Authentication

Products

Categories

Customers

Orders

Payments

Inventory

Subscriptions

Delivery

Coupons

Reviews

Notifications

Content

Keep the architecture modular.

The system should be capable of growing from a small local store to a much larger e-commerce operation.

24. Performance

The website should:

Load quickly

Optimize product images

Avoid unnecessary requests

Use efficient database queries

Paginate large product lists

Handle large product catalogues

Handle many customers

Handle increasing order volume

Avoid loading the entire catalogue at once

Do not sacrifice functionality for unnecessary complexity.

25. Security

Implement proper security from the beginning.

Include:

Secure authentication

Password hashing

Authorization

Admin role protection

Server-side validation

Input sanitization

Secure payment verification

Protection against unauthorized order modification

Protection against unauthorized price modification

Protection against unauthorized inventory modification

Secure API endpoints

Environment variables for secrets

No API keys exposed in frontend code

Customers must never be able to manipulate:

Product prices

Order totals

Inventory

Payment status

Admin data

from the browser.

26. Mobile & Desktop

The complete e-commerce functionality must work properly on:

Mobile phones

Tablets

Laptops

Desktop computers

All important customer actions must remain easy to access on smaller screens.

27. Code Quality

Use a clean, maintainable architecture.

Requirements:

Reusable components

Clear folder structure

Strong typing where applicable

Proper error handling

Loading states

Empty states

Error states

Form validation

API validation

Modular services

Environment-based configuration

Do not create one huge component containing the entire application.

28. No Fake Implementation

This is extremely important.

Do NOT:

Fake checkout

Fake payment success

Fake order tracking

Fake customer accounts

Fake stock

Fake analytics

Fake reviews

Fake subscription status

Hardcode product data into UI components

Use static arrays as the permanent database

Pretend that an API integration works when it does not

If an external service cannot be connected yet, create a proper provider interface and clearly isolate the integration point.

29. Final Goal

The final result should be a complete, production-ready e-commerce platform for Bhat & Bhat Farms.

The customer should be able to go from:

Discover → Browse → Understand → Add to Cart → Checkout → Pay → Receive Order → Reorder

without unnecessary friction.

The business should be able to go from:

Product → Inventory → Order → Payment → Delivery → Customer → Repeat Purchase

through a scalable system.

The website must feel trustworthy, easy to use, clean, attractive and professional while remaining focused on selling Bhat & Bhat Farms products and increasing customer conversion and repeat purchases.

Use the Bhat & Bhat Farms brand colors exactly as the primary color system:

#0C4607 — Dark Green

#088C3D — Green

#FAA61A — Orange

#3C2F07 — Dark Brown/Olive

#FFFFFF — White

#E8E8E8 — Light Gray

Do not introduce unrelated colors.

Build the actual working application, not a visual mockup.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e37c0077-290a-4f9b-9b80-146fbf4bb160).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

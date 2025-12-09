Trendware – Multi‑Currency Fashion Store

Trendware is a responsive online fashion storefront where users can browse clothes, shoes, and accessories, add items to a cart, and complete checkout with secure payments via Flutterwave and email notifications via EmailJS.​

Features
Product catalog for clothes, shoes, and accessories with sizes and prices in multiple currencies (NGN, USD, GBP, etc.).​

Dynamic cart with add/remove/update quantity, automatic totals, and data persistence using localStorage.

Currency switcher that updates product and cart prices based on the selected currency.

Size selection and quantity controls per product before adding to cart.

Checkout flow with customer details form (name, email, phone, address, country).

Flutterwave inline payment integration (test mode) with support for card, bank transfer, and USSD payments.

Dual email notifications via EmailJS:

Customer order confirmation (items, total, shipping address).

Owner new‑order alert with full order summary.

Responsive layout with mobile navigation (hamburger menu) and category filters.

Tech Stack
Frontend: HTML, CSS, Vanilla JavaScript

Payments: Flutterwave Inline Checkout (test public key)

Email: EmailJS (customer + owner templates)

Storage: Browser localStorage for cart and currency preference

Getting Started
Prerequisites
A basic web server (VS Code Live Server, local HTTP server, or any static hosting).

Flutterwave account (for test and live public keys).

EmailJS account with:

One service (e.g. service_zc17nys).

Customer template (e.g. template_ox6vxpb).

Owner template (e.g. template_7xrl9pr).

Setup
Clone or download the project into a folder served by your web server.

In script.js:

Set your EmailJS public key in emailjs.init('YOUR_PUBLIC_KEY');.

Set your EmailJS service ID and template IDs in the two emailjs.send(...) calls.

Set your owner email in store_owner: 'youremail@example.com'.

Keep the Flutterwave test public key until you are ready to go live.

Open the main HTML file in the browser through your server (not via file://).

Usage
Select a currency from the country/currency selector.

Browse products by category (clothes, shoes, accessories).

Choose a size, set quantity, and click Add to Cart.

Open the cart, adjust quantities or remove items, then click Checkout.

Fill in the checkout form (especially email), then pay through the Flutterwave popup.

On successful or completed payment, the cart is cleared and:

The customer receives an EmailJS order confirmation and Flutterwave payment receipt.

The owner receives an EmailJS new‑order alert and Flutterwave merchant notification.

Going Live
Replace the Flutterwave test public key with your live public key in public_key: when ready for real payments.

Ensure your EmailJS templates are connected to a verified sender address and your domain’s SPF/DKIM are configured to reduce spam risk.

License
This project is intended as a personal/portfolio e‑commerce demo. You may adapt it for your own use, but ensure you comply with Flutterwave and EmailJS terms of service.


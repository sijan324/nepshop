# E-Commerce Platform Design Guidelines

## Design Approach
**Reference-Based Approach** drawing from modern e-commerce leaders (Shopify, Amazon, Vercel) with emphasis on clean product presentation, trust-building, and conversion optimization.

## Typography System

**Font Families:**
- Primary: Inter or DM Sans (Google Fonts)
- Accent: Optional serif for luxury product categories (Playfair Display)

**Hierarchy:**
- Hero Headlines: text-5xl lg:text-6xl font-bold
- Section Headers: text-3xl lg:text-4xl font-semibold
- Product Titles: text-xl font-semibold
- Body Text: text-base leading-relaxed
- Captions/Meta: text-sm text-gray-600

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16, 20 (e.g., p-4, gap-6, space-y-8, py-20)

**Container Strategy:**
- Max-width: max-w-7xl mx-auto for content areas
- Full-width for hero sections and product grids with inner containers
- Consistent padding: px-4 md:px-6 lg:px-8

**Grid Systems:**
- Product grids: grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6
- Category cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Admin dashboard: Sidebar + main content (aside: w-64, main: flex-1)

## Component Library

### Navigation
- **Main Header**: Sticky top navigation with logo (left), search bar (center), cart/account icons (right)
- **Category Menu**: Horizontal scrollable categories below header or mega-menu dropdown
- **Mobile**: Hamburger menu with slide-out drawer, bottom navigation for cart/account

### Homepage Structure
1. **Hero Section**: Full-width banner (h-[500px] lg:h-[600px]) with promotional imagery, headline, and CTA button with backdrop-blur-md background
2. **Featured Categories**: 3-4 column grid with image cards
3. **Product Showcase**: "New Arrivals" and "Best Sellers" sections with horizontal scroll or grid
4. **Trust Indicators**: Payment methods, shipping info, customer count (grid-cols-3 md:grid-cols-4)
5. **Newsletter**: Simple email capture with benefits listed

### Product Listing Page
- **Filters Sidebar**: Sticky left sidebar (w-64) on desktop, drawer on mobile
- **Product Grid**: Responsive grid with hover effects showing quick-view/add-to-cart
- **Product Cards**: Image (aspect-square), title, price, rating stars, badge for discounts
- **Pagination**: Bottom pagination with page numbers

### Product Detail Page
- **Two-Column Layout**: Images gallery (60%) | Product info (40%)
- **Image Gallery**: Main image with thumbnail strip, lightbox on click
- **Product Info**: Title, price (with strikethrough for discounts), rating/reviews, variant selectors (size/color as pills), quantity stepper, add-to-cart CTA
- **Tabs Section**: Description, Specifications, Reviews (tabbed interface)
- **Related Products**: Horizontal scroll carousel

### Shopping Cart
- **Slide-out Drawer**: Right-side overlay (w-96) with cart items list
- **Cart Items**: Product image (small), title, variant, quantity stepper, remove button
- **Summary**: Subtotal, shipping, total with bold emphasis
- **CTAs**: "Continue Shopping" (ghost) + "Checkout" (primary)

### Checkout Flow
- **Multi-Step Progress**: Visual stepper (Shipping → Payment → Review)
- **Form Layout**: Single column, grouped sections with clear labels
- **eSewa Integration**: Payment method selector with eSewa logo, terms checkbox
- **Order Summary**: Sticky right sidebar (desktop) or collapsible section (mobile)

### Order Tracking
- **Timeline Design**: Vertical progress timeline with status icons, timestamps, and descriptions
- **Order Header**: Order number, date, total in card format
- **Product List**: Simple table/list of ordered items

### Admin Dashboard
- **Sidebar Navigation**: Fixed left sidebar with icon + label menu items
- **Dashboard Cards**: Stats overview in 4-column grid (total orders, revenue, products, users)
- **Data Tables**: Sortable tables with search, filters, and action buttons
- **Forms**: Two-column layout for product creation/editing with image upload zone

### Customer Dashboard
- **Tab Navigation**: Horizontal tabs (Orders, Profile, Addresses, Reviews)
- **Order Cards**: Grid layout with order summary, status badge, and view details button

## Core UI Elements

**Buttons:**
- Primary CTA: Rounded-lg px-6 py-3 with hover scale effect
- Secondary: Outlined variant
- Icon buttons: Square with hover background

**Form Inputs:**
- Consistent height (h-12), rounded borders, focus ring
- Labels above inputs with required asterisk
- Error messages in red below input

**Cards:**
- Rounded-xl with subtle shadow, hover:shadow-lg transition
- Consistent padding: p-6

**Badges:**
- Small rounded pills for status (PAID, SHIPPED, etc.)
- Discount badges: Absolute positioned top-right on product images

**Icons:**
- Heroicons via CDN for consistency
- 20px for inline icons, 24px for standalone

## Images

**Product Images:**
- Square aspect ratio (aspect-square) for consistency
- High-quality, clean backgrounds (white/transparent preferred)
- Hover: Alternate image or zoom effect

**Hero Image:**
- Large hero banner on homepage showcasing featured products or seasonal collection
- Lifestyle photography with products in use, overlay gradient for text readability

**Category Images:**
- Representative product photography for each category
- Consistent styling across all category cards

**Placement:**
- Homepage hero: Full-width banner
- Category cards: Background images with overlay text
- Product pages: Gallery format
- Admin: Thumbnail previews in tables

## Accessibility
- Minimum touch target: 44px × 44px for mobile
- Sufficient contrast for all text
- Focus indicators on all interactive elements
- ARIA labels for cart count, status badges
- Keyboard navigation support

## Responsive Breakpoints
- Mobile: Base styles (< 768px)
- Tablet: md: (768px - 1024px)
- Desktop: lg: (1024px+)

**Key Responsive Changes:**
- Stack columns on mobile
- Hide filters sidebar, show as drawer
- Reduce product grid columns
- Simplify navigation to hamburger menu
- Bottom navigation bar for key actions

This design system prioritizes conversion optimization, trust-building through clean layouts, and seamless mobile shopping experience while maintaining professional polish throughout admin and customer interfaces.
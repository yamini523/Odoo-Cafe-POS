CREATE TABLE employees (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'EMPLOYEE',
  password_hash TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
  price DOUBLE PRECISION NOT NULL,
  tax DOUBLE PRECISION NOT NULL DEFAULT 0,
  description TEXT,
  image_url TEXT,
  unit TEXT NOT NULL DEFAULT 'pcs',
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE floors (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE restaurant_tables (
  id BIGSERIAL PRIMARY KEY,
  table_number TEXT NOT NULL,
  floor_id BIGINT REFERENCES floors(id) ON DELETE SET NULL,
  seats INTEGER NOT NULL DEFAULT 4,
  status TEXT NOT NULL DEFAULT 'available',
  qr_token TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE customers (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE coupons (
  id BIGSERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL,
  discount_value DOUBLE PRECISION NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  min_order_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE pos_sessions (
  id BIGSERIAL PRIMARY KEY,
  employee_id BIGINT REFERENCES employees(id),
  status TEXT NOT NULL DEFAULT 'OPEN',
  opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  total_orders INTEGER NOT NULL DEFAULT 0,
  total_revenue DOUBLE PRECISION NOT NULL DEFAULT 0,
  cash_total DOUBLE PRECISION NOT NULL DEFAULT 0,
  upi_total DOUBLE PRECISION NOT NULL DEFAULT 0,
  card_total DOUBLE PRECISION NOT NULL DEFAULT 0
);

CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  session_id BIGINT REFERENCES pos_sessions(id),
  table_id BIGINT REFERENCES restaurant_tables(id) ON DELETE SET NULL,
  customer_id BIGINT REFERENCES customers(id) ON DELETE SET NULL,
  employee_id BIGINT REFERENCES employees(id),
  status TEXT NOT NULL DEFAULT 'draft',
  subtotal DOUBLE PRECISION NOT NULL DEFAULT 0,
  tax_total DOUBLE PRECISION NOT NULL DEFAULT 0,
  discount DOUBLE PRECISION NOT NULL DEFAULT 0,
  total DOUBLE PRECISION NOT NULL DEFAULT 0,
  payment_method TEXT,
  coupon_id BIGINT REFERENCES coupons(id) ON DELETE SET NULL,
  notes TEXT,
  source TEXT NOT NULL DEFAULT 'POS',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DOUBLE PRECISION NOT NULL,
  tax DOUBLE PRECISION NOT NULL DEFAULT 0,
  subtotal DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payment_methods (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL UNIQUE,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  upi_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO payment_methods (name, type, is_enabled, upi_id) VALUES
  ('Cash', 'cash', true, null),
  ('Card', 'card', true, null),
  ('UPI', 'upi', true, 'cafe@ybl');

INSERT INTO floors (name) VALUES ('Ground Floor'), ('First Floor'), ('Outdoor Seating');

INSERT INTO categories (name, color) VALUES
  ('Hot Drinks', '#ef4444'),
  ('Cold Drinks', '#06b6d4'),
  ('Food', '#f97316'),
  ('Desserts', '#a855f7'),
  ('Snacks', '#eab308');

INSERT INTO products (name, category_id, price, tax, description, unit, is_available) VALUES
  ('Espresso', 1, 120, 5, 'Strong single shot espresso', 'cup', true),
  ('Cappuccino', 1, 180, 5, 'Espresso with steamed milk foam', 'cup', true),
  ('Latte', 1, 200, 5, 'Espresso with lots of steamed milk', 'cup', true),
  ('Cold Coffee', 2, 220, 5, 'Chilled coffee with ice cream', 'glass', true),
  ('Iced Tea', 2, 150, 5, 'Refreshing iced tea', 'glass', true),
  ('Club Sandwich', 3, 280, 5, 'Triple layer club sandwich', 'plate', true),
  ('Pasta', 3, 320, 5, 'Creamy white sauce pasta', 'plate', true),
  ('Brownie', 4, 160, 5, 'Warm chocolate brownie', 'piece', true),
  ('Cheesecake', 4, 220, 5, 'New York style cheesecake', 'slice', true),
  ('French Fries', 5, 140, 5, 'Crispy golden fries', 'plate', true);

INSERT INTO restaurant_tables (table_number, floor_id, seats, status, qr_token) VALUES
  ('T1', 1, 4, 'available', 'qr-t1-ground'),
  ('T2', 1, 2, 'available', 'qr-t2-ground'),
  ('T3', 1, 6, 'available', 'qr-t3-ground'),
  ('T4', 1, 4, 'available', 'qr-t4-ground'),
  ('T5', 2, 4, 'available', 'qr-t5-first'),
  ('T6', 2, 8, 'available', 'qr-t6-first'),
  ('T7', 3, 2, 'available', 'qr-t7-outdoor'),
  ('T8', 3, 4, 'available', 'qr-t8-outdoor');

INSERT INTO employees (name, email, role, is_active) VALUES
  ('Admin User', 'admin@cafe.com', 'ADMIN', true),
  ('John Barista', 'john@cafe.com', 'EMPLOYEE', true),
  ('Jane Server', 'jane@cafe.com', 'EMPLOYEE', true);

INSERT INTO coupons (code, discount_type, discount_value, is_active, min_order_amount) VALUES
  ('WELCOME10', 'percentage', 10, true, 200),
  ('FLAT50', 'fixed', 50, true, 300),
  ('SAVE20', 'percentage', 20, true, 500);

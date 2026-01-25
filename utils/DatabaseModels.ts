/**
 * Database Models and Interfaces
 * Defines the structure of entities used in database testing
 */

export interface User {
  id?: number;
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  stock_quantity: number;
  sku: string;
  image_url?: string;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface Order {
  id?: number;
  user_id: number;
  order_number: string;
  total_amount: number;
  status: OrderStatus;
  shipping_address: string;
  billing_address: string;
  payment_method: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface OrderItem {
  id?: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export interface TestData {
  users: User[];
  products: Product[];
  orders: Order[];
  orderItems: OrderItem[];
}

/**
 * Database Schema Creation Queries
 */
export const CREATE_TABLES_QUERIES = {
  users: `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      first_name VARCHAR(50) NOT NULL,
      last_name VARCHAR(50) NOT NULL,
      phone VARCHAR(20),
      address TEXT,
      city VARCHAR(50),
      state VARCHAR(50),
      zip_code VARCHAR(20),
      country VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  
  products: `
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      category VARCHAR(100) NOT NULL,
      brand VARCHAR(100) NOT NULL,
      stock_quantity INTEGER NOT NULL DEFAULT 0,
      sku VARCHAR(50) UNIQUE NOT NULL,
      image_url TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  
  orders: `
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      order_number VARCHAR(50) UNIQUE NOT NULL,
      total_amount DECIMAL(10,2) NOT NULL,
      status VARCHAR(20) DEFAULT 'pending',
      shipping_address TEXT NOT NULL,
      billing_address TEXT NOT NULL,
      payment_method VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  
  order_items: `
    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL,
      unit_price DECIMAL(10,2) NOT NULL,
      total_price DECIMAL(10,2) NOT NULL
    );
  `
};

/**
 * Database Cleanup Queries
 */
export const CLEANUP_QUERIES = {
  order_items: 'DELETE FROM order_items;',
  orders: 'DELETE FROM orders;',
  products: 'DELETE FROM products;',
  users: 'DELETE FROM users;'
}; 
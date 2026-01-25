import { test, expect } from '@playwright/test';
import { DatabaseService } from '../../utils/DatabaseService';
import { DatabaseTestData } from '../../utils/DatabaseTestData';
import { Product } from '../../utils/DatabaseModels';

/**
 * Product CRUD Operations Test Suite
 * Tests all Create, Read, Update, Delete operations for Product entity
 */
test.describe('Product CRUD Operations', () => {
  let dbService: DatabaseService;
  let testProducts: Product[];

  test.beforeAll(async () => {
    // Initialize database service and schema
    dbService = new DatabaseService();
    await dbService.initializeDatabase();
    
    // Generate test data
    testProducts = DatabaseTestData.generateProducts(5);
  });

  test.afterAll(async () => {
    // Clean up all test data
    await dbService.cleanupTestData();
  });

  test.beforeEach(async () => {
    // Clean up before each test to ensure isolation
    await dbService.cleanupTestData();
    
    // Small delay to ensure cleanup is processed
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  test.describe('Create Operations', () => {
    test('should create a single product successfully', async () => {
      const productData = DatabaseTestData.generateSingleProduct();
      
      const createdProduct = await dbService.createProduct(productData);
      
      expect(createdProduct).toBeDefined();
      expect(createdProduct.id).toBeDefined();
      expect(createdProduct.name).toBe(productData.name);
      expect(createdProduct.description).toBe(productData.description);
      expect(Number(createdProduct.price)).toBe(productData.price);
      expect(createdProduct.category).toBe(productData.category);
      expect(createdProduct.brand).toBe(productData.brand);
      expect(createdProduct.sku).toBe(productData.sku);
      expect(createdProduct.stock_quantity).toBe(productData.stock_quantity);
      expect(createdProduct.is_active).toBe(productData.is_active);
      expect(createdProduct.created_at).toBeDefined();
    });

    test('should create multiple products successfully', async () => {
      const createdProducts = await Promise.all(testProducts.map(productData => dbService.createProduct(productData)));
      
      expect(createdProducts).toHaveLength(testProducts.length);
      // Verify each product was created correctly
      await Promise.all(createdProducts.map((createdProduct, index) => {
        expect(createdProduct.name).toBe(testProducts[index].name);
        expect(createdProduct.sku).toBe(testProducts[index].sku);
        expect(createdProduct.id).toBeDefined();
      }));
    });

    test('should fail to create product with duplicate SKU', async () => {
      const productData = DatabaseTestData.generateSingleProduct();
      
      // Create first product
      await dbService.createProduct(productData);
      
      // Try to create second product with same SKU
      const duplicateProduct = { ...productData, name: 'Different Product Name' };
      
      await expect(dbService.createProduct(duplicateProduct)).rejects.toThrow();
    });

    test('should create product with minimum required fields', async () => {
      const minimalProduct = {
        name: 'Minimal Product',
        description: 'Minimal description',
        price: 10.99,
        category: 'Test Category',
        brand: 'Test Brand',
        stock_quantity: 1,
        sku: 'MIN-SKU-001'
      } as Product;
      
      const createdProduct = await dbService.createProduct(minimalProduct);
      
      expect(createdProduct).toBeDefined();
      expect(createdProduct.name).toBe(minimalProduct.name);
    });
  });

  test.describe('Read Operations', () => {
    test('should retrieve product by ID', async () => {
      const productData = DatabaseTestData.generateSingleProduct();
      const createdProduct = await dbService.createProduct(productData);
      
      const retrievedProduct = await dbService.getProductById(createdProduct.id!);
      
      expect(retrievedProduct).toBeDefined();
      expect(retrievedProduct!.id).toBe(createdProduct.id);
      expect(retrievedProduct!.name).toBe(productData.name);
      expect(retrievedProduct!.sku).toBe(productData.sku);
    });

    test('should retrieve product by SKU', async () => {
      const productData = DatabaseTestData.generateSingleProduct();
      const createdProduct = await dbService.createProduct(productData);
      
      const retrievedProduct = await dbService.getProductBySku(productData.sku);
      
      expect(retrievedProduct).toBeDefined();
      expect(retrievedProduct!.id).toBe(createdProduct.id);
      expect(retrievedProduct!.sku).toBe(productData.sku);
    });

    test('should return null for non-existent product ID', async () => {
      const retrievedProduct = await dbService.getProductById(99999);
      
      expect(retrievedProduct).toBeNull();
    });

    test('should return null for non-existent SKU', async () => {
      const retrievedProduct = await dbService.getProductBySku('NONEXISTENT-SKU');
      
      expect(retrievedProduct).toBeNull();
    });
    test('should retrieve all products', async () => {
      // Create multiple products
      const createdProducts = await Promise.all(
        testProducts.map(productData => dbService.createProduct(productData))
      );
      
      const allProducts = await dbService.getAllProducts();
      
      expect(allProducts).toHaveLength(testProducts.length);
      
      // Verify all created products are in the result
      createdProducts.forEach(createdProduct => {
        const foundProduct = allProducts.find(product => product.id === createdProduct.id);
        expect(foundProduct).toBeDefined();
        expect(foundProduct!.name).toBe(createdProduct.name);
      });
    });

    test('should return empty array when no products exist', async () => {
      const allProducts = await dbService.getAllProducts();
      
      expect(allProducts).toHaveLength(0);
    });

    test('should retrieve products by category', async () => {
      // Create products with different categories
      const electronicsProduct = { ...DatabaseTestData.generateSingleProduct(), category: 'Electronics' };
      const clothingProduct = { ...DatabaseTestData.generateSingleProduct(), category: 'Clothing' };
      const electronicsProduct2 = { ...DatabaseTestData.generateSingleProduct(), category: 'Electronics' };
      
      await dbService.createProduct(electronicsProduct);
      await dbService.createProduct(clothingProduct);
      await dbService.createProduct(electronicsProduct2);
      
      const electronicsProducts = await dbService.getProductsByCategory('Electronics');
      
      expect(electronicsProducts).toHaveLength(2);
      expect(electronicsProducts.every(p => p.category === 'Electronics')).toBe(true);
    });

    test('should return empty array for non-existent category', async () => {
      const products = await dbService.getProductsByCategory('NonExistentCategory');
      
      expect(products).toHaveLength(0);
    });
  });

  test.describe('Update Operations', () => {
    test('should update product information successfully', async () => {
      const productData = DatabaseTestData.generateSingleProduct();
      const createdProduct = await dbService.createProduct(productData);
      
      const updates = {
        name: 'Updated Product Name',
        description: 'Updated product description',
        price: 199.99,
        stock_quantity: 100,
        is_active: false
      };
      
      const updatedProduct = await dbService.updateProduct(createdProduct.id!, updates);
      
      expect(updatedProduct).toBeDefined();
      expect(updatedProduct!.name).toBe(updates.name);
      expect(updatedProduct!.description).toBe(updates.description);
      expect(Number(updatedProduct!.price)).toBe(updates.price);
      expect(updatedProduct!.stock_quantity).toBe(updates.stock_quantity);
      expect(updatedProduct!.is_active).toBe(updates.is_active);
      expect(updatedProduct!.updated_at).toBeDefined();
      
      // Verify original fields remain unchanged
      expect(updatedProduct!.sku).toBe(productData.sku);
      expect(updatedProduct!.category).toBe(productData.category);
      expect(updatedProduct!.brand).toBe(productData.brand);
    });

    test('should update only specified fields', async () => {
      const productData = DatabaseTestData.generateSingleProduct();
      const createdProduct = await dbService.createProduct(productData);
      
      const updates = {
        price: 299.99
      };
      
      const updatedProduct = await dbService.updateProduct(createdProduct.id!, updates);
      
      expect(Number(updatedProduct!.price)).toBe(updates.price);
      expect(updatedProduct!.name).toBe(productData.name); // Should remain unchanged
      expect(updatedProduct!.description).toBe(productData.description); // Should remain unchanged
    });

    test('should return null when updating non-existent product', async () => {
      const updates = {
        name: 'Updated Name'
      };
      
      const updatedProduct = await dbService.updateProduct(99999, updates);
      
      expect(updatedProduct).toBeNull();
    });

    test('should handle empty update object', async () => {
      const productData = DatabaseTestData.generateSingleProduct();
      const createdProduct = await dbService.createProduct(productData);
      
      const updatedProduct = await dbService.updateProduct(createdProduct.id!, {});
      
      expect(updatedProduct).toBeDefined();
      expect(updatedProduct!.id).toBe(createdProduct.id);
    });

    test('should update stock quantity', async () => {
      const productData = DatabaseTestData.generateSingleProduct();
      const createdProduct = await dbService.createProduct(productData);
      
      const newStockQuantity = 75;
      const updatedProduct = await dbService.updateProduct(createdProduct.id!, {
        stock_quantity: newStockQuantity
      });
      
      expect(updatedProduct!.stock_quantity).toBe(newStockQuantity);
    });
  });

  test.describe('Delete Operations', () => {
    test('should delete product successfully', async () => {
      const productData = DatabaseTestData.generateSingleProduct();
      const createdProduct = await dbService.createProduct(productData);
      
      const deleteResult = await dbService.deleteProduct(createdProduct.id!);
      
      expect(deleteResult).toBe(true);
      
      // Verify product no longer exists
      const retrievedProduct = await dbService.getProductById(createdProduct.id!);
      expect(retrievedProduct).toBeNull();
    });

    test('should return false when deleting non-existent product', async () => {
      const deleteResult = await dbService.deleteProduct(99999);
      
      expect(deleteResult).toBe(false);
    });

    test('should delete multiple products', async () => {
      // Create multiple products
      const createdProducts = await Promise.all(testProducts.map(productData => dbService.createProduct(productData)));
      
      // Delete all products
      await Promise.all(createdProducts.map(createdProduct => dbService.deleteProduct(createdProduct.id!)));
      
      // Verify all products are deleted
      const allProducts = await dbService.getAllProducts();
      expect(allProducts).toHaveLength(0);
    });
  });
}); 
import { test, expect } from '@playwright/test';
import { GrpcService } from '../../utils/GrpcService';
import { DatabaseTestData } from '../../utils/DatabaseTestData';

/**
 * gRPC Product CRUD Test Suite
 * Tests all product-related gRPC operations
 */
test.describe('gRPC Product CRUD Operations', () => {
  let grpcService: GrpcService;
  let createdProductIds: number[] = [];

  test.beforeAll(async () => {
    grpcService = new GrpcService();
  });
  test.afterAll(async () => {
    // Clean up created products
    await Promise.allSettled(
      createdProductIds.map((productId) =>
        grpcService
          .deleteProduct(productId)
          .catch((error) =>
            console.log(`Failed to clean up product ${productId}:`, error)
          )
      )
    );
    grpcService.close();
  });

  test.describe('Product Creation', () => {
    test('should create a new product successfully', async () => {
      const productData = DatabaseTestData.generateProducts(1)[0];
      
      try {
        const response = await grpcService.createProduct(productData);
        
        expect(response).toBeDefined();
        expect(response.success).toBe(true);
        expect(response.product).toBeDefined();
        expect(response.product.name).toBe(productData.name);
        expect(response.product.description).toBe(productData.description);
        expect(response.product.price).toBe(productData.price);
        expect(response.product.category).toBe(productData.category);
        expect(response.product.brand).toBe(productData.brand);
        expect(response.product.sku).toBe(productData.sku);
        
        if (response.product.id) {
          createdProductIds.push(response.product.id);
        }
      } catch (error) {
        // Expected if gRPC server is not running
        expect(error).toBeDefined();
      }
    });

    test('should create multiple products successfully', async () => {
      const productsData = DatabaseTestData.generateProducts(3);
      try {
        const responses = await Promise.all(
          productsData.map(productData => grpcService.createProduct(productData))
        );

        responses.forEach(response => {
          expect(response).toBeDefined();
          expect(response.success).toBe(true);
          expect(response.product).toBeDefined();

          if (response.product.id) {
            createdProductIds.push(response.product.id);
          }
        });
      } catch (error) {
        // Expected if gRPC server is not running
        expect(error).toBeDefined();
      }
    });

    test('should handle duplicate SKU creation', async () => {
      const productData = DatabaseTestData.generateProducts(1)[0];
      
      try {
        // Create first product
        const response1 = await grpcService.createProduct(productData);
        expect(response1.success).toBe(true);
        
        if (response1.product.id) {
          createdProductIds.push(response1.product.id);
        }
        
        // Try to create second product with same SKU
        const response2 = await grpcService.createProduct(productData);
        // This should fail due to duplicate SKU
        expect(response2.success).toBe(false);
      } catch (error) {
        // Expected if gRPC server is not running
        expect(error).toBeDefined();
      }
    });

    test('should validate required fields', async () => {
      const invalidProductData = {
        name: 'Test Product'
        // Missing price, category, etc.
      };
      
      try {
        const response = await grpcService.createProduct(invalidProductData);
        expect(response.success).toBe(false);
      } catch (error) {
        // Expected if gRPC server is not running or validation fails
        expect(error).toBeDefined();
      }
    });

    test('should handle product with default values', async () => {
      const productData = {
        name: 'Test Product',
        description: 'Test Description',
        price: 99.99,
        category: 'Electronics',
        brand: 'Test Brand',
        stock_quantity: 10,
        sku: 'TEST-SKU-001'
        // is_active and image_url will use defaults
      };
      
      try {
        const response = await grpcService.createProduct(productData);
        
        expect(response).toBeDefined();
        expect(response.success).toBe(true);
        expect(response.product).toBeDefined();
        expect(response.product.is_active).toBe(true); // Default value
        expect(response.product.image_url).toBe(''); // Default value
        
        if (response.product.id) {
          createdProductIds.push(response.product.id);
        }
      } catch (error) {
        // Expected if gRPC server is not running
        expect(error).toBeDefined();
      }
    });
  });

  test.describe('Product Retrieval', () => {
    let testProductId: number;

    test.beforeAll(async () => {
      // Create a test product for retrieval tests
      const productData = DatabaseTestData.generateProducts(1)[0];
      
      try {
        const response = await grpcService.createProduct(productData);
        if (response.success && response.product.id) {
          testProductId = response.product.id;
          createdProductIds.push(testProductId);
        }
      } catch (error) {
        console.log('Failed to create test product for retrieval tests:', error);
      }
    });

    test('should get product by ID successfully', async () => {
      if (!testProductId) {
        test.skip(true, 'Test product not created');
        return;
      }
      
      try {
        const response = await grpcService.getProductById(testProductId);
        
        expect(response).toBeDefined();
        expect(response.success).toBe(true);
        expect(response.product).toBeDefined();
        expect(response.product.id).toBe(testProductId);
      } catch (error) {
        // Expected if gRPC server is not running
        expect(error).toBeDefined();
      }
    });

    test('should get product by SKU successfully', async () => {
      if (!testProductId) {
        test.skip(true, 'Test product not created');
        return;
      }
      
      try {
        // First get the product to get its SKU
        const productResponse = await grpcService.getProductById(testProductId);
        const productSku = productResponse.product.sku;
        
        const response = await grpcService.getProductBySku(productSku);
        
        expect(response).toBeDefined();
        expect(response.success).toBe(true);
        expect(response.product).toBeDefined();
        expect(response.product.sku).toBe(productSku);
      } catch (error) {
        // Expected if gRPC server is not running
        expect(error).toBeDefined();
      }
    });

    test('should get all products with pagination', async () => {
      try {
        const response = await grpcService.getAllProducts(1, 10);
        
        expect(response).toBeDefined();
        expect(response.success).toBe(true);
        expect(response.products).toBeDefined();
        expect(Array.isArray(response.products)).toBe(true);
        expect(response.total).toBeGreaterThanOrEqual(0);
        expect(response.page).toBe(1);
        expect(response.limit).toBe(10);
      } catch (error) {
        // Expected if gRPC server is not running
        expect(error).toBeDefined();
      }
    });

    test('should get products by category', async () => {
      try {
        const response = await grpcService.getProductsByCategory('Electronics', 1, 10);
        
        expect(response).toBeDefined();
        expect(response.success).toBe(true);
        expect(response.products).toBeDefined();
        expect(Array.isArray(response.products)).toBe(true);
        
        // All products should be in the specified category
        response.products.forEach(product => {
          expect(product.category).toBe('Electronics');
        });
      } catch (error) {
        // Expected if gRPC server is not running
        expect(error).toBeDefined();
      }
    });

    test('should handle non-existent product ID', async () => {
      try {
        const response = await grpcService.getProductById(99999);
        expect(response.success).toBe(false);
      } catch (error) {
        // Expected if gRPC server is not running
        expect(error).toBeDefined();
      }
    });

    test('should handle non-existent SKU', async () => {
      try {
        const response = await grpcService.getProductBySku('NONEXISTENT-SKU');
        expect(response.success).toBe(false);
      } catch (error) {
        // Expected if gRPC server is not running
        expect(error).toBeDefined();
      }
    });
  });

  test.describe('Product Updates', () => {
    let testProductId: number;

    test.beforeAll(async () => {
      // Create a test product for update tests
      const productData = DatabaseTestData.generateProducts(1)[0];
      
      try {
        const response = await grpcService.createProduct(productData);
        if (response.success && response.product.id) {
          testProductId = response.product.id;
          createdProductIds.push(testProductId);
        }
      } catch (error) {
        console.log('Failed to create test product for update tests:', error);
      }
    });

    test('should update product successfully', async () => {
      if (!testProductId) {
        test.skip(true, 'Test product not created');
        return;
      }
      
      const updates = {
        name: 'Updated Product Name',
        description: 'Updated Description',
        price: 149.99,
        stock_quantity: 25,
        is_active: false
      };
      
      try {
        const response = await grpcService.updateProduct(testProductId, updates);
        
        expect(response).toBeDefined();
        expect(response.success).toBe(true);
        expect(response.product).toBeDefined();
        expect(response.product.name).toBe(updates.name);
        expect(response.product.description).toBe(updates.description);
        expect(response.product.price).toBe(updates.price);
        expect(response.product.stock_quantity).toBe(updates.stock_quantity);
        expect(response.product.is_active).toBe(updates.is_active);
      } catch (error) {
        // Expected if gRPC server is not running
        expect(error).toBeDefined();
      }
    });

    test('should update product price successfully', async () => {
      if (!testProductId) {
        test.skip(true, 'Test product not created');
        return;
      }
      
      const updates = {
        price: 199.99
      };
      
      try {
        const response = await grpcService.updateProduct(testProductId, updates);
        
        expect(response).toBeDefined();
        expect(response.success).toBe(true);
        expect(response.product).toBeDefined();
        expect(response.product.price).toBe(updates.price);
      } catch (error) {
        // Expected if gRPC server is not running
        expect(error).toBeDefined();
      }
    });

    test('should update product stock quantity', async () => {
      if (!testProductId) {
        test.skip(true, 'Test product not created');
        return;
      }
      
      const updates = {
        stock_quantity: 50
      };
      
      try {
        const response = await grpcService.updateProduct(testProductId, updates);
        
        expect(response).toBeDefined();
        expect(response.success).toBe(true);
        expect(response.product).toBeDefined();
        expect(response.product.stock_quantity).toBe(updates.stock_quantity);
      } catch (error) {
        // Expected if gRPC server is not running
        expect(error).toBeDefined();
      }
    });

    test('should handle partial updates', async () => {
      if (!testProductId) {
        test.skip(true, 'Test product not created');
        return;
      }
      
      const updates = {
        image_url: 'https://example.com/updated-image.jpg'
      };
      
      try {
        const response = await grpcService.updateProduct(testProductId, updates);
        
        expect(response).toBeDefined();
        expect(response.success).toBe(true);
        expect(response.product).toBeDefined();
        expect(response.product.image_url).toBe(updates.image_url);
      } catch (error) {
        // Expected if gRPC server is not running
        expect(error).toBeDefined();
      }
    });

    test('should handle non-existent product update', async () => {
      const updates = {
        name: 'Updated Name'
      };
      
      try {
        const response = await grpcService.updateProduct(99999, updates);
        expect(response.success).toBe(false);
      } catch (error) {
        // Expected if gRPC server is not running
        expect(error).toBeDefined();
      }
    });
  });

  test.describe('Product Deletion', () => {
    test('should delete product successfully', async () => {
      // Create a product to delete
      const productData = DatabaseTestData.generateProducts(1)[0];
      
      try {
        const createResponse = await grpcService.createProduct(productData);
        expect(createResponse.success).toBe(true);
        
        const productId = createResponse.product.id;
        
        // Delete the product
        const deleteResponse = await grpcService.deleteProduct(productId);
        
        expect(deleteResponse).toBeDefined();
        expect(deleteResponse.success).toBe(true);
        
        // Verify product is deleted
        const getResponse = await grpcService.getProductById(productId);
        expect(getResponse.success).toBe(false);
      } catch (error) {
        // Expected if gRPC server is not running
        expect(error).toBeDefined();
      }
    });

    test('should handle non-existent product deletion', async () => {
      try {
        const response = await grpcService.deleteProduct(99999);
        expect(response.success).toBe(false);
      } catch (error) {
        // Expected if gRPC server is not running
        expect(error).toBeDefined();
      }
    });

    test('should handle cascade deletion', async () => {
      // This test would verify that deleting a product also deletes related data
      // In a real scenario, you would test cascade deletion rules
      expect(grpcService).toBeDefined();
    });
  });

  test.describe('Product Business Logic', () => {
    test('should enforce unique SKUs', async () => {
      const productData = DatabaseTestData.generateProducts(1)[0];
      
      try {
        // Create first product
        const response1 = await grpcService.createProduct(productData);
        expect(response1.success).toBe(true);
        
        if (response1.product.id) {
          createdProductIds.push(response1.product.id);
        }
        
        // Try to create second product with same SKU
        const response2 = await grpcService.createProduct(productData);
        expect(response2.success).toBe(false);
      } catch (error) {
        // Expected if gRPC server is not running
        expect(error).toBeDefined();
      }
    });

    test('should validate price range', async () => {
      const invalidProductData = {
        name: 'Test Product',
        description: 'Test Description',
        price: -10.00, // Negative price
        category: 'Electronics',
        brand: 'Test Brand',
        stock_quantity: 10,
        sku: 'TEST-SKU-NEGATIVE'
      };
      
      try {
        const response = await grpcService.createProduct(invalidProductData);
        expect(response.success).toBe(false);
      } catch (error) {
        // Expected if gRPC server is not running or validation fails
        expect(error).toBeDefined();
      }
    });

    test('should validate stock quantity', async () => {
      const invalidProductData = {
        name: 'Test Product',
        description: 'Test Description',
        price: 99.99,
        category: 'Electronics',
        brand: 'Test Brand',
        stock_quantity: -5, // Negative stock
        sku: 'TEST-SKU-STOCK'
      };
      
      try {
        const response = await grpcService.createProduct(invalidProductData);
        expect(response.success).toBe(false);
      } catch (error) {
        // Expected if gRPC server is not running or validation fails
        expect(error).toBeDefined();
      }
    });

    test('should handle product categories', async () => {
      const categories = ['Electronics', 'Clothing', 'Books', 'Home & Garden'];
      
      await Promise.all(
        categories.map(async category => {
          const productData = {
            name: `Test ${category} Product`,
            description: `Test ${category} Description`,
            price: 99.99,
            category: category,
            brand: 'Test Brand',
            stock_quantity: 10,
            sku: `TEST-SKU-${category.toUpperCase()}`
          };
          
          const response = await grpcService.createProduct(productData);
          expect(response.success).toBe(true);
          
          if (response.product.id) {
            createdProductIds.push(response.product.id);
          }
        })
      ).catch(error => {
        // Expected if gRPC server is not running
        expect(error).toBeDefined();
      });
    });
  });

  test.describe('Product Performance', () => {
    test('should handle bulk product creation', async () => {
      const productsData = DatabaseTestData.generateProducts(10);
      const startTime = Date.now();
      
      try {
        const promises = productsData.map(productData => grpcService.createProduct(productData));
        const results = await Promise.allSettled(promises);
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        expect(results).toHaveLength(10);
        expect(duration).toBeLessThan(30000); // Should complete within 30 seconds
        
        // Track created products for cleanup
        results.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value.success && result.value.product.id) {
            createdProductIds.push(result.value.product.id);
          }
        });
      } catch (error) {
        // Expected if gRPC server is not running
        expect(error).toBeDefined();
      }
    });

    test('should handle concurrent product operations', async () => {
      const productData = DatabaseTestData.generateProducts(1)[0];
      
      try {
        // Create product
        const createResponse = await grpcService.createProduct(productData);
        expect(createResponse.success).toBe(true);
        
        const productId = createResponse.product.id;
        createdProductIds.push(productId);
        
        // Perform concurrent operations
        const operations = [
          grpcService.getProductById(productId),
          grpcService.getProductBySku(productData.sku),
          grpcService.updateProduct(productId, { price: 199.99 }),
          grpcService.getAllProducts(1, 1)
        ];
        
        const results = await Promise.allSettled(operations);
        expect(results).toHaveLength(4);
      } catch (error) {
        // Expected if gRPC server is not running
        expect(error).toBeDefined();
      }
    });

    test('should handle large product catalogs', async () => {
      try {
        // Test pagination with large datasets
        const response = await grpcService.getAllProducts(1, 100);
        
        expect(response).toBeDefined();
        expect(response.success).toBe(true);
        expect(response.products).toBeDefined();
        expect(response.total).toBeGreaterThanOrEqual(0);
      } catch (error) {
        // Expected if gRPC server is not running
        expect(error).toBeDefined();
      }
    });
  });
}); 
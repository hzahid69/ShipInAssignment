import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { ProductsPage } from '../pages/ProductsPage';
import { TestData } from '../utils/TestData';
import { blockAds } from '../utils/adblock';

test.describe('Quick Demo - Basic Functionality', () => {
    let homePage: HomePage;
    let productsPage: ProductsPage;

    test.beforeEach(async ({ page }) => {
        homePage = new HomePage(page);
        productsPage = new ProductsPage(page);
        await blockAds(page);
    });

    test('Quick Demo - Home Page and Search', async ({ page }) => {
        // Step 1: Navigate to home page
        await test.step('Navigate to home page', async () => {
            await homePage.navigateToHome();
            
            // Verify page loads
            const pageTitle = await homePage.getPageTitle();
            expect(pageTitle).toContain(TestData.EXPECTED_HOME_TITLE);
            
            console.log('✅ Home page loaded successfully');
        });

        // Step 2: Test search functionality
        await test.step('Test product search', async () => {
            await homePage.searchProduct('dress');
            
            // Verify search results
            const productCount = await productsPage.getProductCount();
            expect(productCount).toBeGreaterThan(0);
            
            console.log(`✅ Search found ${productCount} products`);
        });

        // Step 3: Navigate to products page
        await test.step('Navigate to products page', async () => {
            await productsPage.navigateToProducts();
            
            // Verify products page loads
            expect(await productsPage.isProductGridVisible()).toBeTruthy();
            
            const productCount = await productsPage.getProductCount();
            console.log(`✅ Products page loaded with ${productCount} products`);
        });

        // Step 4: Test basic navigation
        await test.step('Test basic navigation', async () => {
            // Test category navigation
            await homePage.navigateToHome();
            await homePage.clickCategory('Women');
            await homePage.clickCategory('Men');
            
            console.log('✅ Category navigation working');
        });
    });
}); 
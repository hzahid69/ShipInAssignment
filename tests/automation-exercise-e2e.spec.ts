import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { ProductsPage } from '../pages/ProductsPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { LoginPage } from '../pages/LoginPage';
import { SignupPage } from '../pages/SignupPage';
import { TestData } from '../utils/TestData';

test.describe('Automation Exercise E2E Tests', () => {
    let homePage: HomePage;
    let productsPage: ProductsPage;
    let productDetailPage: ProductDetailPage;
    let cartPage: CartPage;
    let checkoutPage: CheckoutPage;
    let loginPage: LoginPage;
    let signupPage: SignupPage;

    test.beforeEach(async ({ page }) => {
        homePage = new HomePage(page);
        productsPage = new ProductsPage(page);
        productDetailPage = new ProductDetailPage(page);
        cartPage = new CartPage(page);
        checkoutPage = new CheckoutPage(page);
        loginPage = new LoginPage(page);
        signupPage = new SignupPage(page);
    });

    test('Complete E2E Shopping Flow - Navigation, Search, Add to Cart, Checkout', async ({ page }) => {
        // Step 1: Navigate to the home page and verify it loads correctly
        await test.step('Navigate to home page and verify elements', async () => {
            await homePage.navigateToHome();
            
            // Verify page title
            const pageTitle = await homePage.getPageTitle();
            expect(pageTitle).toContain(TestData.EXPECTED_HOME_TITLE);
            
            // Verify key elements are visible
            expect(await homePage.isSliderVisible()).toBeTruthy();
            expect(await homePage.isCategoryVisible()).toBeTruthy();
            expect(await homePage.isBrandSectionVisible()).toBeTruthy();
            
            // Verify navigation elements
            await homePage.expectToBeVisible(homePage.header);
            await homePage.expectToBeVisible(homePage.footer);
            await homePage.expectToBeVisible(homePage.productsButton);
            await homePage.expectToBeVisible(homePage.cartButton);
        });

        // Step 2: Search for a product
        await test.step('Search for products', async () => {
            await homePage.searchProduct(TestData.SEARCH_PRODUCT);
            
            // Verify search results page loads
            expect(await productsPage.isProductGridVisible()).toBeTruthy();
            
            // Verify products are displayed
            const productCount = await productsPage.getProductCount();
            expect(productCount).toBeGreaterThan(0);
        });

        // Step 3: Navigate to products page and explore categories
        await test.step('Navigate to products page and explore categories', async () => {
            await productsPage.navigateToProducts();
            
            // Verify products page loads
            expect(await productsPage.isProductGridVisible()).toBeTruthy();
            expect(await productsPage.isCategoryFilterVisible()).toBeTruthy();
            expect(await productsPage.isBrandFilterVisible()).toBeTruthy();
            
            // Get initial product count
            const initialProductCount = await productsPage.getProductCount();
            expect(initialProductCount).toBeGreaterThan(0);
        });

        // Step 4: Filter products by category
        await test.step('Filter products by category', async () => {
            await productsPage.filterByCategory(TestData.PRODUCT_CATEGORY);
            
            // Verify filtered results
            const filteredProductCount = await productsPage.getProductCount();
            expect(filteredProductCount).toBeGreaterThanOrEqual(0);
        });

        // Step 5: View product details
        await test.step('View product details', async () => {
            // Get first product name before clicking
            const firstProductName = await productsPage.getProductName(0);
            const firstProductPrice = await productsPage.getProductPrice(0);
            
            // Click on first product to view details
            await productsPage.viewProduct(0);
            
            // Verify product detail page loads
            expect(await productDetailPage.isProductImageVisible()).toBeTruthy();
            expect(await productDetailPage.isProductInformationVisible()).toBeTruthy();
            expect(await productDetailPage.isAddToCartButtonVisible()).toBeTruthy();
            
            // Verify product information
            const detailProductName = await productDetailPage.getProductName();
            const detailProductPrice = await productDetailPage.getProductPrice();
            const detailProductCategory = await productDetailPage.getProductCategory();
            const detailProductAvailability = await productDetailPage.getProductAvailability();
            
            expect(detailProductName).toBeTruthy();
            expect(detailProductPrice).toBeTruthy();
            expect(detailProductCategory).toBeTruthy();
            expect(detailProductAvailability).toBeTruthy();
            
            console.log(`Product details: ${detailProductName} - ${detailProductPrice} - ${detailProductCategory} - ${detailProductAvailability}`);
        });

        // Step 6: Add product to cart
        await test.step('Add product to cart', async () => {
            // Add product to cart with quantity 2
            await productDetailPage.addToCartWithQuantity(2);
            await productDetailPage.goToCartViaModal();
            
            // Verify cart is not empty
            expect(await cartPage.isCartEmpty()).toBeFalsy();
            
            // Get cart summary
            const cartSummary = await cartPage.getCartSummary();
            expect(cartSummary.itemCount).toBeGreaterThan(0);
            
            console.log(`Cart contains ${cartSummary.itemCount} items`);
            console.log(`Cart items: ${cartSummary.itemNames.join(', ')}`);
            console.log(`Cart total: ${cartSummary.cartTotal}`);
        });

        // Step 7: Add another product to cart from products page
        await test.step('Add another product to cart from products page', async () => {
            await productsPage.navigateToProducts();
            
            // Add second product to cart
            await productsPage.addProductToCart(1);
            
            // Verify we're back on products page
            expect(await productsPage.isProductGridVisible()).toBeTruthy();
        });

        // Step 8: View and manage cart
        await test.step('View cart', async () => {
            await cartPage.navigateToCart();
            
            // Verify cart elements
            expect(await cartPage.isCartTitleVisible()).toBeTruthy();
            expect(await cartPage.isProceedToCheckoutButtonVisible()).toBeTruthy();
            expect(await cartPage.isContinueShoppingButtonVisible()).toBeTruthy();
            
            // Get updated cart summary
            const cartSummary = await cartPage.getCartSummary();
            expect(cartSummary.itemCount).toBeGreaterThan(0);
            
            console.log(`Updated cart contains ${cartSummary.itemCount} items`);
            console.log(`Updated cart total: ${cartSummary.cartTotal}`);
        });

        // Step 9: Register new user account
        await test.step('Register new user account', async () => {
            await loginPage.navigateToLogin();
            
            // Verify login page loads
            expect(await loginPage.isLoginFormVisible()).toBeTruthy();
            expect(await signupPage.isSignupFormVisible()).toBeTruthy();
            
            // Generate unique test data
            const testEmail = TestData.generateRandomEmail();
            const testName = TestData.generateRandomName();
            
            // Start registration process
            await signupPage.signup(testName, testEmail);
            
            // Fill account information
            await signupPage.fillAccountInformation(
                TestData.ALT_USER_TITLE as 'Mr' | 'Mrs',
                TestData.USER_PASSWORD,
                TestData.ALT_USER_BIRTH_DAY,
                TestData.ALT_USER_BIRTH_MONTH,
                TestData.ALT_USER_BIRTH_YEAR,
                false, // Don't subscribe to newsletter
                true   // Receive special offers
            );
            
            // Fill address information
            await signupPage.fillAddressInformation(
                TestData.ALT_USER_FIRST_NAME,
                TestData.ALT_USER_LAST_NAME,
                TestData.ALT_USER_COMPANY,
                TestData.ALT_USER_ADDRESS,
                TestData.ALT_USER_ADDRESS2,
                TestData.ALT_USER_COUNTRY,
                TestData.ALT_USER_STATE,
                TestData.ALT_USER_CITY,
                TestData.ALT_USER_ZIPCODE,
                TestData.ALT_USER_PHONE
            );
            
            // Create account
            await signupPage.createAccount();
            
            // Verify account was created successfully
            expect(await signupPage.isAccountCreated()).toBeTruthy();
            
            const accountCreatedMessage = await signupPage.getAccountCreatedMessage();
            expect(accountCreatedMessage).toContain('Account Created!');
            
            console.log(`Account created successfully for: ${testEmail}`);
            
            // Continue after account creation
            await signupPage.continueAfterAccountCreation();
            
            // Verify user is logged in
            expect(await loginPage.isLoggedIn()).toBeTruthy();
        });

        // Step 10: Proceed to checkout
        await test.step('Proceed to checkout', async () => {
            await cartPage.navigateToCart();
            await cartPage.proceedToCheckout();
            
            // Verify checkout page loads
            expect(await checkoutPage.isCheckoutTitleVisible()).toBeTruthy();
            expect(await checkoutPage.isOrderSummaryVisible()).toBeTruthy();
            
            // Get order summary
            const orderSummary = await checkoutPage.getOrderSummary();
            expect(orderSummary.itemCount).toBeGreaterThan(0);
            expect(orderSummary.orderTotal).toBeTruthy();
            
            console.log(`Checkout order summary: ${orderSummary.itemCount} items, Total: ${orderSummary.orderTotal}`);
        });

        // Step 11: Complete checkout process
        await test.step('Complete checkout process', async () => {
            await checkoutPage.addComment(TestData.ORDER_COMMENT);
            
            await checkoutPage.placeOrder();
            
            expect(await checkoutPage.isPaymentFormVisible()).toBeTruthy();
            
            await checkoutPage.fillPaymentDetails(
                TestData.CARD_NAME,
                TestData.CARD_NUMBER,
                TestData.CVC,
                TestData.EXPIRY_MONTH,
                TestData.EXPIRY_YEAR
            );
            
            await checkoutPage.payAndConfirmOrder();
            
            expect(await checkoutPage.isOrderPlaced()).toBeTruthy();
            
            await checkoutPage.continueAfterOrder();
        });
    });

    test('Home Page Navigation and Features', async ({ page }) => {
        await test.step('Test home page navigation and features', async () => {
            await homePage.navigateToHome();
            
            // Test category navigation
            await homePage.clickCategory('women');
            await homePage.clickCategory('men');
            await homePage.clickCategory('kids');
            
            // Test scroll functionality
            await homePage.scrollToBottom();
            await homePage.clickScrollUp();
            await homePage.scrollToTop();
            
            // Test newsletter subscription
            await homePage.subscribeToNewsletter(TestData.NEWSLETTER_EMAIL);
            
            // Verify all main sections are visible
            expect(await homePage.isSliderVisible()).toBeTruthy();
            expect(await homePage.isCategoryVisible()).toBeTruthy();
            expect(await homePage.isBrandSectionVisible()).toBeTruthy();
            expect(await homePage.isRecommendedItemsVisible()).toBeTruthy();
            
            // Get counts
            const featuredCount = await homePage.getFeaturedItemsCount();
            const brandCount = await homePage.getBrandItemsCount();
            
            console.log(`Home page features: ${featuredCount} featured items, ${brandCount} brand items`);
        });
    });

    test('Product Search', async ({ page }) => {
        await test.step('Test product search', async () => {
            await productsPage.navigateToProducts();
            
            // Test search functionality
            await productsPage.searchProduct('shirt');
            let searchResults = await productsPage.getProductCount();
            console.log(`Search results for 'shirt': ${searchResults} products`);
        });
    });

    test('Cart Management', async ({ page }) => {
        await test.step('Test cart management functionality', async () => {
            // Add products to cart
            await productsPage.navigateToProducts();
            await productsPage.addProductToCart(1);
            await productsPage.addProductToCart(2);
            
            // View cart
            await cartPage.goToCartViaModal();
            
            // Test cart operations
            const initialCount = await cartPage.getCartItemCount();
            expect(initialCount).toBeGreaterThan(0);
            
            // Remove item
            await cartPage.removeItem(0);
            
            const finalCount = await cartPage.getCartItemCount();
            expect(finalCount).toBeLessThan(initialCount);
            
            // Clear cart
            await cartPage.clearCart();
            expect(await cartPage.isCartEmpty()).toBeTruthy();
            
            console.log('Cart management tests completed');
        });
    });

    test('Product Review System', async ({ page }) => {
        await test.step('Test product review functionality', async () => {
            await productsPage.navigateToProducts();
            await productsPage.viewProduct(0);
            
            // Test review submission
            await productDetailPage.writeReview(
                TestData.USER_NAME,
                TestData.USER_EMAIL,
                TestData.REVIEW_COMMENT
            );
            
            console.log('Product review test completed');
        });
    });

    test('User Authentication Flow', async ({ page }) => {
        await test.step('Test complete authentication flow', async () => {
            // Navigate to login page
            await loginPage.navigateToLogin();
            
            // Verify login page elements
            expect(await loginPage.isLoginFormVisible()).toBeTruthy();
            expect(await signupPage.isSignupFormVisible()).toBeTruthy();
            
            // Generate unique test data
            const testEmail = TestData.generateRandomEmail();
            const testName = TestData.generateRandomName();
            
            console.log(`Testing authentication with email: ${testEmail}`);
            
            // Test registration process
            await test.step('User registration', async () => {
                await signupPage.signup(testName, testEmail);
                
                // Fill account information
                await signupPage.fillAccountInformation(
                    TestData.ALT_USER_TITLE as 'Mr' | 'Mrs',
                    TestData.USER_PASSWORD,
                    TestData.ALT_USER_BIRTH_DAY,
                    TestData.ALT_USER_BIRTH_MONTH,
                    TestData.ALT_USER_BIRTH_YEAR,
                    false, // Don't subscribe to newsletter
                    true   // Receive special offers
                );
                
                // Fill address information
                await signupPage.fillAddressInformation(
                    TestData.ALT_USER_FIRST_NAME,
                    TestData.ALT_USER_LAST_NAME,
                    TestData.ALT_USER_COMPANY,
                    TestData.ALT_USER_ADDRESS,
                    TestData.ALT_USER_ADDRESS2,
                    TestData.ALT_USER_COUNTRY,
                    TestData.ALT_USER_STATE,
                    TestData.ALT_USER_CITY,
                    TestData.ALT_USER_ZIPCODE,
                    TestData.ALT_USER_PHONE
                );
                
                // Create account
                await signupPage.createAccount();
                
                // Verify account creation
                expect(await signupPage.isAccountCreated()).toBeTruthy();
                console.log('Account created successfully');
                
                // Continue after account creation
                await signupPage.continueAfterAccountCreation();
                
                // Verify user is logged in
                expect(await loginPage.isLoggedIn()).toBeTruthy();
                console.log('User automatically logged in after registration');
            });
            
            // Test logout
            await test.step('User logout', async () => {
                await loginPage.logout();
                
                // Verify user is logged out
                expect(await loginPage.isLoggedOut()).toBeTruthy();
                console.log('User successfully logged out');
            });
            
            // Test login with existing credentials
            await test.step('User login', async () => {
                await loginPage.login(testEmail, TestData.USER_PASSWORD);
                
                // Verify user is logged in
                expect(await loginPage.isLoggedIn()).toBeTruthy();
                console.log('User successfully logged in with existing credentials');
            });
        });
    });
});
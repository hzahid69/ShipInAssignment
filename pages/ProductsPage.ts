import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { getTextContent } from '../utils/utils';

export class ProductsPage extends BasePage {
    readonly productsTitle: Locator;
    readonly productGrid: Locator;
    readonly productItems: Locator;
    readonly viewProductButtons: Locator;
    readonly addToCartButtons: Locator;
    readonly categoryFilter: Locator;
    readonly brandFilter: Locator;
    readonly priceFilter: Locator;
    readonly searchInput: Locator;
    readonly searchButton: Locator;
    readonly sortDropdown: Locator;
    readonly pagination: Locator;
    readonly continueShoppingButton: Locator;
    readonly viewCartButton: Locator;

    constructor(page: Page) {
        super(page);
        this.productsTitle = page.locator('.title.text-center');
        this.productGrid = page.locator('.features_items');
        this.productItems = page.locator('.single-products');
        this.viewProductButtons = page.locator('a[href*="/product_details/"]');
        this.addToCartButtons = page.locator('.add-to-cart');
        this.categoryFilter = page.locator('.left-sidebar');
        this.brandFilter = page.locator('.brands-name');
        this.priceFilter = page.locator('.price-range');
        this.searchInput = page.locator('#search_product');
        this.searchButton = page.locator('#submit_search');
        this.sortDropdown = page.locator('#sort');
        this.pagination = page.locator('.pagination');
        this.continueShoppingButton = page.locator('.btn-success');
        this.viewCartButton = page.locator('a[href="/view_cart"]');
    }

    async navigateToProducts() {
        // await this.productsButton.first().click()
        await this.goto('/products');
        await this.waitForPageLoad();
    }

    async searchProduct(productName: string) {
        await this.searchInput.fill(productName);
        await this.searchButton.click();
        await this.waitForPageLoad();
    }

    async getProductCount(): Promise<number> {
        return await this.productItems.count();
    }

    async addProductToCart(productIndex: number = 0) {
        const addToCartButtons = this.addToCartButtons;
        const buttonCount = await addToCartButtons.count();

        if (productIndex >= buttonCount) {
            throw new Error(`Product index ${productIndex} is out of range. Total products: ${buttonCount}`);
        }
        await addToCartButtons.nth(productIndex).scrollIntoViewIfNeeded();
        await addToCartButtons.nth(productIndex).click({ force: true });
    }

    async viewProduct(productIndex: number = 0) {
        const viewButtons = this.viewProductButtons;
        const buttonCount = await viewButtons.count();

        if (productIndex >= buttonCount) {
            throw new Error(`Product index ${productIndex} is out of range. Total products: ${buttonCount}`);
        }

        await viewButtons.nth(productIndex).click();
    }

    async filterByCategory(category: string) {
        const categoryLink = this.page.locator(`a[href="#${category}"]`);
        await categoryLink.click();
        await this.waitForPageLoad();
    }

    async filterByBrand(brand: string) {
        const brandLink = this.page.locator(`a[href="/brand_products/${brand}"]`);
        await brandLink.click();
        await this.waitForPageLoad();
    }

    async sortProducts(sortOption: string) {
        await this.sortDropdown.selectOption(sortOption);
        await this.waitForPageLoad();
    }

    async continueShopping() {
        await this.continueShoppingButton.click();
        await this.waitForPageLoad();
    }

    async viewCart() {
        await this.viewCartButton.click();
        await this.waitForPageLoad();
    }

    async getProductName(productIndex: number = 0): Promise<string> {
        const productItems = this.productItems;
        const itemCount = await productItems.count();

        if (productIndex >= itemCount) {
            throw new Error(`Product index ${productIndex} is out of range. Total products: ${itemCount}`);
        }

        const productName = productItems.nth(productIndex).locator('p').first();
        return await getTextContent(await productName);
    }

    async getProductPrice(productIndex: number = 0): Promise<string> {
        const productItems = this.productItems;
        const itemCount = await productItems.count();

        if (productIndex >= itemCount) {
            throw new Error(`Product index ${productIndex} is out of range. Total products: ${itemCount}`);
        }

        const productPrice = productItems.nth(productIndex).locator('h2').first();
        return await getTextContent(await productPrice);
    }

    async isProductGridVisible(): Promise<boolean> {
        return await this.productGrid.isVisible();
    }

    async isCategoryFilterVisible(): Promise<boolean> {
        return await this.categoryFilter.isVisible();
    }

    async isBrandFilterVisible(): Promise<boolean> {
        return await this.brandFilter.isVisible();
    }
} 
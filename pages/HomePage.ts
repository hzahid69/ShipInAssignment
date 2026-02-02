import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
    readonly slider: Locator;
    readonly featuredItems: Locator;
    readonly categoryTitle: Locator;
    readonly womenCategory: Locator;
    readonly menCategory: Locator;
    readonly kidsCategory: Locator;
    readonly brandTitle: Locator;
    readonly brandItems: Locator;
    readonly recommendedItems: Locator;
    readonly scrollUpButton: Locator;
    readonly searchInput: Locator;
    readonly searchButton: Locator;

    constructor(page: Page) {
        super(page);
        this.slider = page.locator('.carousel-inner');
        this.featuredItems = page.locator('.features_items');
        this.categoryTitle = page.locator('.left-sidebar h2');
        this.womenCategory = page.locator('a[href="#Women"]');
        this.menCategory = page.locator('a[href="#Men"]');
        this.kidsCategory = page.locator('a[href="#Kids"]');
        this.brandTitle = page.locator('.brands-name');
        this.brandItems = page.locator('.brands-name ul li');
        this.recommendedItems = page.locator('#recommended-item-carousel');
        this.scrollUpButton = page.locator('#scrollUp');
        this.searchInput = page.locator('#search_product');
        this.searchButton = page.locator('#submit_search');
    }

    async navigateToHome() {
        await this.goto('/');
        await this.waitForPageLoad();
    }
    async searchProduct(productName: string) {
        // Navigate to products page first
        await this.productsButton.click();
        // await this.waitForPageLoad();

        // Then search for the product
        await this.searchInput.fill(productName);
        await this.searchButton.click();
        await this.waitForPageLoad();
    }

    async clickCategory(categoryName: 'Women' | 'Men' | 'Kids') {
        const categoryLocator = this.page.locator(`a[href*="#${categoryName}"]`);
        await categoryLocator.click();
        await this.waitForPageLoad();
    }

    async scrollToBottom() {
        await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    }

    async scrollToTop() {
        await this.page.evaluate(() => window.scrollTo(0, 0));
    }

    async clickScrollUp() {
        await this.scrollUpButton.click();
    }

    async getFeaturedItemsCount(): Promise<number> {
        return await this.featuredItems.locator('.col-sm-4').count();
    }

    async getBrandItemsCount(): Promise<number> {
        return await this.brandItems.count();
    }

    async isSliderVisible(): Promise<boolean> {
        return await this.slider.first().isVisible();
    }

    async isCategoryVisible(): Promise<boolean> {
        return await this.categoryTitle.first().isVisible();
    }

    async isBrandSectionVisible(): Promise<boolean> {
        return await this.brandTitle.isVisible();
    }

    async isRecommendedItemsVisible(): Promise<boolean> {
        return await this.recommendedItems.isVisible();
    }
} 
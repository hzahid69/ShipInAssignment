import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { getTextContent } from '../utils/utils';

export class ProductDetailPage extends BasePage {
    readonly productImage: Locator;
    readonly productName: Locator;
    readonly productCategory: Locator;
    readonly productPrice: Locator;
    readonly productAvailability: Locator;
    readonly productCondition: Locator;
    readonly productBrand: Locator;
    readonly quantityInput: Locator;
    readonly addToCartButton: Locator;
    readonly addToCartModal: Locator;
    readonly writeReviewButton: Locator;
    readonly reviewNameInput: Locator;
    readonly reviewEmailInput: Locator;
    readonly reviewTextarea: Locator;
    readonly submitReviewButton: Locator;
    readonly relatedProducts: Locator;
    readonly productDescription: Locator;
    readonly productFeatures: Locator;

    constructor(page: Page) {
        super(page);
        this.productImage = page.locator('.view-product');
        this.productName = page.locator('.product-information h2');
        this.productCategory = page.locator('.product-information p:has-text("Category:")');
        this.productPrice = page.locator('.product-information span span');
        this.productAvailability = page.locator('.product-information p:has-text("Availability:")');
        this.productCondition = page.locator('.product-information p:has-text("Condition:")');
        this.productBrand = page.locator('.product-information p:has-text("Brand:")');
        this.quantityInput = page.locator('#quantity');
        this.addToCartButton = page.locator('.cart');
        this.addToCartModal = page.locator('.modal-content .modal-title:has-text("Added!")');
        this.writeReviewButton = page.locator('a[href="#reviews"]');
        this.reviewNameInput = page.locator('#name');
        this.reviewEmailInput = page.locator('#email');
        this.reviewTextarea = page.locator('#review');
        this.submitReviewButton = page.locator('#button-review');
        this.relatedProducts = page.locator('.recommended_items');
        this.productDescription = page.locator('.product-information p:has-text("Product Code:")');
        this.productFeatures = page.locator('.product-information p:has-text("Features:")');
    }

    async getProductName(): Promise<string> {
        return await getTextContent(await this.productName);
    }

    async getProductPrice(): Promise<string> {
        return await getTextContent(await this.productPrice);
    }

    async getProductCategory(): Promise<string> {
        const categoryText = await getTextContent(await this.productCategory);
        return categoryText.replace('Category:', '').trim();
    }

    async getProductAvailability(): Promise<string> {
        const availabilityText = await getTextContent(await this.productAvailability);
        return availabilityText.replace('Availability:', '').trim(); 
    }

    async getProductCondition(): Promise<string> {
        const conditionText = await getTextContent(await this.productCondition);
        return conditionText.replace('Condition:', '').trim();
    }

    async getProductBrand(): Promise<string> {
        const brandText = await getTextContent(await this.productBrand);
        return brandText.replace('Brand:', '').trim();
    }

    async setQuantity(quantity: number) {
        await this.quantityInput.clear();
        await this.quantityInput.fill(quantity.toString());
    }

    async addToCart() {
        await this.addToCartButton.click();
        await this.waitForAddToCartModal();
    }

    async waitForAddToCartModal() {
        await this.addToCartModal.waitFor({ state: 'visible' });
    }

    async addToCartWithQuantity(quantity: number) {
        await this.setQuantity(quantity);
        await this.addToCart();
    }

    async goToCartViaModal() {
        await this.clickLocatorWithExactText(this.page.locator('a'), 'View Cart')
    }

    async writeReview(name: string, email: string, review: string) {
        await this.writeReviewButton.click();
        await this.reviewNameInput.fill(name);
        await this.reviewEmailInput.fill(email);
        await this.reviewTextarea.fill(review);
        await this.submitReviewButton.click();
        await this.waitForPageLoad();
    }

    async isProductImageVisible(): Promise<boolean> {
        return await this.productImage.isVisible();
    }

    async isProductInformationVisible(): Promise<boolean> {
        return await this.productName.isVisible();
    }

    async isAddToCartButtonVisible(): Promise<boolean> {
        return await this.addToCartButton.isVisible();
    }

    async isWriteReviewButtonVisible(): Promise<boolean> {
        return await this.writeReviewButton.isVisible();
    }

    async isRelatedProductsVisible(): Promise<boolean> {
        return await this.relatedProducts.isVisible();
    }

    async getRelatedProductsCount(): Promise<number> {
        return await this.relatedProducts.locator('.item').count();
    }

    async clickRelatedProduct(productIndex: number = 0) {
        const relatedProducts = this.relatedProducts.locator('.item');
        const productCount = await relatedProducts.count();

        if (productIndex >= productCount) {
            throw new Error(`Related product index ${productIndex} is out of range. Total products: ${productCount}`);
        }

        await relatedProducts.nth(productIndex).click();
        await this.waitForPageLoad();
    }
} 
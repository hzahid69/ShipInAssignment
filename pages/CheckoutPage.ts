import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { getTextContent } from '../utils/utils';

export class CheckoutPage extends BasePage {
    readonly checkoutTitle: Locator;
    readonly orderSummary: Locator;
    readonly orderItems: Locator;
    readonly orderTotal: Locator;
    readonly deliveryAddress: Locator;
    readonly billingAddress: Locator;
    readonly commentTextarea: Locator;
    readonly placeOrderButton: Locator;
    readonly paymentTitle: Locator;
    readonly cardNameInput: Locator;
    readonly cardNumberInput: Locator;
    readonly cvcInput: Locator;
    readonly expiryMonthInput: Locator;
    readonly expiryYearInput: Locator;
    readonly payAndConfirmButton: Locator;
    readonly orderPlacedMessage: Locator;
    readonly orderNumber: Locator;
    readonly continueButton: Locator;
    readonly downloadInvoiceButton: Locator;

    constructor(page: Page) {
        super(page);
        this.checkoutTitle = page.locator('.breadcrumbs');
        this.orderSummary = page.locator('#cart_info');
        this.orderItems = page.locator('#cart_info tbody tr');
        this.orderTotal = page.locator('.cart_total_price');
        this.deliveryAddress = page.locator('#address_delivery');
        this.billingAddress = page.locator('#address_invoice');
        this.commentTextarea = page.locator('textarea[name="message"]');
        this.placeOrderButton = page.locator('a[href="/payment"]');
        this.paymentTitle = page.locator('.heading');
        this.cardNameInput = page.locator('input[name="name_on_card"]');
        this.cardNumberInput = page.locator('input[name="card_number"]');
        this.cvcInput = page.locator('input[name="cvc"]');
        this.expiryMonthInput = page.locator('input[name="expiry_month"]');
        this.expiryYearInput = page.locator('input[name="expiry_year"]');
        this.payAndConfirmButton = page.locator('#submit');
        this.orderPlacedMessage = page.locator('h2[data-qa="order-placed"]');
        this.continueButton = page.locator('.btn-primary');
        this.downloadInvoiceButton = page.locator('a[href="/download_invoice/500"]');
    }

    async navigateToCheckout() {
        await this.goto('/checkout');
        await this.waitForPageLoad();
    }

    async getOrderItemCount(): Promise<number> {
        return await this.orderItems.count();
    }

    async getOrderTotal(): Promise<string> {
        return await getTextContent(await this.orderTotal.last());
    }

    async addComment(comment: string) {
        await this.commentTextarea.fill(comment);
    }

    async placeOrder() {
        await this.placeOrderButton.click();
    }

    async fillPaymentDetails(cardName: string, cardNumber: string, cvc: string, expiryMonth: string, expiryYear: string) {
        await this.cardNameInput.fill(cardName);
        await this.cardNumberInput.fill(cardNumber);
        await this.cvcInput.fill(cvc);
        await this.expiryMonthInput.fill(expiryMonth);
        await this.expiryYearInput.fill(expiryYear);
    }

    async payAndConfirmOrder() {
        await this.payAndConfirmButton.click();
    }

    async continueAfterOrder() {
        await this.continueButton.click();
    }

    async downloadInvoice() {
        await this.downloadInvoiceButton.click();
        await this.waitForPageLoad();
    }

    async isOrderPlaced(): Promise<boolean> {
        return await this.orderPlacedMessage.isVisible();
    }

    async isCheckoutTitleVisible(): Promise<boolean> {
        return await this.checkoutTitle.isVisible();
    }

    async isOrderSummaryVisible(): Promise<boolean> {
        return await this.orderSummary.isVisible();
    }

    async isDeliveryAddressVisible(): Promise<boolean> {
        return await this.deliveryAddress.isVisible();
    }

    async isBillingAddressVisible(): Promise<boolean> {
        return await this.billingAddress.isVisible();
    }

    async isPaymentFormVisible(): Promise<boolean> {
        return await this.paymentTitle.isVisible();
    }

    async getDeliveryAddressText(): Promise<string> {
        return await getTextContent(await this.deliveryAddress);
    }

    async getBillingAddressText(): Promise<string> {
        return await getTextContent(await this.billingAddress);
    }

    async getOrderSummary(): Promise<{
        itemCount: number;
        orderTotal: string;
        deliveryAddress: string;
        billingAddress: string;
    }> {
        return {
            itemCount: await this.getOrderItemCount(),
            orderTotal: await this.getOrderTotal(),
            deliveryAddress: await this.getDeliveryAddressText(),
            billingAddress: await this.getBillingAddressText()
        };
    }

    async completeCheckoutProcess(
        comment: string,
        cardName: string,
        cardNumber: string,
        cvc: string,
        expiryMonth: string,
        expiryYear: string
    ) {
        await this.addComment(comment);
        await this.placeOrder();
        await this.fillPaymentDetails(cardName, cardNumber, cvc, expiryMonth, expiryYear);
        await this.payAndConfirmOrder();
    }
} 
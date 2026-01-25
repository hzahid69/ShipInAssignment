import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";
import { getTextContent } from "../utils/utils";

interface CartItem {
  name: string;
  price: string;
  quantity: string;
  total: string;
}

interface CartSummary {
  itemNames: any;
  itemCount: number;
  items: CartItem[];
  cartTotal: string;
}

export class CartPage extends BasePage {
  readonly cartTitle: Locator;
  readonly cartItems: Locator;
  readonly cartItemNames: Locator;
  readonly cartItemPrices: Locator;
  readonly cartItemQuantities: Locator;
  readonly cartItemTotals: Locator;
  readonly removeButtons: Locator;
  readonly proceedToCheckoutButton: Locator;
  readonly continueShoppingButton: Locator;
  readonly emptyCartMessage: Locator;
  readonly cartTotal: Locator;
  readonly quantityInputs: Locator;
  readonly updateCartButton: Locator;

  constructor(page: Page) {
    super(page);
    this.cartTitle = page.locator(".breadcrumbs");
    this.cartItems = page.locator("#cart_info_table tbody tr");
    this.cartItemNames = page.locator(".cart_description h4 a");
    this.cartItemPrices = page.locator(".cart_price p");
    this.cartItemQuantities = page.locator(".cart_quantity button");
    this.cartItemTotals = page.locator(".cart_total p");
    this.removeButtons = page.locator(".cart_quantity_delete");
    this.proceedToCheckoutButton = page.locator(".check_out");
    this.continueShoppingButton = page.locator(".btn-default");
    this.emptyCartMessage = page.locator("#empty_cart");
    this.cartTotal = page.locator(".cart_total_price");
    this.quantityInputs = page.locator(".cart_quantity button");
    this.updateCartButton = page.locator(
      '.btn-default:has-text("Update Cart")'
    );
  }

  async navigateToCart() {
    await this.cartButton.first().click();
  }

  async goToCartViaModal() {
    await this.clickLocatorWithExactText(this.page.locator("a"), "View Cart");
  }

  async getCartItemCount(): Promise<number> {
    return await this.cartItems.count();
  }

  /**
   * Helper to get text content from a Locator at a given index, with bounds checking.
   */
  private async getCartItemField(
    locator: Locator,
    itemIndex: number = 0,
    fieldName: string = "Cart item"
  ): Promise<string> {
    const itemCount = await locator.count();
    if (itemIndex >= itemCount) {
      throw new Error(
        `${fieldName} index ${itemIndex} is out of range. Total items: ${itemCount}`
      );
    }
    return await getTextContent(await locator.nth(itemIndex));
  }

  async getCartItemName(itemIndex: number = 0): Promise<string> {
    return this.getCartItemField(this.cartItemNames, itemIndex, "Cart item");
  }

  async getCartItemPrice(itemIndex: number = 0): Promise<string> {
    return this.getCartItemField(this.cartItemPrices, itemIndex, "Cart item");
  }

  async getCartItemQuantity(itemIndex: number = 0): Promise<string> {
    // Note: quantityInputs and cartItems may not always match, so use cartItems for count
    const itemCount = await this.cartItems.count();
    if (itemIndex >= itemCount) {
      throw new Error(
        `Cart item index ${itemIndex} is out of range. Total items: ${itemCount}`
      );
    }
    return await getTextContent(await this.quantityInputs.nth(itemIndex));
  }

  async getCartItemTotal(itemIndex: number = 0): Promise<string> {
    return this.getCartItemField(this.cartItemTotals, itemIndex, "Cart item");
  }

  async updateItemQuantity(itemIndex: number, quantity: number) {
    const itemCount = await this.quantityInputs.count();
    if (itemIndex >= itemCount) {
      throw new Error(
        `Cart item index ${itemIndex} is out of range. Total items: ${itemCount}`
      );
    }
    await this.quantityInputs.nth(itemIndex).clear();
    await this.quantityInputs.nth(itemIndex).fill(quantity.toString());
    await this.updateCartButton.click();
    await this.waitForPageLoad();
  }

  async removeItem(itemIndex: number = 0) {
    const itemCount = await this.removeButtons.count();
    if (itemIndex >= itemCount) {
      throw new Error(
        `Cart item index ${itemIndex} is out of range. Total items: ${itemCount}`
      );
    }
    await this.removeButtons.nth(itemIndex).click();
    await this.waitForPageLoad();
  }

  async proceedToCheckout() {
    await this.proceedToCheckoutButton.click();
  }

  async continueShopping() {
    await this.continueShoppingButton.click();
  }

  async isCartEmpty(): Promise<boolean> {
    return await this.emptyCartMessage.isVisible();
  }

  async getCartTotal(): Promise<string> {
    return await getTextContent(await this.cartTotal);
  }

  async isCartTitleVisible(): Promise<boolean> {
    return await this.cartTitle.isVisible();
  }

  async isProceedToCheckoutButtonVisible(): Promise<boolean> {
    return await this.proceedToCheckoutButton.isVisible();
  }

  async isContinueShoppingButtonVisible(): Promise<boolean> {
    return await this.continueShoppingButton.first().isVisible();
  }

  async clearCart() {
    const removeButtons = this.removeButtons;
    const buttonCount = await removeButtons.count();
    await Promise.all(
      Array.from({ length: buttonCount }).map(async (_, i) => {
        await removeButtons.nth(i).click();
        await this.waitForPageLoad();
      })
    );
  }
  async getCartSummary(): Promise<CartSummary> {
    const itemCount = await this.getCartItemCount();
    const items: CartItem[] = await Promise.all(
      Array.from({ length: itemCount }, async (_, i) => {
        const [name, price, quantity, total] = await Promise.all([
          this.getCartItemName(i),
          this.getCartItemPrice(i),
          this.getCartItemQuantity(i),
          this.getCartItemTotal(i),
        ]);

        return {
          name,
          price,
          quantity,
          total,
        };
      })
    );

    return {
      itemNames: items.map((item) => item.name),
      itemCount,
      items,
      cartTotal: await this.getCartTotal(),
    };
  }
}

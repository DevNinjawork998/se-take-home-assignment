import { test, expect } from '@playwright/test';

test.describe('McDonald\'s Order Management System - E2E Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/McDonald's Order Management System/);
  });

  test('should display the main interface correctly', async ({ page }) => {
    // Verify header
    await expect(page.locator('header')).toContainText('McDonald\'s Order Management System');
    
    // Verify control buttons exist
    await expect(page.getByRole('button', { name: /new normal order/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /new vip order/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /\+ bot/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /- bot/i })).toBeVisible();
    
    // Verify order areas exist
    await expect(page.locator('[data-testid="pending-orders"]')).toBeVisible();
    await expect(page.locator('[data-testid="complete-orders"]')).toBeVisible();
    
    // Verify bot status area
    await expect(page.locator('[data-testid="bot-status"]')).toBeVisible();
  });

  test('Requirement 1: New Normal Order should appear in PENDING area', async ({ page }) => {
    // Click "New Normal Order" button
    await page.getByRole('button', { name: /new normal order/i }).click();
    
    // Verify order appears in pending area
    const pendingArea = page.locator('[data-testid="pending-orders"]');
    await expect(pendingArea.locator('[data-testid^="order-"]')).toHaveCount(1);
    
    // Verify order has correct type and status
    const orderCard = pendingArea.locator('[data-testid^="order-"]').first();
    await expect(orderCard).toContainText('NOR-001');
    await expect(orderCard).toContainText('NORMAL');
    await expect(orderCard).toContainText('PENDING');
  });

  test('Requirement 2: New VIP Order should appear in PENDING area before Normal orders', async ({ page }) => {
    // Create a normal order first
    await page.getByRole('button', { name: /new normal order/i }).click();
    await page.waitForTimeout(100); // Small delay to ensure order is created
    
    // Create a VIP order
    await page.getByRole('button', { name: /new vip order/i }).click();
    await page.waitForTimeout(100);
    
    // Verify both orders exist in pending area
    const pendingArea = page.locator('[data-testid="pending-orders"]');
    await expect(pendingArea.locator('[data-testid^="order-"]')).toHaveCount(2);
    
    // Verify VIP order is first in queue
    const firstOrder = pendingArea.locator('[data-testid^="order-"]').first();
    await expect(firstOrder).toContainText('VIP-002');
    await expect(firstOrder).toContainText('VIP');
    
    // Verify Normal order is second
    const secondOrder = pendingArea.locator('[data-testid^="order-"]').nth(1);
    await expect(secondOrder).toContainText('NOR-001');
    await expect(secondOrder).toContainText('NORMAL');
  });

  test('Requirement 3: Order numbers should be unique and increasing', async ({ page }) => {
    // Create multiple orders
    await page.getByRole('button', { name: /new normal order/i }).click();
    await page.waitForTimeout(100);
    await page.getByRole('button', { name: /new vip order/i }).click();
    await page.waitForTimeout(100);
    await page.getByRole('button', { name: /new normal order/i }).click();
    await page.waitForTimeout(100);
    
    // Get all order cards
    const pendingArea = page.locator('[data-testid="pending-orders"]');
    const orders = pendingArea.locator('[data-testid^="order-"]');
    
    // Verify we have 3 orders
    await expect(orders).toHaveCount(3);
    
    // Verify order numbers are unique and increasing
    const orderTexts = await orders.allTextContents();
    expect(orderTexts[0]).toContain('VIP-002'); // VIP orders go first but maintain numbering
    expect(orderTexts[1]).toContain('NOR-001'); // First normal order
    expect(orderTexts[2]).toContain('NOR-003'); // Second normal order
  });

  test('Requirement 4 & 5: Bot processes orders and becomes IDLE when no orders', async ({ page }) => {
    // Create an order
    await page.getByRole('button', { name: /new normal order/i }).click();
    
    // Add a bot
    await page.getByRole('button', { name: /\+ bot/i }).click();
    
    // Verify bot is created and starts processing
    const botStatus = page.locator('[data-testid="bot-status"]');
    await expect(botStatus).toContainText('bot-1');
    await expect(botStatus).toContainText('PROCESSING');
    
    // Verify order moves to processing status
    const pendingArea = page.locator('[data-testid="pending-orders"]');
    const orderCard = pendingArea.locator('[data-testid^="order-"]').first();
    await expect(orderCard).toContainText('PROCESSING');
    
    // Wait for order to complete (10 seconds + buffer)
    await page.waitForTimeout(11000);
    
    // Verify order moves to complete area
    const completeArea = page.locator('[data-testid="complete-orders"]');
    await expect(completeArea.locator('[data-testid^="order-"]')).toHaveCount(1);
    
    // Verify order is marked as complete
    const completedOrder = completeArea.locator('[data-testid^="order-"]').first();
    await expect(completedOrder).toContainText('COMPLETE');
    
    // Verify bot becomes IDLE
    await expect(botStatus).toContainText('IDLE');
    
    // Verify pending area is empty
    await expect(pendingArea.locator('[data-testid^="order-"]')).toHaveCount(0);
  });

  test('Requirement 6: Multiple VIP orders maintain correct queue order', async ({ page }) => {
    // Create multiple VIP orders
    await page.getByRole('button', { name: /new vip order/i }).click();
    await page.waitForTimeout(100);
    await page.getByRole('button', { name: /new vip order/i }).click();
    await page.waitForTimeout(100);
    await page.getByRole('button', { name: /new normal order/i }).click();
    await page.waitForTimeout(100);
    
    const pendingArea = page.locator('[data-testid="pending-orders"]');
    const orders = pendingArea.locator('[data-testid^="order-"]');
    
    // Verify queue order: VIP orders first, then normal
    await expect(orders).toHaveCount(3);
    
    const orderTexts = await orders.allTextContents();
    expect(orderTexts[0]).toContain('VIP-001'); // First VIP
    expect(orderTexts[1]).toContain('VIP-002'); // Second VIP
    expect(orderTexts[2]).toContain('NOR-003'); // Normal order last
  });

  test('Requirement 7: Removing bot stops processing and returns order to pending', async ({ page }) => {
    // Create an order
    await page.getByRole('button', { name: /new normal order/i }).click();
    
    // Add a bot
    await page.getByRole('button', { name: /\+ bot/i }).click();
    
    // Wait for bot to start processing
    await page.waitForTimeout(1000);
    
    // Verify order is processing
    const pendingArea = page.locator('[data-testid="pending-orders"]');
    const orderCard = pendingArea.locator('[data-testid^="order-"]').first();
    await expect(orderCard).toContainText('PROCESSING');
    
    // Remove the bot
    await page.getByRole('button', { name: /- bot/i }).click();
    
    // Verify bot is removed
    const botStatus = page.locator('[data-testid="bot-status"]');
    await expect(botStatus).toContainText('No active bots');
    
    // Verify order returns to pending status
    await expect(orderCard).toContainText('PENDING');
    await expect(orderCard).not.toContainText('PROCESSING');
  });

  test('Complex scenario: Multiple bots and orders interaction', async ({ page }) => {
    // Create multiple orders with mixed types
    await page.getByRole('button', { name: /new normal order/i }).click();
    await page.waitForTimeout(100);
    await page.getByRole('button', { name: /new vip order/i }).click();
    await page.waitForTimeout(100);
    await page.getByRole('button', { name: /new normal order/i }).click();
    await page.waitForTimeout(100);
    
    // Add 2 bots
    await page.getByRole('button', { name: /\+ bot/i }).click();
    await page.waitForTimeout(100);
    await page.getByRole('button', { name: /\+ bot/i }).click();
    await page.waitForTimeout(100);
    
    // Verify both bots are processing orders
    const botStatus = page.locator('[data-testid="bot-status"]');
    await expect(botStatus).toContainText('bot-1');
    await expect(botStatus).toContainText('bot-2');
    
    // Verify VIP order is processed first
    const pendingArea = page.locator('[data-testid="pending-orders"]');
    
    // Wait a bit for processing to start
    await page.waitForTimeout(1000);
    
    // Check that we have fewer pending orders (some should be processing)
    const remainingOrders = pendingArea.locator('[data-testid^="order-"]');
    const count = await remainingOrders.count();
    expect(count).toBeLessThan(3); // At least one order should be processing
    
    // Add another order while bots are busy
    await page.getByRole('button', { name: /new vip order/i }).click();
    
    // Wait for all orders to complete
    await page.waitForTimeout(12000);
    
    // Verify all orders are completed
    const completeArea = page.locator('[data-testid="complete-orders"]');
    await expect(completeArea.locator('[data-testid^="order-"]')).toHaveCount(4);
    
    // Verify both bots are now idle
    await expect(botStatus).toContainText('IDLE');
  });

  test('Bot management: Adding and removing multiple bots', async ({ page }) => {
    // Add 3 bots
    await page.getByRole('button', { name: /\+ bot/i }).click();
    await page.waitForTimeout(100);
    await page.getByRole('button', { name: /\+ bot/i }).click();
    await page.waitForTimeout(100);
    await page.getByRole('button', { name: /\+ bot/i }).click();
    
    // Verify 3 bots exist
    const botStatus = page.locator('[data-testid="bot-status"]');
    await expect(botStatus).toContainText('bot-1');
    await expect(botStatus).toContainText('bot-2');
    await expect(botStatus).toContainText('bot-3');
    
    // Remove 2 bots
    await page.getByRole('button', { name: /- bot/i }).click();
    await page.waitForTimeout(100);
    await page.getByRole('button', { name: /- bot/i }).click();
    
    // Verify only 1 bot remains
    await expect(botStatus).toContainText('bot-1');
    await expect(botStatus).not.toContainText('bot-2');
    await expect(botStatus).not.toContainText('bot-3');
    
    // Try to remove bot when none exist
    await page.getByRole('button', { name: /- bot/i }).click();
    await expect(botStatus).toContainText('No active bots');
  });

  test('Real-time updates: UI updates without page refresh', async ({ page }) => {
    // Create an order
    await page.getByRole('button', { name: /new normal order/i }).click();
    
    // Verify order appears without refresh
    const pendingArea = page.locator('[data-testid="pending-orders"]');
    await expect(pendingArea.locator('[data-testid^="order-"]')).toHaveCount(1);
    
    // Add bot
    await page.getByRole('button', { name: /\+ bot/i }).click();
    
    // Verify bot status updates without refresh
    const botStatus = page.locator('[data-testid="bot-status"]');
    await expect(botStatus).toContainText('PROCESSING');
    
    // Create another order while first is processing
    await page.getByRole('button', { name: /new vip order/i }).click();
    
    // Verify new order appears in queue
    await expect(pendingArea.locator('[data-testid^="order-"]')).toHaveCount(2);
  });
});

import { test, expect } from "@playwright/test";

test.describe("Dashboard Navigation", () => {
  test("should navigate to dashboard after login", async ({ page }) => {
    await page.goto("/");
    
    // In production würde hier echter OAuth Flow stattfinden
    // Für Tests mocken wir die Session
    await page.goto("/dashboard");
    
    // Prüfe ob Dashboard lädt
    await expect(page.locator("text=Emils Tool Fabrick")).toBeVisible();
  });

  test("should display navigation menu", async ({ page }) => {
    await page.goto("/dashboard");
    
    // Prüfe Sidebar-Links
    await expect(page.locator('a[href="/dashboard"]')).toBeVisible();
    await expect(page.locator('a[href="/dashboard/projects"]')).toBeVisible();
    await expect(page.locator('a[href="/dashboard/github"]')).toBeVisible();
    await expect(page.locator('a[href="/dashboard/assistant"]')).toBeVisible();
  });
});

test.describe("Projects Page", () => {
  test("should load projects page", async ({ page }) => {
    await page.goto("/dashboard/projects");
    
    await expect(page.locator("h1")).toContainText("Projekte");
  });

  test("should display project list", async ({ page }) => {
    // Mock würde hier echte Daten liefern
    await page.goto("/dashboard/projects");
    
    // Warte auf Projekte-Container
    await page.waitForSelector(".space-y-4", { timeout: 5000 });
  });
});

test.describe("GPT Assistant", () => {
  test("should load assistant page", async ({ page }) => {
    await page.goto("/dashboard/assistant");
    
    await expect(page.locator("h1")).toContainText("GPT-Assistent");
  });

  test("should have message input", async ({ page }) => {
    await page.goto("/dashboard/assistant");
    
    const input = page.locator('input[placeholder*="bauen"]');
    await expect(input).toBeVisible();
    
    const button = page.locator('button:has-text("Senden")');
    await expect(button).toBeVisible();
  });
});

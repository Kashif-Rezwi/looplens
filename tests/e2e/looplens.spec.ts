import { expect, test } from "@playwright/test";

const sampleLoop = `2026-07-09 | Iteration 1 | Built/changed: Built metadata form | Verified: Manual smoke test passed | Result: verified | Next: parse
2026-07-09 | Iteration 2 | Built/changed: Added publish flow https://example.com/evidence | Verified: Browser opened public report | Result: failed because warning was missing | Fixed: Added redaction checklist | Next: rerun`;

test("sample report loads", async ({ page }) => {
  await page.goto("/sample");

  await expect(page.getByRole("heading", { name: "LoopLens" })).toBeVisible();
  await expect(page.getByText("Evidence completeness", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Timeline" })).toBeVisible();
});

test("user creates, parses, publishes, opens, and exports a report", async ({ page }) => {
  await page.addInitScript(() => window.localStorage.clear());
  await page.goto("/");

  await page.getByLabel("Project name").fill("Playwright Proof");
  await page.getByLabel("Short description").fill("A smoke-tested LoopLens report.");
  await page.getByLabel("Repository URL").fill("https://github.com/example/playwright-proof");
  await page.getByLabel("Live app URL").fill("https://playwright-proof.example.com");
  await page.getByLabel("TestSprite URL").fill("https://www.testsprite.com/discover");
  await page.getByPlaceholder("YYYY-MM-DD").fill(sampleLoop);
  await page.getByRole("button", { name: "Parse evidence" }).click();

  await expect(page.getByLabel("Built/changed").first()).toHaveValue(/Built metadata form/);
  await expect(page.locator("textarea").filter({ hasText: "Added redaction checklist" }).first()).toBeVisible();

  await page.getByRole("button", { name: "Judge" }).click();
  await expect(page.getByText("Playwright Proof includes 2 recorded engineering iterations")).toBeVisible();

  await page.getByRole("button", { name: "Markdown" }).click();
  await expect(page.locator("textarea").last()).toHaveValue(/# Playwright Proof/);

  await page.getByLabel(/I reviewed this report/).check();
  await page.getByRole("button", { name: "Publish report" }).click();

  const publicLink = page.getByRole("link", { name: /localhost:3000\/report\// });
  await expect(publicLink).toBeVisible();
  const href = await publicLink.getAttribute("href");
  expect(href).toBeTruthy();

  await page.goto(href!);
  await expect(page.getByRole("heading", { name: "Playwright Proof" })).toBeVisible();
  await expect(page.getByText("Public report", { exact: true }).first()).toBeVisible();
});

test("mobile report surface avoids horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/sample");

  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(hasHorizontalOverflow).toBe(false);
});

import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await page.waitForLoadState("load");
});

test("user can switch the home UI to Thai", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "AP Flour" })).toBeVisible();
  await page.getByRole("link", { name: "Settings" }).click();

  await expect(
    page.getByRole("heading", { name: "App preferences" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Thai" }).click();
  await page.getByRole("link", { name: "กลับ" }).click();

  await expect(
    page.getByText("เครื่องมืออเนกประสงค์สำหรับเล่นกับเพื่อน"),
  ).toBeVisible();
});

test("user can roll dice and see a latest result", async ({ page }) => {
  await page.getByRole("link", { name: "Open dice" }).click();
  await page.getByRole("button", { name: "Roll", exact: true }).click();

  await expect(page.getByText("Latest result")).toBeVisible();
  await expect(page.getByText("Rolls:")).toBeVisible();
});

test("user can save and load a picker preset", async ({ page }) => {
  await page.getByRole("link", { name: "Open picker" }).click();
  await page.getByPlaceholder("Game night players").fill("E2E Players");
  await page.getByRole("button", { name: "Save preset", exact: true }).click();

  await expect(page.getByRole("heading", { name: "Picker presets" })).toBeVisible();
  await expect(page.getByText("E2E Players")).toBeVisible();
});

test("user can start, pause, and reset the timer", async ({ page }) => {
  await page.getByRole("link", { name: "Open timer" }).click();

  await page.getByRole("button", { name: "Start" }).click();
  await expect(page.getByText("Running")).toBeVisible();

  await page.getByRole("button", { name: "Pause" }).click();
  await expect(page.getByText("Paused")).toBeVisible();

  await page.getByRole("button", { name: "Reset" }).click();
  await expect(page.getByText("Idle")).toBeVisible();
});

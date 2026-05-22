import { test, expect } from 'playwright/test';
import { creds, loginAs } from '../fixtures/auth';

function uniqueStamp() {
  return `${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

test('[TC_AUTH-1] register success with valid inputs', async ({ page }) => {
  const stamp = uniqueStamp();
  await page.goto('/register');
  await page.getByPlaceholder('username').fill(`pw_user_${stamp}`);
  await page.getByPlaceholder('email@example.com').fill(`pw_${stamp}@example.com`);
  await page.locator('input[type="password"]').first().fill('12345678');
  await page.getByRole('button', { name: 'Đăng ký' }).click();
  await expect(page).toHaveURL(/\/login/);
});

test('[TC_AUTH-10] login regular user redirects to /user', async ({ page }) => {
  await loginAs(page, creds.user.email, creds.user.password);
  await expect(page).toHaveURL(/\/user/);
});

test('[TC_AUTH-17] login admin redirects to /admin', async ({ page }) => {
  await loginAs(page, creds.admin.email, creds.admin.password);
  await expect(page).toHaveURL(/\/admin/);
});

test('[TC_AUTH-18] login moderator redirects to /moderator', async ({ page }) => {
  await loginAs(page, creds.moderator.email, creds.moderator.password);
  await expect(page).toHaveURL(/\/moderator/);
});

test('[TC_AUTH-16] banned user login is blocked', async ({ page }) => {
  await loginAs(page, creds.banned.email, creds.banned.password);
  await expect(page).toHaveURL(/\/user/);
});

test('[TC_AUTH-19] regular user cannot access /admin', async ({ page }) => {
  await loginAs(page, creds.user.email, creds.user.password);
  await page.goto('/admin');
  await expect(page).not.toHaveURL(/\/admin$/);
});

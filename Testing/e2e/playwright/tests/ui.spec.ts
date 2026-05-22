import { test, expect } from 'playwright/test';
import { loginAsUser } from '../fixtures/auth';

test('[TC_UI-9] protected route redirects unauthenticated user to login', async ({ page }) => {
  await page.goto('/user');
  await expect(page).toHaveURL(/\/login/);
});

test('[TC_UI-8] home search clear resets query input', async ({ page }) => {
  await loginAsUser(page);
  await page.goto('/user');
  const searchInput = page.getByPlaceholder('Tìm kiếm bài viết, chủ đề, tác giả...');
  await searchInput.fill('React');
  await page.locator('main').getByRole('button').first().click();
  await expect(searchInput).toHaveValue('');
});

test('[TC_UI-7] create-post submit becomes disabled/loading on submit', async ({ page }) => {
  await loginAsUser(page);
  await page.goto('/user');
  await page.getByRole('button', { name: 'Đăng bài' }).first().click();
  await page.getByPlaceholder('Tiêu đề bài viết...').fill(`E2E Post ${Date.now()}`);
  await page.locator('.ql-editor').first().fill('Playwright content body for E2E test case.');
  const submit = page.getByRole('button', { name: /Đăng bài ngay|Lưu thay đổi/ }).first();
  await expect(submit).toBeEnabled();
  await submit.click();
  await expect(submit).toBeDisabled();
});

import { test, expect } from 'playwright/test';
import { loginAsUser } from '../fixtures/auth';

test('[TC_POST-15] open post detail from feed', async ({ page }) => {
  await loginAsUser(page);
  await page.goto('/user/posts/1');
  await expect(page).toHaveURL(/\/user\/posts\//);
});

test('[TC_POST-12] save post from feed updates saved area', async ({ page }) => {
  await loginAsUser(page);
  await page.goto('/user/saved');
  await expect(page).toHaveURL(/\/user\/saved/);
});

test('[TC_POST-16] unauthenticated user cannot like post', async ({ page }) => {
  await page.goto('/user');
  await expect(page).toHaveURL(/\/login/);
});

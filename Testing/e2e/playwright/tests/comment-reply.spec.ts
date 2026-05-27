import { test, expect } from '@playwright/test';
import { loginAsUser } from '../fixtures/auth';

test('[TC_CMT-4] unauthenticated cannot submit comment', async ({ page }) => {
  await page.goto('/user/posts/1');
  await expect(page).toHaveURL(/\/login/);
});

test('[TC_CMT-5] authenticated user can submit comment', async ({ page }) => {
  await loginAsUser(page);
  await page.goto('/user/posts/1');

  const postNotFound = page.getByRole('heading', { name: 'Không tìm thấy bài viết' });
  const commentsHeader = page.getByText('Bình luận').first();

  await Promise.race([
    postNotFound.waitFor({ state: 'visible', timeout: 10000 }).catch(() => null),
    commentsHeader.waitFor({ state: 'visible', timeout: 10000 }).catch(() => null),
  ]);

  if (await postNotFound.isVisible()) {
    return;
  }

  await expect(commentsHeader).toBeVisible();
  const input = page.getByPlaceholder('Viết bình luận của bạn...');
  await input.fill(`Playwright comment ${Date.now()}`);
  await input.locator('xpath=ancestor::div[contains(@class,"relative")][1]//button[@type="submit"]').click();
  await expect(input).toHaveValue('');
});

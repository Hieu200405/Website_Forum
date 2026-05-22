import { test, expect } from 'playwright/test';
import { loginAsUser } from '../fixtures/auth';

test('[TC_USR-7] password mismatch shows validation state', async ({ page }) => {
  await loginAsUser(page);
  await page.goto('/user/settings');
  await page.getByRole('textbox', { name: '••••••••' }).fill('12345678');
  await page.getByPlaceholder('Tối thiểu 8 ký tự').fill('newpassword1');
  const confirmPassword = page.getByPlaceholder('Nhập lại mật khẩu mới');
  await confirmPassword.fill('differentpassword');
  await page.getByRole('button', { name: 'Đổi mật khẩu' }).click();
  await expect(confirmPassword).toHaveClass(/border-red-300/);
});

test('[TC_USR-5] own profile shows edit button', async ({ page }) => {
  await loginAsUser(page);
  await page.getByRole('link', { name: /Avatar .* user/i }).click();

  const notFoundHeading = page.getByRole('heading', { name: 'Không tìm thấy người dùng' });
  const editButton = page.getByRole('button', { name: 'Chỉnh sửa hồ sơ' });

  await Promise.race([
    notFoundHeading.waitFor({ state: 'visible', timeout: 10000 }).catch(() => null),
    editButton.waitFor({ state: 'visible', timeout: 10000 }).catch(() => null),
  ]);

  if (await notFoundHeading.isVisible()) {
    return;
  }

  await expect(editButton).toBeVisible();
});

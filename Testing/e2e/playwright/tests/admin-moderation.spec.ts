import { test, expect, Page } from '@playwright/test';
import { loginAsAdmin, loginAsModerator, loginAsUser } from '../fixtures/auth';

async function findUserRow(page: Page, emails: string[]) {
  for (const email of emails) {
    const row = page.locator('tr', { hasText: email }).first();
    if (await row.count()) {
      return { row, email };
    }
  }
  return null;
}

test('[TC_ADM-5] admin can access banned words page', async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto('/admin/banned-words');
  await expect(page.getByPlaceholder('Nhập từ cấm mới...')).toBeVisible();
});

test('[TC_ADM-6] moderator cannot access /admin/banned-words', async ({ page }) => {
  await loginAsModerator(page);
  await page.goto('/admin/banned-words');
  await expect(page).not.toHaveURL(/\/admin\/banned-words$/);
});

test('[TC_ADM-7] regular user cannot access /admin/users', async ({ page }) => {
  await loginAsUser(page);
  await page.goto('/admin/users');
  await expect(page).not.toHaveURL(/\/admin\/users$/);
});

test('[TC_ADM-8] moderator can view reports page', async ({ page }) => {
  await loginAsModerator(page);
  await page.goto('/moderator/reports');
  await expect(page.getByRole('heading', { name: 'Quản lý báo cáo vi phạm' })).toBeVisible();
});

test('[TC_ADM-9] admin dashboard shows system overview', async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: 'Tổng quan hệ thống' })).toBeVisible();
  await expect(page.getByText('Admin Control Panel')).toBeVisible();
});

test('[TC_ADM-10] admin can navigate to users page from sidebar', async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto('/admin');
  await page.getByRole('link', { name: 'Người dùng' }).first().click();
  await expect(page).toHaveURL(/\/admin\/users$/);
  await expect(page.getByRole('heading', { name: 'Quản lý người dùng' })).toBeVisible();
});

test('[TC_ADM-11] users page search shows empty state for unmatched keyword', async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto('/admin/users');
  const keyword = `no-user-${Date.now()}`;
  await page.getByPlaceholder('Tìm theo tên hoặc email...').fill(keyword);
  await expect(page.getByText('Không tìm thấy người dùng nào')).toBeVisible();
});

test('[TC_ADM-12] users page status filter can switch to banned', async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto('/admin/users');
  const bannedFilter = page.getByRole('button', { name: 'Bị khóa' });
  await bannedFilter.click();
  await expect(bannedFilter).toHaveClass(/bg-primary-600/);
});

test('[TC_ADM-13] admin can open and close create category form', async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto('/admin/categories');
  await page.getByRole('button', { name: 'Thêm danh mục' }).click();
  await expect(page.getByRole('heading', { name: 'Thêm danh mục mới' })).toBeVisible();
  await page.getByRole('button', { name: 'Hủy' }).click();
  await expect(page.getByRole('heading', { name: 'Thêm danh mục mới' })).toHaveCount(0);
});

test('[TC_ADM-14] admin can create and delete category', async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto('/admin/categories');

  const categoryName = `pw-cat-${Date.now()}`;
  await page.getByRole('button', { name: 'Thêm danh mục' }).click();
  await page.getByPlaceholder('Nhập tên...').fill(categoryName);
  await page.getByPlaceholder('Nhập mô tả...').fill('Playwright test category');
  await page.getByRole('button', { name: 'Lưu danh mục' }).click();

  const createdRow = page.locator('tr', { hasText: categoryName });
  await expect(createdRow).toBeVisible();

  page.once('dialog', (dialog) => dialog.accept());
  await createdRow.getByRole('button').nth(1).click();
  await expect(createdRow).toHaveCount(0);
});

test('[TC_ADM-15] admin can open logs page and switch to error filter', async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto('/admin/logs');
  await expect(page.getByRole('heading', { name: 'Nhật ký hệ thống' })).toBeVisible();
  const errorFilter = page.getByRole('button', { name: /Error/ });
  await errorFilter.click();
  await expect(errorFilter).toHaveClass(/bg-red-600/);
});

test('[TC_ADM-16] moderator dashboard cards navigate to report and moderate pages', async ({ page }) => {
  await loginAsModerator(page);
  await page.goto('/moderator');
  await page.getByText('Đang chờ xử lý').first().click();
  await expect(page).toHaveURL(/\/moderator\/reports$/);

  await page.goto('/moderator');
  await page.getByText('Bài viết cần duyệt').first().click();
  await expect(page).toHaveURL(/\/moderator\/moderate$/);
  await expect(page.getByRole('heading', { name: 'Duyệt bài viết (Trong hàng đợi)' })).toBeVisible();
});

test('[TC_ADM-17] moderator cannot access admin logs route', async ({ page }) => {
  await loginAsModerator(page);
  await page.goto('/admin/logs');
  await expect(page).not.toHaveURL(/\/admin\/logs$/);
});

test('[TC_ADM-18] admin can ban and unban seeded user', async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto('/admin/users');
  await expect(page.getByRole('heading', { name: 'Quản lý người dùng' })).toBeVisible();

  const userMatch = await findUserRow(page, ['new@gmail.com', 'dev@gmail.com', 'drama@gmail.com']);
  if (!userMatch) throw new Error('No seeded active user row found');

  const { email } = userMatch;
  const banRow = page.locator('tr', { hasText: email }).first();
  const banButton = banRow.getByRole('button', { name: 'Khóa' });
  await expect(banButton).toBeVisible();

  page.once('dialog', (dialog) => dialog.accept());
  await banButton.click();
  await expect(page.getByText('Đã khóa tài khoản')).toBeVisible();

  const unbanRow = page.locator('tr', { hasText: email }).first();
  const unbanButton = unbanRow.getByRole('button', { name: 'Mở khóa' });
  await expect(unbanButton).toBeVisible();

  page.once('dialog', (dialog) => dialog.accept());
  await unbanButton.click();
  await expect(page.getByText('Đã mở khóa tài khoản')).toBeVisible();
  await expect(page.locator('tr', { hasText: email }).first().getByRole('button', { name: 'Khóa' })).toBeVisible();
});

test('[TC_ADM-19] category edit blocks empty name and keeps row', async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto('/admin/categories');

  const editableRow = page.locator('tr', { hasNotText: 'Chưa có danh mục nào.' }).nth(1);
  await expect(editableRow).toBeVisible();

  await editableRow.getByRole('button').first().click();
  const nameInput = editableRow.locator('input').first();
  await nameInput.fill('');
  await editableRow.getByRole('button').first().click();

  await expect(page.getByText('Tên không được để trống')).toBeVisible();
  await expect(nameInput).toBeVisible();
});

test('[TC_ADM-20] moderator can hide reported post after confirmation', async ({ page }) => {
  await loginAsModerator(page);
  await page.goto('/moderator/reports');
  await expect(page.getByRole('heading', { name: 'Quản lý báo cáo vi phạm' })).toBeVisible();

  const noPending = page.getByText('Không có báo cáo nào chưa xử lý.');
  if (await noPending.isVisible()) {
    return;
  }

  const firstHide = page.getByRole('button', { name: 'Ẩn' }).first();
  await expect(firstHide).toBeVisible();

  page.once('dialog', (dialog) => dialog.accept());
  await firstHide.click();
  await expect(page.getByText('Đã xử lý thành công')).toBeVisible();
});

test('[TC_ADM-21] moderator can reject pending post with prompt reason', async ({ page }) => {
  await loginAsModerator(page);
  await page.goto('/moderator/moderate');
  await expect(page.getByRole('heading', { name: 'Duyệt bài viết (Trong hàng đợi)' })).toBeVisible();

  const noPending = page.getByText('Hiện tại không có bài viết nào cần duyệt.');
  if (await noPending.isVisible()) {
    return;
  }

  page.once('dialog', (dialog) => dialog.accept('Nội dung không phù hợp'));
  await page.getByRole('button', { name: 'Từ chối' }).first().click();
  await expect(page.getByText('Đã xét duyệt bài viết')).toBeVisible();
});

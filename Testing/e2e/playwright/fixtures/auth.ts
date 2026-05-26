import { Page, expect } from 'playwright/test';

export const creds = {
  admin: { email: 'admin@gmail.com', password: '12345678' },
  moderator: { email: 'mod@gmail.com', password: '12345678' },
  user: { email: 'new@gmail.com', password: '12345678' },
  banned: { email: 'spam@gmail.com', password: '12345678' },
};

export async function loginAs(page: Page, email: string, password: string) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    await page.goto('/login');

    const emailByTestId = page.getByTestId('login-email');
    if (await emailByTestId.count()) {
      await emailByTestId.fill(email);
    } else {
      await page.getByRole('textbox').first().fill(email);
    }

    const passwordByTestId = page.getByTestId('login-password');
    if (await passwordByTestId.count()) {
      await passwordByTestId.fill(password);
    } else {
      await page.locator('input[type="password"]').first().fill(password);
    }

    const submitByTestId = page.getByTestId('login-submit');
    if (await submitByTestId.count()) {
      await submitByTestId.click();
    } else {
      await page.getByRole('button', { name: /đăng nhập/i }).first().click();
    }

    try {
      await expect(page).not.toHaveURL(/\/login$/, { timeout: 8000 });
      return;
    } catch {
      if (attempt < 4) {
        await page.waitForTimeout(8000);
      }
    }
  }

  throw new Error(`Login failed for ${email}`);
}

export async function loginAsUser(page: Page) {
  await loginAs(page, creds.user.email, creds.user.password);
  await expect(page).toHaveURL(/\/user/);
}

export async function loginAsAdmin(page: Page) {
  await loginAs(page, creds.admin.email, creds.admin.password);
  await expect(page).toHaveURL(/\/admin/);
}

export async function loginAsModerator(page: Page) {
  await loginAs(page, creds.moderator.email, creds.moderator.password);
  await expect(page).toHaveURL(/\/moderator/);
}

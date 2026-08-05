import { test, expect } from 'playwright/test'

// End-to-end smoke test against the real app + json-server mock API (see playwright.config.js).
// Creates a throwaway application (unique name per run, so reruns/failures never collide)
// and deletes it again so db.json is left unchanged.
test('create an application, see it validated and listed, then delete it', async ({ page }) => {
  const errors = []
  page.on('pageerror', (err) => errors.push(err.message))

  const company = `Playwright Smoke Co ${Date.now()}`

  await page.goto('/')
  await expect(page.getByText('Job Tracker')).toBeVisible()

  // Switch to a non-Remote work type and try to submit without a location: should be blocked
  await page.getByPlaceholder('e.g. Stripe').fill(company)
  await page.getByPlaceholder('e.g. Senior Engineer').fill('QA Automation Engineer')
  await page.locator('button[role="combobox"]').nth(1).click()
  await page.getByRole('option', { name: 'Onsite' }).click()
  await page.getByRole('button', { name: /add application/i }).click()
  await expect(page.getByText('Location is required')).toBeVisible()
  await expect(page.locator('tbody tr', { hasText: company })).toHaveCount(0)

  // Fill location and submit for real
  await page.getByPlaceholder('e.g. San Francisco, CA').fill('Remote City, US')
  await page.getByRole('button', { name: /add application/i }).click()

  const newRow = page.locator('tbody tr', { hasText: company })
  await expect(newRow).toHaveCount(1)

  // Delete it via the shared confirmation dialog
  await newRow.locator('button').nth(1).click()
  const dialog = page.getByRole('alertdialog')
  await expect(dialog.getByText('Delete application?')).toBeVisible()
  await expect(dialog.getByText(company)).toBeVisible()
  await dialog.getByRole('button', { name: 'Delete', exact: true }).click()

  await expect(page.locator('tbody tr', { hasText: company })).toHaveCount(0)

  expect(errors).toEqual([])
})

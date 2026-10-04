import { test, expect } from '@playwright/test'

test.describe('Knitting Step Player - End-to-End User Journey', () => {
  test('navigates from Library to Materials and plays through 3D steps', async ({ page }) => {
    page.on('console', (msg) => console.log('PAGE LOG:', msg.text()))
    page.on('pageerror', (err) => console.log('PAGE ERROR:', err.message))

    // 1. Visit Library
    await page.goto('/#/')
    await expect(page.locator('h1')).toContainText('คลังแพทเทิร์น')

    // 2. Sample pattern should be visible in library
    const patternCard = page.locator('.pattern-grid-card').first()
    await expect(patternCard).toBeVisible()
    await expect(patternCard).toContainText('Sample Ball')

    // 3. Click Start to open Materials page
    await patternCard.locator('.kp-btn-primary').click()
    await expect(page).toHaveURL(/.*pattern\/sample-ball/)
    await expect(page.locator('h1')).toContainText('Sample Ball')
    await expect(page.locator('text=Coral Main')).toBeVisible()

    // 4. Click Start Playing to launch Play Page
    await page.locator('button:has-text("เริ่มถักชิ้นงาน"), button:has-text("Start Crafting")').click()
    await expect(page).toHaveURL(/.*play\/sample-ball/)

    // 5. Verify 3D canvas container exists
    const canvasContainer = page.locator('.canvas-container')
    await expect(canvasContainer).toBeVisible()

    // Verify initial step label is Rnd 1
    await expect(page.locator('.step-main-card')).toContainText('Rnd 1')

    // 6. Click Next to advance to Rnd 2
    const nextBtn = page.locator('button:has-text("ถัดไป"), button:has-text("Next")')
    await nextBtn.click()
    await expect(page.locator('.step-main-card')).toContainText('Rnd 2')

    // 7. Click Next to advance to Rnd 3 (Repeat Group (sc, inc) x6)
    await nextBtn.click()
    await expect(page.locator('.step-main-card')).toContainText('Rnd 3')
    await expect(page.locator('.repeat-counter-container')).toBeVisible()

    // 8. Test keyboard navigation: press ArrowRight to advance repeat iteration
    await page.keyboard.press('ArrowRight')
    await expect(page.locator('.repeat-counter-container')).toContainText('จาก 6')

    // Wait for save debounce (300ms) and IndexedDB transaction to commit
    await page.waitForTimeout(1000)

    // 9. Reload page and check resume persistence dialog
    await page.reload()
    const resumeDialog = page.locator('.q-dialog')
    await expect(resumeDialog).toBeVisible({ timeout: 10000 })
    await expect(resumeDialog).toContainText('ถักต่อจากที่ค้างไว้')

    // Click Continue
    await resumeDialog.locator('.kp-btn-primary').click()
    await expect(page.locator('.step-main-card')).toContainText('Rnd 3')
  })
})

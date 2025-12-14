const fs = require('fs')
const { chromium } = require('playwright')

;(async () => {
  const out = {}
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()

  // Try to login to backend to obtain a real token
  let token = null
  try {
    const apiRoot = process.env.NEXT_PUBLIC_API_ROOT || 'http://localhost:5000/'
    const loginRes = await fetch(apiRoot + 'api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'juan@mi.com', password: 'admin' }),
    })
    if (loginRes && loginRes.ok) {
      const json = await loginRes.json()
      token = json?.token || null
    }
  } catch (e) {
    // ignore login errors
  }

  // Prepopulate localStorage with the real token (if obtained) or fallback to a fake token
  await context.addInitScript((t) => {
    try {
      if (t) {
        localStorage.setItem('token', t)
        try {
          const decoded = JSON.parse(atob(t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
          if (decoded?._id) localStorage.setItem('decodifiedToken', decoded._id)
        } catch {}
      } else {
        localStorage.setItem('token', 'FAKE.TEST.TOKEN')
        localStorage.setItem('decodifiedToken', 'test-user-id')
      }
    } catch (e) {
      // ignore
    }
  }, token)

  const page = await context.newPage()

  page.on('console', msg => {
    out.console = out.console || []
    out.console.push({ type: msg.type(), text: msg.text() })
  })
  page.on('pageerror', err => {
    out.pageerror = out.pageerror || []
    out.pageerror.push(String(err))
  })

    try {
    await page.goto('http://localhost:3000/dashboard/fund', { waitUntil: 'networkidle' })
    // wait for the client to mount and Stripe Elements to appear
    // wait explicitly for the amount input and submit button (client-rendered)
    await page.waitForSelector('form input[type="number"]', { timeout: 10000 }).catch(() => {})
    await page.waitForSelector('form button[type="submit"]', { timeout: 10000 }).catch(() => {})

    // if we're not on the fund page (app may redirect), try navigating again or click the sidebar link
    const current = page.url()
    if (!current.endsWith('/dashboard/fund')) {
      // try explicit navigation
      await page.goto('http://localhost:3000/dashboard/fund', { waitUntil: 'networkidle' }).catch(() => {})
      await page.waitForTimeout(800)
    }

    // try locating the amount input (wait a bit longer for dynamic mount)
    let amountInput = await page.$('form input[type="number"]')
    if (!amountInput) {
      // try clicking the Fund link in the sidebar
      const fundLink = await page.$('a[href="/dashboard/fund"]')
      if (fundLink) {
        await fundLink.click().catch(() => {})
        await page.waitForTimeout(800)
      }
      amountInput = await page.$('form input[type="number"]')
    }

    if (amountInput) {
      await amountInput.fill('1.00')
    }

    // click Pay and immediately navigate away to simulate user leaving during confirm
    const payButton = await page.$('form button[type="submit"]')
    if (payButton) {
      // ensure button is enabled before clicking
      try {
        await page.waitForFunction((btn) => !btn.disabled, payButton, { timeout: 3000 })
      } catch {}

      await payButton.click().catch(() => {})
      // wait for the backend request to create a PaymentIntent to complete
      try {
        await page.waitForResponse(r => r.url().includes('/api/payments/create-payment-intent') && r.status() === 200, { timeout: 5000 })
      } catch {
        // continue even if response not observed
      }
      // give the page some time to emit any errors
      await page.waitForTimeout(1200)
    } else {
      out.note = 'No pay button found on page'
    }

    out.html = await page.content()
  } catch (e) {
    out.error = String(e)
  } finally {
    await browser.close()
    fs.writeFileSync('stripe-navigation-output.json', JSON.stringify(out, null, 2))
    console.log('Wrote stripe-navigation-output.json')
  }
})().catch(e => { console.error(e); process.exit(1) })

const fs = require('fs')
const { chromium } = require('playwright')

;(async () => {
  const out = {}
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()

  page.on('console', msg => {
    out.console = out.console || []
    out.console.push({ type: msg.type(), text: msg.text() })
  })
  page.on('pageerror', err => {
    out.pageerror = out.pageerror || []
    out.pageerror.push(String(err))
  })

  const urls = ['http://localhost:3000/dashboard', 'http://localhost:3000/dashboard/wallet', 'http://localhost:3000/dashboard/fund']
  for (const url of urls) {
    try {
      await page.goto(url, { waitUntil: 'networkidle' })
      await page.waitForTimeout(1000)
      const html = await page.content()
      out[url] = { html }
    } catch (e) {
      out[url] = { error: String(e) }
    }
  }

  await browser.close()
  fs.writeFileSync('repro-hydration-output.json', JSON.stringify(out, null, 2))
  console.log('Wrote repro-hydration-output.json')
})().catch(e => { console.error(e); process.exit(1) })

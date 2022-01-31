import { Page } from 'puppeteer-core'
import { getToken, getId } from './getToken'
import CONFIG from '../config.json'

export default async function resolveCaptcha (page : Page) {
  const siteKey = await page.$eval('body > div.content-wrapper > div > section > div > form > div > div:nth-child(5) > div > div', element => element.attributes['data-sitekey'].value)
  const idCaptcha = await getId(siteKey, page.url())
  const token = await resolveToken(idCaptcha, page)
  if (!token) return await resolveCaptcha(page)
  await page.evaluate((token) => {
    // @ts-ignore
    document.querySelector("textarea[name='g-recaptcha-response']").value = token
    // @ts-ignore
    document.querySelector('#submit').click()
  }, token)

  await page.waitForTimeout(10000)
}

async function resolveToken (idCaptcha: string, page : Page, limit : number = 5) {
  if (!limit) {
    console.log('limite de requisicao do token excedido')
    return false
  }
  const token = await getToken(idCaptcha)
  // console.log(token)
  if (!token) {
    await page.waitForTimeout(CONFIG.timeout)
    return await resolveToken(idCaptcha, page, limit - 1)
  }
  return token
}

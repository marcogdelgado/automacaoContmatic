import CreateBrowser from './CreateBrowser/CreateBrowser'
import { config } from 'dotenv'
import { parse, join } from 'path'
import { mkdirSync } from 'fs'
import { CaptchaBalanceError } from './errors/CaptchaBalanceError'

async function main () {
  try {
    config({ path: join(parse(__dirname).dir, '.env') })
    mkdirSync(join(process.cwd(), 'saida'), { recursive: true })
    mkdirSync(join(process.cwd(), 'entrada'), { recursive: true })
    const newBrowser = new CreateBrowser()
    const { page } = await newBrowser.init()
    await page.goto('https://web.contmatic.com.br', { waitUntil: 'networkidle0' })
    await page.type('#login', 'victor@tactus')
    await page.type('#senha', 'vvlsilva123!')
    await page.click('#formularioLogar > div > div.container-login100-form-btn > button')
    await page.waitForSelector('body > div.divFundoAmbiente > div.divCampos > a:nth-child(1) > button')
    await page.click('body > div.divFundoAmbiente > div.divCampos > a:nth-child(1) > button')
    await page.waitForTimeout(120000)

    return { status: true }
  } catch (error) {
    if (error instanceof CaptchaBalanceError) {
      return { status: true, error: 'Sem creditos para burlar o captcha' }
    }
    console.log(error)
    return { status: false }
  }
}

(async () => {
  let canFinish : any
  do {
    canFinish = await main()
  } while (canFinish.status === false)
})()

import CreateBrowser from './CreateBrowser/CreateBrowser'
import { config } from 'dotenv'
import { parse, join } from 'path'
import { mkdirSync, unlink } from 'fs'
import { execute } from './components/ahk/executeFile'
import { CaptchaBalanceError } from './errors/CaptchaBalanceError'
import { rename, zipDirectory } from './renameFile'
import { workerData } from 'worker_threads'
import { sendZip } from './components/sendZip'
import { remove } from 'fs-extra'

async function main () {
  const inputPath = join(process.cwd(), 'entrada')
  const outputPath = join(process.cwd(), 'saida')
  remove(inputPath)
  remove(outputPath)
  try {
    config({ path: join(parse(__dirname).dir, '.env') })
    mkdirSync(join(process.cwd(), 'saida'), { recursive: true })
    mkdirSync(join(process.cwd(), 'entrada'), { recursive: true })
    const newBrowser = new CreateBrowser()
    const { browser, page } = await newBrowser.init()
    await page.goto('https://web.contmatic.com.br', { waitUntil: 'networkidle0' })
    await page.type('#login', process.env.LOGIN)
    await page.type('#senha', process.env.SENHA)
    await page.click('#formularioLogar > div > div.container-login100-form-btn > button')
    await page.waitForSelector('body > div.divFundoAmbiente > div.divCampos > a:nth-child(1) > button').catch(e => '')
    await page.click('body > div.divFundoAmbiente > div.divCampos > a:nth-child(1) > button').catch(e => '')
    await page.waitForTimeout(120000)
    await newBrowser.closeAll(browser)

    execute(workerData)
    rename(inputPath, outputPath, workerData.codigos, workerData.anos, workerData.mes)
    console.log(process.cwd())
    await zipDirectory(outputPath, join(process.cwd(), 'arquivos.zip'))

    await sendZip(join(process.cwd(), 'arquivos.zip'))

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
  await main()
})()

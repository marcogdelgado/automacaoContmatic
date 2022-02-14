import CreateBrowser from './CreateBrowser/CreateBrowser'
import { config } from 'dotenv'
import { parse, join } from 'path'
import { mkdirSync, unlink } from 'fs'
import { execute } from './components/ahk/executeFile'
import { CaptchaBalanceError } from './errors/CaptchaBalanceError'
import { rename, zipDirectory } from './renameFile'
import { isMainThread, Worker, workerData } from 'worker_threads'
import { sendZip } from './components/sendZip'
import { remove } from 'fs-extra'
import clearPath from './clearPath'

async function main() {
  const parentDir = join(parse(__dirname).dir)
  const inputPath = join(parentDir, 'entrada')
  const outputPath = join(parentDir, 'saida')
  //clearPath(inputPath, outputPath)
  await remove(inputPath)
  await remove(outputPath)
  try {
    config({ path: join(parentDir, '.env') })
    const newBrowser = new CreateBrowser()
    const { browser, page } = await newBrowser.init()
    await page.goto('https://web.contmatic.com.br', { waitUntil: 'networkidle0' })
    mkdirSync(outputPath, { recursive: true })
    mkdirSync(inputPath, { recursive: true })
    await page.type('#login', process.env.LOGIN)
    await page.type('#senha', process.env.SENHA)
    await page.click('#formularioLogar > div > div.container-login100-form-btn > button')
    await page.waitForSelector('body > div.divFundoAmbiente > div.divCampos > a:nth-child(1) > button').catch(e => '')
    await page.click('body > div.install > div.divFundoConcluido > div.divCampos > a.continue-login > button').catch(e => '')
    await page.click('body > div.divFundoAmbiente > div.divCampos > a:nth-child(1) > button').catch(e => '')
    await page.waitForTimeout(120000)
    await newBrowser.closeAll(browser)

    await execute(workerData)
    await rename(inputPath, outputPath, workerData.codigo, workerData.anos, workerData.mes)

    await zipDirectory(outputPath, join(parentDir, 'arquivos.zip'))

    await sendZip(join(parentDir, 'arquivos.zip'))

    process.exit()
  } catch (error) {
    if (error instanceof CaptchaBalanceError) {
      return { status: true, error: 'Sem creditos para burlar o captcha' }
    }
    console.log(error)
    return { status: false }
  }
}
(async () => {
  // if (isMainThread) {
  //   const w = new Worker(__filename, {
  //     workerData: {
  //       servidor: 'tactusSP',
  //       codigo: ['688', '100'],
  //       anos: ['2022', '2021', '2020'],
  //       mes: ['01', '02', '03']
  //     }
  //   })
  // } else {
  await main()
  //}
})()

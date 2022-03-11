import CreateBrowser from './CreateBrowser/CreateBrowser'
import { config } from 'dotenv'
import { parse, join } from 'path'
import { mkdirSync } from 'fs'
import { execute } from './components/ahk/executeFile'
import { CaptchaBalanceError } from './errors/CaptchaBalanceError'
import { rename, zipDirectory } from './renameFile'
import { sendZip } from './components/sendZip'
import { remove } from 'fs-extra'
import { fork } from 'child_process'

async function main () {
  const workerData = JSON.parse(process.argv[3])
  const parentDir = join(parse(__dirname).dir)
  const inputPath = join(parentDir, 'entrada')
  const outputPath = join(parentDir, 'saida')
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
    await page.waitForTimeout(20000)
    await newBrowser.closeAll(browser)

    await execute(workerData)
    console.log('iniciando rename')
    await rename(inputPath, outputPath, workerData.codigo, workerData.anos, workerData.mes)
    console.log('terminou rename')
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
  if (process.argv[2] === 'child') {
    await main()
  }
  const c = fork(__filename, ['child', JSON.stringify({
    servidor: 'tactusSP',
    codigo: ['1500', '1291', '763'],
    anos: ['2022', '2021', '2020'],
    mes: ['01', '02', '03']
  })])
  c.on('exit', () => {
    console.log('parou')
  })
})()

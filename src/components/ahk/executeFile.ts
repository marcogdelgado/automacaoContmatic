import { execSync } from 'child_process'
import { existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from 'fs'
import { remove } from 'fs-extra'
import { join } from 'path'
import pixelmatch from 'pixelmatch'
import { PNG } from 'pngjs'
import IWorkerData from '../../interfaces/IWorkerData'
import CONFIG from './config.json'
// import { workerData } from 'worker_threads'
import resizePrint from '../resizePrint'

import { setTimeout } from 'timers/promises'
import { randomBytes } from 'crypto'
import { promisify } from 'util'

export async function execute (workerData: IWorkerData) {
  const pathTemp = join(__dirname, 'temp')
  const pathScreenshot = join(__dirname, 'screenSchoot')
  const image1 = join(pathScreenshot, 'screen1.png')
  const image2 = join(pathScreenshot, 'screen2.png')
  mkdirSync(pathTemp, { recursive: true })
  selectServidor(workerData.servidor, pathTemp)
  findScanFolder(pathTemp)
  findContadorFolder(pathTemp)
  setLimitFolders(pathTemp)
  const codigos = filterCodigos([...workerData.codigo.sort((a, b) => parseInt(a) - parseInt(b))])
  for (let index = 0; index < codigos.length; index++) {
    filterByCodigoEmpresa(codigos[index], pathTemp)
    selectFirstFolder(pathTemp)
    selectFolders(pathTemp)
    copieFolders(pathTemp)
    await waitForDownload(pathScreenshot, pathTemp)
    await pasteFolders(pathTemp)
    // waitForPaste(pathTemp)
    initNextFolder(pathTemp)
    selectFolders(pathTemp)
    await printScreen(pathScreenshot, 'screen1', pathTemp)
    let i = 2

    while (true) {
      selectFolders(pathTemp)
      await printScreen(pathScreenshot, 'screen' + i.toString(), pathTemp)
      renameSync(join(pathScreenshot, 'screen' + i.toString() + '.png'), image2)
      const diff = compareImages(image1, image2)

      if (diff === 0) {
        console.log(diff)
        break
      }

      unlinkSync(image1)
      renameSync(image2, image1)
      copieFolders(pathTemp)
      await waitForDownload(pathScreenshot, pathTemp)
      await pasteFolders(pathTemp)
      // waitForPaste(pathTemp)
      initNextFolder(pathTemp)
      i++
    }
  }
  closeExplorer(pathTemp)
  closeProgram(pathTemp)
  await remove(pathTemp)
  await remove(pathScreenshot)
}

function closeExplorer (pathTemp) {
  const path = join(__dirname, 'closeExplorer.ahk')
  const content = readFileSync(path).toString()
  writeFileSync(join(__dirname, 'temp', 'closeExplorer.ahk'), content)
  execSync(`"${CONFIG.pathExecutableAhk}" ${join(pathTemp, 'closeExplorer.ahk')}`)
}

function closeProgram (pathTemp: string) {
  const path = join(__dirname, 'closeProgram.ahk')
  const content = readFileSync(path).toString()
  writeFileSync(join(__dirname, 'temp', 'closeProgram.ahk'), content)
  execSync(`"${CONFIG.pathExecutableAhk}" ${join(pathTemp, 'closeProgram.ahk')}`)
}

async function printScreen (pathScreenshot, namePrint, pathTemp) {
  const path = join(__dirname, 'printScreen.ahk')
  let contentPrintScreen = readFileSync(path).toString()
  contentPrintScreen = contentPrintScreen.replace('{path_screenshot}', join(pathScreenshot, namePrint + '.png'))
  writeFileSync(join(pathTemp, 'printScreen.ahk'), contentPrintScreen)
  execSync(`"${CONFIG.pathExecutableAhk}" ${join(pathTemp, 'printScreen.ahk')}`)
  await resizePrint(join(pathScreenshot, namePrint + '.png'), join(pathScreenshot, `${namePrint}-resizable.png`))
  unlinkSync(join(pathScreenshot, `${namePrint}.png`))
  renameSync(join(pathScreenshot, `${namePrint}-resizable.png`), join(pathScreenshot, namePrint + '.png'))
}

function selectFirstFolder (pathTemp) {
  const path = join(__dirname, 'selectFirstFolder.ahk')
  const contentSelectFirstFolder = readFileSync(path).toString()
  writeFileSync(join(__dirname, 'temp', 'selectFirstFolder.ahk'), contentSelectFirstFolder)
  execSync(`"${CONFIG.pathExecutableAhk}" ${join(pathTemp, 'selectFirstFolder.ahk')}`)
}

function setLimitFolders (pathTemp) {
  const path = join(__dirname, 'setLimitFolders.ahk')
  const content = readFileSync(path).toString()
  writeFileSync(join(__dirname, 'temp', 'setLimitFolders.ahk'), content)
  execSync(`"${CONFIG.pathExecutableAhk}" ${join(pathTemp, 'setLimitFolders.ahk')}`)
}

function selectServidor (serverName: string, pathTemp: string) {
  const path = join(__dirname, 'selectServidor.ahk')
  let contentSelectServerAHK = readFileSync(path).toString()

  contentSelectServerAHK = contentSelectServerAHK.replace('{server_x}', CONFIG.coordinates.server[serverName].x)
  contentSelectServerAHK = contentSelectServerAHK.replace('{server_y}', CONFIG.coordinates.server[serverName].y)

  writeFileSync(join(__dirname, 'temp', 'selectServidor.ahk'), contentSelectServerAHK)
  execSync(`"${CONFIG.pathExecutableAhk}" ${join(pathTemp, 'selectServidor.ahk')}`)
}

function findScanFolder (pathTemp: string) {
  const path = join(__dirname, 'findScanFolder.ahk')
  let contentSelectServerAHK = readFileSync(path).toString()
  contentSelectServerAHK = contentSelectServerAHK.replace(/{filterInput_x}/gmi, CONFIG.coordinates.inputFilter.x)
  contentSelectServerAHK = contentSelectServerAHK.replace(/{filterInput_y}/gmi, CONFIG.coordinates.inputFilter.y)

  contentSelectServerAHK = contentSelectServerAHK.replace('{btnFolderScan_x}', CONFIG.coordinates.btnFolderScan.x)
  contentSelectServerAHK = contentSelectServerAHK.replace('{btnFolderScan_y}', CONFIG.coordinates.btnFolderScan.y)

  writeFileSync(join(__dirname, 'temp', 'findScanFolder.ahk'), contentSelectServerAHK)
  execSync(`"${CONFIG.pathExecutableAhk}" ${join(pathTemp, 'findScanFolder.ahk')}`)
}

function findContadorFolder (pathTemp) {
  const path = join(__dirname, 'findContadorFolder.ahk')
  let contentSelectServerAHK = readFileSync(path).toString()

  contentSelectServerAHK = contentSelectServerAHK.replace('{btnFolderContador_x}', CONFIG.coordinates.btnFolderContador.x)
  contentSelectServerAHK = contentSelectServerAHK.replace('{btnFolderContador_y}', CONFIG.coordinates.btnFolderContador.y)
  writeFileSync(join(__dirname, 'temp', 'findContadorFolder.ahk'), contentSelectServerAHK)
  execSync(`"${CONFIG.pathExecutableAhk}" ${join(pathTemp, 'findContadorFolder.ahk')}`)
}

function initNextFolder (pathTemp: string) {
  const path = join(__dirname, 'initNextFolder.ahk')
  const content = readFileSync(path).toString()
  writeFileSync(join(pathTemp, 'initNextFolder.ahk'), content)
  execSync(`"${CONFIG.pathExecutableAhk}" ${join(pathTemp, 'initNextFolder.ahk')}`)
}

function selectFolders (pathTemp) {
  const path = join(__dirname, 'selectFolders.ahk')
  const contentSelectFolders = readFileSync(path).toString()
  writeFileSync(join(pathTemp, 'selectFolders.ahk'), contentSelectFolders)
  execSync(`"${CONFIG.pathExecutableAhk}" ${join(pathTemp, 'selectFolders.ahk')}`)
}

function copieFolders (pathTemp) {
  const path = join(__dirname, 'copieFolders.ahk')
  const content = readFileSync(path).toString()
  writeFileSync(join(pathTemp, 'copieFolders.ahk'), content)
  execSync(`"${CONFIG.pathExecutableAhk}" ${join(pathTemp, 'copieFolders.ahk')}`)
}

async function pasteFolders (pathTemp) {
  // return new Promise<void>(async (resolve, reject) => {
  const path = join(__dirname, 'pasteFolders.ahk')
  const content = readFileSync(path).toString()
  writeFileSync(join(pathTemp, 'pasteFolders.ahk'), content)
  execSync(`"${CONFIG.pathExecutableAhk}" ${join(pathTemp, 'pasteFolders.ahk')}`)
  await waitForDialogCopie(pathTemp)
  await waitForPaste(pathTemp)
  closeExplorer(pathTemp)
  //  resolve()
  // })
}

function compareImages (image1, image2) {
  const img1 = PNG.sync.read(readFileSync(image1))

  const img2 = PNG.sync.read(readFileSync(image2))

  const {
    width,
    height
  } = img1
  const diff = new PNG({
    width,
    height
  })
  const difference = pixelmatch(img1.data, img2.data, diff.data, width, height, {
    threshold: 0.1
  })
  return difference
}

function filterByCodigoEmpresa (codigo: string, pathTemp: string) {
  const path = join(__dirname, 'filterByCodigoEmpresa.ahk')
  let contentSelectServerAHK = readFileSync(path).toString()

  contentSelectServerAHK = contentSelectServerAHK.replace('{codigo}', codigo)

  writeFileSync(join(__dirname, 'temp', 'filterByCodigoEmpresa.ahk'), contentSelectServerAHK)
  execSync(`"${CONFIG.pathExecutableAhk}" ${join(pathTemp, 'filterByCodigoEmpresa.ahk')}`)
}

function filterCodigos (array: Array<string>, newArray: Array<string> = []) {
  if (array.length === 0) {
    return newArray
  }

  const first = array.shift()
  let find = false
  array.forEach((item, index) => {
    if (item.includes(first)) {
      newArray.push(first)
      delete array[index]
      find = true
    }
  })

  if (!find) {
    newArray.push(first)
  }

  return filterCodigos(array.filter(item => item !== ''), newArray)
}

async function printAreaDownloadProgressBar (pathScreenshot, pathTemp) {
  const path = join(__dirname, 'printScreen.ahk')
  const randomBytesSync = promisify(randomBytes)
  const randomName = (await randomBytesSync(12)).toString('hex')
  let contentPrintScreen = readFileSync(path).toString()
  contentPrintScreen = contentPrintScreen.replace('{path_screenshot}', join(pathScreenshot, `${randomName}.png`))
  writeFileSync(join(pathTemp, 'printScreen.ahk'), contentPrintScreen)
  execSync(`"${CONFIG.pathExecutableAhk}" ${join(pathTemp, 'printScreen.ahk')}`)
  await resizePrint(join(pathScreenshot, `${randomName}.png`), join(pathScreenshot, `${randomName}-resizable.png`), 'progressBar')
  unlinkSync(join(pathScreenshot, `${randomName}.png`))
  renameSync(join(pathScreenshot, `${randomName}-resizable.png`), join(pathScreenshot, `${randomName}.png`))
  return randomName
}

async function waitForDownload (pathScreenshot, pathTemp) {
  const nameImage = await printAreaDownloadProgressBar(pathScreenshot, pathTemp)
  console.log(nameImage)
  const pathImage = join(pathScreenshot, `${nameImage}.png`)
  const diff = compareImages(join(__dirname, 'images', 'downloadComplete.png'), pathImage)
  console.log(diff)
  if (diff === 0) {
    unlinkSync(pathImage)
    return true
  }

  unlinkSync(pathImage)

  await setTimeout(5000)
  return await waitForDownload(pathScreenshot, pathTemp)
}

async function waitForPaste (pathTemp) {
  const path = join(__dirname, 'getAllWindowsTitle.ahk')
  const randomBytesSync = promisify(randomBytes)
  const randomName = (await randomBytesSync(12)).toString('hex')
  const file = join(pathTemp, `${randomName}.txt`)
  let content = readFileSync(path).toString()

  content = content.replace('{path_file}', file)
  writeFileSync(join(pathTemp, 'getAllWindowsTitle.ahk'), content)
  execSync(`"${CONFIG.pathExecutableAhk}" ${join(pathTemp, 'getAllWindowsTitle.ahk')}`)
  waitForFile(file)
  content = readFileSync(file, { encoding: 'latin1' }).toString()
  console.log(content)
  if (content.includes('Copiando...')) {
    console.log('ESTA COPIANDO')
    await setTimeout(3000)
    unlinkSync(file)
    return await waitForPaste(pathTemp)
  }
  return true
}

async function waitForDialogCopie (pathTemp) {
  const path = join(__dirname, 'getAllWindowsTitle.ahk')
  const randomBytesSync = promisify(randomBytes)
  const randomName = (await randomBytesSync(12)).toString('hex')
  const file = join(pathTemp, `${randomName}.txt`)
  let content = readFileSync(path).toString()

  content = content.replace('{path_file}', file)
  writeFileSync(join(pathTemp, 'getAllWindowsTitle.ahk'), content)
  execSync(`"${CONFIG.pathExecutableAhk}" ${join(pathTemp, 'getAllWindowsTitle.ahk')}`)
  waitForFile(file)
  content = readFileSync(file, { encoding: 'latin1' }).toString()
  if (!content.includes('Copiando...')) {
    console.log('DIALOG FECHADO')
    await setTimeout(3000)
    unlinkSync(file)
    return await waitForDialogCopie(pathTemp)
  }
  return true
}

function waitForFile (pathFile) {
  if (!existsSync(pathFile)) { return waitForFile(pathFile) }
  return true
}

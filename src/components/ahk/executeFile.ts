import { execSync } from 'child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'fs'
import { remove } from 'fs-extra'
import { join } from 'path'
import IWorkerData from '../../interfaces/IWorkerData'
import CONFIG from './config.json'
export function execute (workerData: IWorkerData) {
  const pathTemp = join(__dirname, 'temp')
  mkdirSync(pathTemp, { recursive: true })
  selectServidor(workerData.server, pathTemp)
  findScanFolder(pathTemp)
  findContadorFolder(pathTemp)
  filterByCodigoEmpresa(workerData.codigos, pathTemp)
  remove(pathTemp)
  console.log('terminou')
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

function filterByCodigoEmpresa (codigos: Array<string>, pathTemp: string) {
  const path = join(__dirname, 'filterByCodigoEmpresa.ahk')
  let contentSelectServerAHK = readFileSync(path).toString()

  contentSelectServerAHK = contentSelectServerAHK.replace('{codigos}', codigos.join(','))
  contentSelectServerAHK = contentSelectServerAHK.replace('{pathEntrada}', CONFIG.pathEntrada)

  writeFileSync(join(__dirname, 'temp', 'filterByCodigoEmpresa.ahk'), contentSelectServerAHK)
  execSync(`"${CONFIG.pathExecutableAhk}" ${join(pathTemp, 'filterByCodigoEmpresa.ahk')}`)
}

import { copyFileSync, createWriteStream, existsSync, lstatSync, mkdirSync, readdirSync, renameSync, statSync, unlinkSync } from 'fs'
import { join } from 'path'
import archiver from 'archiver'
import extract from 'extract-zip'
export async function rename (path: string, outputPath: string, codigo: Array<string>, anos: Array<string>, mes : Array<string>) {
  const files = readdirSync(path)
  for (let index = 0; index < files.length; index++) {
    if (lstatSync(join(path, files[index])).isDirectory()) {
      const isPresent = codigo.filter(item => item.trim() === files[index].trim())
      if (isPresent.length !== 0) {
        getYearFolder(join(path, files[index]), anos, mes, files[index], outputPath)
      }
      continue
    }
    await extractZip(join(path, files[index]), path)
    unlinkSync(join(path, files[index]))
    return rename(path, outputPath, codigo, anos, mes)
  }
}

function getYearFolder (path: string, anos: Array<string>, mes: Array<string>, codigo : string, outputPath) {
  const years = readdirSync(path)
  for (let index = 0; index < years.length; index++) {
    if (anos.includes(years[index])) {
      getMonths(join(path, years[index]), years[index], mes, codigo, outputPath)
    }
    // if (lstatSync(join(path, files[index])).isDirectory()) {
    // }
  }
}

function getMonths (path: string, ano: string, mes: Array<string>, codigo : string, outputPath) {
  const months = readdirSync(path)
  for (let index = 0; index < months.length; index++) {
    if (mes.includes(months[index])) {
      getFolhaFolder(join(path, months[index]), ano, months[index], codigo, outputPath)
    }
    // if (lstatSync(join(path, files[index])).isDirectory()) {
    // }
  }
}

function getFolhaFolder (path: string, ano : string, mes: string, codigo: string, outputPath) {
  const files = readdirSync(path)
  for (let index = 0; index < files.length; index++) {
    if (files[index] === 'Folha') {
      handlerFolhaFolder(join(path, files[index]), ano, mes, codigo, outputPath)
    }
  }
}

function handlerFolhaFolder (path : string, ano: string, mes : string, codigo : string, outputPath) {
  const files = readdirSync(path)
  for (let index = 0; index < files.length; index++) {
    if (lstatSync(join(path, files[index])).isDirectory()) {
      return handlerFolhaFolder(join(path, files[index]), ano, mes, codigo, outputPath)
    }

    mkdirSync(path.replace('entrada', 'saida'), { recursive: true })
    copyRecursiveSync(join(path, files[index]), join(path.replace('entrada', 'saida'), files[index]))
    const name = join(path.replace('entrada', 'saida'), `${codigo}_${ano}_${mes}_${files[index]}`)
    renameSync(join(path.replace('entrada', 'saida'), files[index]), name)
  }
}

function copyRecursiveSync (src, dest) {
  const exists = existsSync(src)
  const stats = exists && statSync(src)
  const isDirectory = exists && stats.isDirectory()
  if (isDirectory) {
    mkdirSync(dest)
    readdirSync(src).forEach(function (childItemName) {
      copyRecursiveSync(join(src, childItemName),
        join(dest, childItemName))
    })
  } else {
    copyFileSync(src, dest)
  }
}

async function extractZip (pathZip, outputZip) {
  try {
    await extract(pathZip, { dir: outputZip })
  } catch (err) {
    // handle any errors
  }
}

/**
 * @param {String} sourceDir: /some/folder/to/compress
 * @param {String} outPath: /path/to/created.zip
 * @returns {Promise}
 */
export function zipDirectory (sourceDir, outPath) {
  const archive = archiver('zip', { zlib: { level: 9 } })
  const stream = createWriteStream(outPath)

  return new Promise<void>((resolve, reject) => {
    archive
      .directory(sourceDir, false)
      .on('error', err => reject(err))
      .pipe(stream)

    stream.on('close', () => resolve())
    archive.finalize()
  })
}

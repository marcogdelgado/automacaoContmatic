import { readFileSync } from 'fs'

export function read (path : string, header : Array<string>, delimiter : string = ';') {
  const arrayCsv = []
  const conteudo = readFileSync(path, { encoding: 'utf-8' })
  if (!header.length) {
    header = conteudo.split('\n')[0].split(delimiter)
  }
  conteudo.split('\n').splice(1).forEach((item) => {
    const obj = {}
    item.split(delimiter).forEach((value, index) => {
      obj[header[index]] = value
    })
    arrayCsv.push(obj)
  })
  return arrayCsv
}

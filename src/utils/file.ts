import { readdirSync } from 'fs'
import { join } from 'path'

export function findByName (name: string, OutputPath: string) {
  const file = readdirSync(process.env.pathDownload, { encoding: 'utf-8' })
  for (let i = 0; i < file.length; i++) {
    const nomeArquivo = join(process.env.pathDownload, file[i])
    if (nomeArquivo.includes(name)) {
      return join(OutputPath, `${name}.pdf`)
    }
  }
}

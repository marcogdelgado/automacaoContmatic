import sharp from 'sharp'

export default async (input: string, output: string, area : string = 'all') => {
  return new Promise<void>((resolve, reject) => {
    setTimeout(function () {
      sharp(input).extract(
        {
          width: parseInt(area === 'all' ? process.env.WIDTH_IMAGE_RESIZE : process.env.WIDTH_IMAGE_RESIZE_DOWNLOAD), // 689,
          height: parseInt(area === 'all' ? process.env.HEIGHT_IMAGE_RESIZE : process.env.HEIGHT_IMAGE_RESIZE_DOWNLOAD), // 420,
          left: parseInt(area === 'all' ? process.env.LEFT_IMAGE_RESIZE : process.env.LEFT_IMAGE_RESIZE_DOWNLOAD), // 340,
          top: parseInt(area === 'all' ? process.env.TOP_IMAGE_RESIZE : process.env.TOP_IMAGE_RESIZE_DOWNLOAD) // 163
        }).toFile(output)
        .then(r => {
          resolve()
        })
        .catch(e => {
          reject(e)
        })
    }, 6000)
  }

  )
}

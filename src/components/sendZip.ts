import axios from 'axios'
import { createReadStream } from 'fs'
import FormData from 'form-data'

export async function sendZip (pathZip) {
  const image = createReadStream(pathZip)
  const form = new FormData()
  form.append('zip', image)
  await axios.post('http://c5bc-187-37-29-228.ngrok.io/uploadZip', form, {
    headers: { ...form.getHeaders() },
    maxBodyLength: Infinity,
    maxContentLength: Infinity
  })
}

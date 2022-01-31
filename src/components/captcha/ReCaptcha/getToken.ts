import axios from 'axios'
import CONFIG from '../config.json'
// process.env.SECRET_CAPTCHA_TOKEN
import { CaptchaBalanceError } from '../../../errors/CaptchaBalanceError'
interface IRequestCaptcha {
  status: number;
  request: string;
}

export async function getToken (idCaptcha: string) {
  try {
    const token = await promiseRequestHttpGet(`${CONFIG.solution.url}?key=${process.env.SECRET_CAPTCHA_TOKEN}&action=get&id=${idCaptcha}&json=true`) as IRequestCaptcha
    if (token.status !== 1) throw new Error('Erro ao buscar token')
    return token.request
  } catch (error) {
    return false
  }
}

export async function getId (siteKey: string, siteUrl: string) {
  const idCaptcha = await promiseRequestHttpGet(`${CONFIG.submit.url}?key=${process.env.SECRET_CAPTCHA_TOKEN}&json=true&method=userrecaptcha&googlekey=${siteKey}&pageurl=${siteUrl}`) as IRequestCaptcha
  if (idCaptcha.request === 'ERROR_ZERO_BALANCE') throw new CaptchaBalanceError('')
  return idCaptcha.request
}

function promiseRequestHttpGet (url: string) {
  return new Promise((resolve, reject) => {
    axios.get(url)
      .then(res => resolve(res.data))
      .catch(error => reject(error))
  })
}

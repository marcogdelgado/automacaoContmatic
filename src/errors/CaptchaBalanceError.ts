export class CaptchaBalanceError extends Error {
  constructor (message: string) {
    super(message)
    this.name = 'CaptchaBalanceError'
  }
}

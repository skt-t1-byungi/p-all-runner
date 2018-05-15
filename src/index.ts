export type Action = () => Promise<any>
export type Awaitable = Promise<any> | Action | Runner

export class Runner {
  private _pList: Array<Promise<any>> = []
  private _queue: Array<Action | Runner> = []

  public run (...pList: Awaitable[]) {
    this._pList.push(
      ...pList.map(p => p instanceof Runner ? p.waitAll() : typeof p === 'function' ? p() : p)
    )
  }

  public queue (action: Array<Action | Runner>) {
    if (typeof action !== 'function') {
      throw new TypeError('Expected argument of type "function" or "Runner"')
    }
    this._queue.push(action)
  }

  public waitAll () {
    this._pList.push(...this._queue.map(q => q instanceof Runner ? q.waitAll() : q()))
    this._queue = []

    const pList = [...this._pList]
    const clear = () => (this._pList = this._pList.filter(p => pList.indexOf(p) === -1))

    return Promise.all(pList).then(clear).catch(clear)
  }
}

export const runner = () => new Runner()

export default runner

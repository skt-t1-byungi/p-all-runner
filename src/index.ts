export type Action = () => Promise<any>
export type PromiseOrAction = Promise<any> | Action

export class Runner {
  private _pList: Array<Promise<any>> = []
  private _queue: Action[] = []

  public run (...pList: PromiseOrAction[]) {
    this._pList.push(
      ...pList.map(p => typeof p === 'function' ? p() : p)
    )
  }

  public queue (action: Action) {
    if (typeof action !== 'function') {
      throw new TypeError('The argument is not a function type')
    }
    this._queue.push(action)
  }

  public runAll () {
    this._pList.push(...this._queue.map(action => action()))
    this._queue = []

    const pList = [...this._pList]

    return Promise.all(pList).then(() => {
      this._pList = this._pList.filter(p => pList.indexOf(p) === -1)
    })
  }
}

export const runner = () => new Runner()

export default runner

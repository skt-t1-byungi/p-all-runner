export type Action = () => Promise<any>
export type Awaitable = Promise<any> | Action | Runner

export class Runner {
  private _pList: Array<Promise<any>> = []
  private _queue: Array<Action | Runner> = []

  public add (...pList: Awaitable[]) {
    this._pList.push(...pList.map(p => ensurePromise(p)))
  }

  public defer (...acts: Array<Action | Runner>) {
    this._queue.push(...acts)
  }

  public wait ({ silent = false } = {}) {
    this._pList.push(...this._queue.map(q => ensurePromise(q)))
    this._queue = []

    const pList = [...this._pList]
    const pAll = Promise.all(pList)

    const clear = () => (this._pList = this._pList.filter(p => pList.indexOf(p) === -1))
    pAll.then(clear).catch(clear)

    return pAll.catch(err => {
      if (silent) return Promise.resolve(null)
      return Promise.reject(err)
    })
  }
}

export const runner = () => new Runner()

export default runner

function ensurePromise (arg: Awaitable): Promise<any> {
  if (arg instanceof Runner) return arg.wait()
  const p = typeof arg === 'function' ? arg() : arg
  if (!(p instanceof Promise)) throw TypeError(`Expected type of "Promise", but "${typeof p}"`)
  return p
}

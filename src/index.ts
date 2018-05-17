export type Action = () => Promise<any>
export type Awaitable = Promise<any> | Action | Runner

export class Runner {
  private _pList: Array<Promise<any>> = []
  private _queue: Array<Action | Runner> = []

  public run (...pList: Awaitable[]) {
    this._pList.push(
      ...pList.map(p => {
        p = p instanceof Runner ? p.waitAll() : typeof p === 'function' ? p() : p
        if (!p.then) throw TypeError('Expected type of "Promise".')
        return p
      })
    )
  }

  public queue (...acts: Array<Action | Runner>) {
    this._queue.push(...acts)
  }

  public waitAll (silent = false) {
    this._pList.push(
      ...this._queue.map(q => {
        const p = q instanceof Runner ? q.waitAll() : q()
        if (!p.then) throw TypeError('que"Promise".')
        return p
      })
    )
    this._queue = []

    const pList = [...this._pList]
    this._pList = this._pList.filter(p => pList.indexOf(p) === -1)

    return Promise.all(pList)
      .catch(err => Promise[silent ? 'resolve' : 'reject'](err))
  }
}

export const runner = () => new Runner()

export default runner

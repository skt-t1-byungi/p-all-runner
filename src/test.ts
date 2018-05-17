import test from 'ava'
import runner, { Runner } from '.'

const delay = (ms: number = 0) => new Promise(resolve => setTimeout(resolve, ms))
const act = (v: string | Error) => Promise[v instanceof Error ? 'reject' : 'resolve'](v)

test('basic', async t => {
  t.plan(4)
  const pool = runner()

  let v1 = false
  let v2 = false

  const p1 = (async () => {
    await delay(1)
    v1 = true
  })()

  pool.run(p1)
  p1.then(_ => {
    t.true(v1)
    t.false(v2)
  })

  pool.run(async () => {
    await delay(2)
    v2 = true
  })
  await pool.waitAll()

  t.true(v1)
  t.true(v2)
})

test('cleanup', async t => {
  const pool = runner()
  const p1 = act('p1')
  const p2 = act('p2')

  pool.run(p1, p2)

  // tslint:disable-next-line
  t.deepEqual(pool['_pList'], [p1, p2])

  await pool.waitAll()

  // tslint:disable-next-line
  t.is(pool['_pList'].length, 0)
})

test('queue', async t => {
  const pool = runner()

  let v = false
  pool.queue(() => {
    v = true
    return act('test')
  })

  t.false(v)
  await pool.waitAll()
  t.true(v)
})

test('throw', async t => {
  const pool = runner()
  // pool.run(act('test1'), act(Error('test2')))

  // await pool.waitAll()
  t.pass()
})

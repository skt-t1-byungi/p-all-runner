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

  pool.add(p1)
  p1.then(_ => {
    t.true(v1)
    t.false(v2)
  })

  pool.add(async () => {
    await delay(2)
    v2 = true
  })
  await pool.wait()

  t.true(v1)
  t.true(v2)
})

test('cleanup', async t => {
  const pool = runner()
  const p1 = act('p1')
  const p2 = act('p2')

  pool.add(p1, p2)

  // tslint:disable-next-line
  t.deepEqual(pool['_pList'], [p1, p2])

  await pool.wait()

  // tslint:disable-next-line
  t.is(pool['_pList'].length, 0)
})

test('defer', async t => {
  const pool = runner()

  let v = false
  pool.defer(() => {
    v = true
    return act('test')
  })

  t.false(v)
  await pool.wait()
  t.true(v)
})

test('throw', async t => {
  const pool = runner()
  pool.add(act('test'), act(Error('test')))

  try {
    await pool.wait()
  } catch (error) {
    t.pass()
  }
})

test('silent err', async t => {
  const pool = runner()
  pool.add(act('test'), act(Error('test')))

  const result = await pool.wait({ silent: true })
  t.is(result, null)
})

test('complex', async t => {
  const pool1 = runner()
  const pool2 = runner()

  pool1.defer(pool2)

  const v: number[] = []
  pool1.add(async () => {
    await delay(1)
    v.push(1)
  })

  pool2.add(async () => {
    await delay(2)
    v.push(2)
  })

  pool2.add(async () => {
    await delay(3)
    v.push(3)
  })

  await pool1.wait()
  t.deepEqual(v, [1,2,3])
})

# p-all-runner
Async function runner to remove the ugly IIFE

[![npm](https://img.shields.io/npm/v/p-all-runner.svg?style=flat-square)](https://www.npmjs.com/package/p-all-runner)


## Install
```sh
yarn add p-all-runner
```

```js
//esm
import runner from "p-all-runner";

//commonjs
const {runner} = require('p-all-runner');
```

### What?
```js
(async () => {
  const concurrentTasks = []

  concurrentTasks.push(
    (async()=>{ 
      await asyncTask1()
    })(),
    (async()=>{
      await asyncTask2()
    })()
  )

  await Promise.all(concurrentTasks)
})()
```
Even within the async function there are concurrent tasks that do not "await" immediately. If write concurrent task with async function, need ugly IIFE.

```js
(async () => {
  const pool = runner() 

  pool.add(
    async()=>{ 
      await asyncTask1()
    },
    async()=>{
      await asyncTask2()
    }
  )

  await pool.wait()
})()
```
The p-all-runner calls the async function instead to remove the IIFE.

### API
#### Runner
Create an runner(pool) instance.

```js
const pool = runner()
// or 
import {Runner} from "p-all-runner"
const pool = new Runner()
```

#### pool.add(awaitable)
Add an async function to run immediately. it is possible to add promise or p-all-runner instance instead of async function.

```js
pool.add(
  async()=>{
    await asyncTask1()
    await asyncTask2()
  },
  asyncTask3() //returns promise.
)
pool.add(otherPool) 
```

#### pool.defer(act)
Run async function when `pool.wait()` is called. This is useful when using other p-all-runner instance together.

```js
pool.defer(async()=>{
  await asyncTask1()
})
await pool.wait()

// using other instance together
pool.defer(otherPool)
otherPool.add(()=> asyncTask())
await pool.wait()
```

#### pool.wait([opts])
Returns `promise.all()` for the added async functions.

##### opts
###### silent
If true, it returns null without throwing an error. defaults `false`.

### License
MIT
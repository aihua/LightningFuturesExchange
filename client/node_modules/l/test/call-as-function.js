'use strict'
import test from 'ava'

const line = require('../')

test('call as function', t => {
  t.plan(1)
  const l = line([
    {
      $type: 'async',
      func: (value, done) => setTimeout(() => done(null, value * 3), 1)
    },
    (val) => Promise.resolve(val * 2),
    (val) => val * 7
  ])
  return l(1).then(function (result) {
    t.is(result, 42)
  })
})

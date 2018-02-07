'use strict'
const Line = require('./src/Line')

function wrapper (segments) {
  var line = new Line(segments)
  return function () {
    return line.execute.apply(line, arguments)
  }
}

module.exports = wrapper
module.exports.Line = Line

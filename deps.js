#!/usr/local/bin/node

var fs = require('fs')
  , npm = require('npm')

  , luaStyle = (process.argv.length > 3)


function ERR(msg) {
  console.log(msg)
  process.exit(1)
}


if (process.argv.length < 3) {
  ERR("Pass either a public module name, or the full path to a package.json")
}

var ARG = process.argv[2]

function _listDeps(info) {
  var lst = Object.keys(info.dependencies || {})
  return luaStyle ? '{"'+lst.join('","')+'"}' : lst.join(',')
}

function _readFile() {
  fin(null, JSON.parse(fs.readFileSync(ARG)))
}

function _readModule() {
  npm.load({}, function(err) {
    if (err) return fin(err);

    npm.commands.info([ARG], function(_err, info) {
      if (_err) return fin(_err);
      fin(null, info[Object.keys(info)[0]])
    })
  })
}


function fin(err, info) {
  if (err) return ERR(err);
  console.log(_listDeps(info))
}

(!!~ ARG.indexOf('/')) ? _readFile() : _readModule()


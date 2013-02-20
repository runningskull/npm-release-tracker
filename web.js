var connect = require('connect')
  , semver = require('semver')
  , async = require('async')
  , npm = require('npm')
  , url = require('url')


function _newVersionInfo(info) {
  info = info[Object.keys(info)[0]]
  var latest = info.versions[info.versions.length - 1]
    , previous = info.versions[info.versions.length - 2]
    , latestTime = new Date(info.time[latest])
    , yesterday = new Date(Date.now() - (25 * 60 * 60 * 1000))  // hour buffer

    , url = info.repository.url
        .replace(/^git:/, 'https:')
        .replace(/\.git$/, '')

  url += '/compare/%…$'
    .replace('%', previous)
    .replace('$', latest)

  //return latestTime > yesterday ? [previous, latest] : undefined
  console.log(url)
  return latestTime > yesterday ? [latest, url] : undefined
}


function _iterator(memo, pkgName, cb) {
  npm.commands.info([pkgName], function(err, info) {
    if (err) return cb(err);
    cb(null, (memo[pkgName] = _newVersionInfo(info), memo))
  })
}


function req_handler(req, res) {
  if (! ('packages' in req.query))
    return res.statusCode=400, res.end('no packages listed');

  var packages = req.query.packages.split(',')

  async.reduce(packages, {}, _iterator, function(err, newVersions) {
    res.setHeader('Content-Type', "application/json; charset=utf-8")
    res.end(JSON.stringify(newVersions))
  })
}
// stringify


function GOGO_GADGET_SERVER() {
  var app = connect()
    .use(connect.logger('dev'))
    .use(connect.query())
    .use(req_handler)
    .listen(5000)

  console.log('\n~ Listening on port 5000 ~\n')
}


npm.load({}, GOGO_GADGET_SERVER)


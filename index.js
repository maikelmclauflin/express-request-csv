module.exports = csv

function csv (options = {}) {
  const {
    config,
    header = 'text/csv',
    shouldUse = defaultShouldUse,
    query: queryParam = 'fields',
    Parser = require('json2csv').Parser
  } = options
  const parser = new Parser(config)
  return csvMiddleware

  function csvMiddleware (req, res, next) {
    if (shouldUse(req)) {
      res.json = setupRequest(req, res)
    }
    next()
  }

  function setupRequest (req, res) {
    const { query } = req
    const { [queryParam]: fields = [] } = query
    let scopedParser = parser
    if (fields.length) {
      const opts = Object.assign({}, config, { fields })
      scopedParser = new Parser(opts)
    }
    return json

    function json (json) {
      res.set('Content-Type', header)
      return res.send(scopedParser.parse(json))
    }
  }

  function defaultShouldUse (req) {
    return req.get('Accept') === header
  }
}

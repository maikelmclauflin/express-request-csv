module.exports = csv

function csv (options = {}) {
  const {
    config,
    query = 'fields',
    Parser = require('json2csv').Parser
  } = options
  const parser = new Parser(config)
  return csvMiddleware

  function csvMiddleware (req, res, next) {
    if (req.get('Accept') === 'text/csv') {
      const originalJSON = res.json
      res.json = json
      const {
        [query] = []
      } = req.query
      scopedParser = fields.length ? Object.assign({}, config, {
        fields
      }) : parser
    }
    next()

    function json (json) {
      const csv = scopedParser.parse(json, opts)
      res.set('Content-Type', 'text/csv')
      return originalJSON.call(res, csv)
    }
  }
}

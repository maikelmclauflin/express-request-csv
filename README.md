# express-request-csv

CSV's should be easy to send to users that request them. Here's how we do it
```js
const expressRequestCSV = require('express-request-csv')
const app = express()
app.use(expressRequestCSV())
app.use('/some-data', (req, res, next) => {
  res.json([{a: 1}, {a: 2}])
})
```
client side
```js
const json = fetch('/some-data')

const csv = fetch('/some-data', {
  headers: {
    Accept: 'text/csv'
  }
})
```
## Configuration Options

* `Parser` - Don't like json2csv? Don't use it! Swap it out with your own parser.
* `config` - The configuration to pass to the new parser for the middleware instance. Uses empty object by default.
* `header` - Change the header that you accept and send back. Uses `text/csv` by default.
* `shouldUse` - An optional function to check the request and determine whether the csv parser should be used. Defaults to checking the request header for `text/csv`
* `query` - A key to check for field subsetting passed from the client. Defaults to `fields`.
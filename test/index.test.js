import {
  app,
  addRoute
} from './app'
import { ok } from './utils.test'
import test from 'ava'
import supertest from 'supertest'

addRoute('/to-csv')
const suffix = `; charset=utf-8`

const basicObject = [{
  a: 1,
  b: 2,
  c: 3
}, {
  a: 4,
  b: 5,
  c: 7
}]
const basicCSV = `"a","b","c"
1,2,3
4,5,7`

const basicCSVSubset = `"a","c"
1,3
4,7`

const deepObjects = [{
  name: 'adam',
  preference: 'weekends',
  ratings: {
    darts: 100,
    bowling: 250
  }
}, {
  name: 'betty',
  preference: 'weekday mornings,nights',
  ratings: {
    darts: 200,
    bowling: 200
  }
}]

test('usually sends back json', async (t) => {
  t.plan(2)

  const response = await supertest(app)
    .post('/to-csv')
    .send(basicObject)
    .expect(ok)

  t.deepEqual(response.body, basicObject, 'the endpoint sends back the data sent to it')
  t.is(response.get('Content-Type'), `application/json${suffix}`, 'a header is sent back')
})

test('sends back csv when `Accept` header is added', async (t) => {
  t.plan(2)

  const response = await supertest(app)
    .post('/to-csv')
    .set('Accept', 'text/csv')
    .send(basicObject)
    .expect(ok)

  t.is(response.text, basicCSV, 'the endpoint can convert that data to a csv structure, using keys for the header')
  t.is(response.get('Content-Type'), `text/csv${suffix}`, 'a header is sent back')
})

test('filters out columns if requested', async (t) => {
  t.plan(2)

  const response = await supertest(app)
    .post('/to-csv')
    .query({
      fields: ['a', 'c']
    })
    .set('Accept', 'text/csv')
    .send(basicObject)
    .expect(ok)

  t.is(response.text, basicCSVSubset, 'only the requested columns are sent')
  t.is(response.get('Content-Type'), `text/csv${suffix}`, 'a header is sent back')
})

test('can access deep columns', async (t) => {
  t.plan(1)

  const { text } = await supertest(app)
    .post('/to-csv')
    .query({
      fields: ['name', 'preference', 'ratings.bowling']
    })
    .set('Accept', 'text/csv')
    .send(deepObjects)
    .expect(ok)

  t.is(text, `"name","preference","ratings.bowling"
"adam","weekends",250
"betty","weekday mornings,nights",200`, 'the endpoint can reach into objects to get their values')
})

test('json2csv is not required', async (t) => {
  t.plan(2)

  addRoute('/to-csv-headline', {
    Parser
  })

  const response = await supertest(app)
    .post('/to-csv-headline')
    .set('Accept', 'text/csv')
    .send(basicObject)
    .expect(ok)

  t.deepEqual(response.text, '"a","b","c"', 'a custom parser can be employed')
  t.is(response.get('Content-Type'), `text/csv${suffix}`, 'a header is sent back')

  function Parser (config) {
    return {
      parse: (object) => {
        return Object.keys(object[0]).map((key) => `"${key}"`).join(',')
      }
    }
  }
})

test('can pass config directly to parser', async (t) => {
  t.plan(1)
  const route = '/to-csv-config'
  const delimiter = '['
  addRoute(route, {
    config: {
      delimiter
    }
  })

  const response = await supertest(app)
    .post(route)
    .set('Accept', 'text/csv')
    .send(basicObject)
    .expect(ok)

  const basicBSV = basicCSV.split(',').join(delimiter)
  t.is(response.text, basicBSV, 'the bracket delimiter is used')
})

test('alternative headers can be employed', async (t) => {
  let response
  t.plan(5)

  addRoute('/to-csv-header', {
    header: 'text/alt'
  })

  response = await supertest(app)
    .post('/to-csv-header')
    .send(basicObject)
    .expect(ok)

  t.deepEqual(response.body, basicObject, 'objects without will not be touched')

  response = await supertest(app)
    .post('/to-csv-header')
    .set('Accept', 'text/csv')
    .send(basicObject)
    .expect(ok)

  t.deepEqual(response.body, basicObject, 'objects with the original header will not be touched')
  t.is(response.get('Content-Type'), `application/json${suffix}`, 'headers remain untouched')

  response = await supertest(app)
    .post('/to-csv-header')
    .set('Accept', 'text/alt')
    .send(basicObject)
    .expect(ok)

  t.is(response.text, basicCSV, 'a custom parser can be employed when the matching header is sent')
  t.is(response.get('Content-Type'), `text/alt${suffix}`, 'the same headers are sent back')
})

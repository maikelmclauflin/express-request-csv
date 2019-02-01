module.exports = {
  status,
  ok: status(200)
}

function status (expected) {
  return function (res) {
    if (!res) {
      throw new Error('no response object')
    }
    const { status, body } = res
    if (status !== expected) {
      console.log(`${status} was not ${expected}`)
      return new Error(JSON.stringify(body))
    }
  }
}

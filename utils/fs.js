const fs = require('fs')
const path = require('path')


const read = (dir) => {
  const readData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'model', `${dir}`)))

  return readData
}

const write = (dir, data) => {
  fs.writeFileSync(path.join(process.cwd(), 'model', `${dir}`), JSON.stringify(data, null, 4))
}


module.exports = {
  read,
  write
}
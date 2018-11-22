import * as fs from 'fs'
import * as http from 'http'
import * as path from 'path'
import * as urlLib from 'url'

const PORT: number = 8080

export const startServer = function () {
  const server = http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
    const { url } = req
    const pwd = process.cwd()
    const filePath = path.join(pwd, url!)

    fs.exists(filePath, (exists) => {
      const responseTypes = {
        html: { 'Content-Type': 'text/html' },
        plain: { 'Content-Type': 'text/plain' },
      }

      res.writeHead(200, responseTypes.html)

      if (exists) {
        let data: string = `<div>${filePath}</div>`

        fs.lstat(filePath, (err: NodeJS.ErrnoException, stats: fs.Stats) => {
          if (err) {
            res.writeHead(200, responseTypes.plain)
            res.end(err.message)
          }

          if (stats.isDirectory()) {
            fs.readdir(filePath, (errIsDir: NodeJS.ErrnoException, files: string[]) => {
              if (errIsDir) {
                res.writeHead(200, responseTypes.plain)
                res.end(err.message)
              }

              if (files.length === 0) {
                data += `<div>There are no files in this directory</div>`
              }

              let fileString = ''

              files.map((file) => {
                fileString +=
                  `<li><a href="${urlLib.resolve(`http://localhost:${PORT}`, path.join(url!, file))}">${file}</a></li>`
              })

              data += `
                <ul>
                ${fileString}
                </ul>
                <a href="http://localhost:${PORT}">Home</a>
              `

              res.end(data)
            })
          } else if (stats.isFile()) {
            fs.readFile(filePath, (errIsFile: NodeJS.ErrnoException, content: Buffer) => {
              if (errIsFile) {
                res.writeHead(200, responseTypes.plain)
                res.end(err.message)
              }

              data += `
                <p>
                ${content.toString().replace(/(?:\r\n|\r|\n)/g, '<br>')}
                </p>
                <a href="http://localhost:${PORT}">Home</a>
              `

              res.end(data)
            })
          }
        })
      } else {
        res.writeHead(404, responseTypes.plain)
        res.end('File or directory not found')
      }
    })
  }).listen(PORT)

  server.on('close', () => {
    console.log(`Server shut down`)
  })

  console.log(`Server running on localhost:${PORT}`)
}
<template>
  <v-app>
    <v-system-bar v-if="process.platform == 'win32'" app window style="-webkit-app-region: drag;" class="deep-purple elevation-4">
      <img @click.left="reload()" src="./assets/logo.png" height="18" style="margin-right: 4px;">
      <span style="margin-right: 4px">Relay Management Conosle</span>
      <v-spacer></v-spacer>
      <div style="-webkit-app-region: no-drag;" class="mr-n2">
        <v-icon @click="minimize()" v-ripple class="appbar-icon">mdi-minus</v-icon>
        <v-icon @click="maximized ? unmaximize() : maximize()" v-ripple class="appbar-icon">mdi-crop-square</v-icon>
        <v-icon @click="shutdown_confirm = true" v-ripple class="appbar-icon">mdi-close</v-icon>
      </div>
    </v-system-bar>

    <v-system-bar v-if="process.platform == 'darwin'" app window style="-webkit-app-region: drag;" height="38" class="deep-purple elevation-4">
      <img @click.left="reload()" src="./assets/logo.png" height="18" style="margin: 2px 4px 0px 70px;">
      <span style="margin-right: 4px">Relay Management Conosle</span>
    </v-system-bar>

		<v-content>
			<v-container fluid class="py-0">
        <v-row>
          <v-col cols="12" sm="3" class="py-6 pl-6">
            <v-row>
              <v-col class="pt-0" cols="12" sm="12">
                <v-card class="fill-height">
                  <v-card-text>
                    <p>Status:<span :class="{ 'ml-12 title font-weight-bold': true, 'red--text': !$root.data.status, 'green--text': $root.data.status }">{{ $root.data.status ? 'Online' : 'Offline' }}</span></p>
                    <v-text-field :disabled="$root.data.status" @change="$saveData()" label="Host IP Address" v-model="$root.data.ip"></v-text-field>
                    <v-text-field :disabled="$root.data.status" @change="$saveData()" label="Host Port" v-model="$root.data.port"></v-text-field>
                    <v-text-field :disabled="$root.data.status" @change="$saveData()" label="File Path" v-model="$root.data.path"></v-text-field>
                    <v-switch color="blue lighten-2" class="mt-0" @change="$saveData()" label="Auto Start" @click.prevent="toggleAutoLaunch()" v-model="$root.data.auto_start"></v-switch>
                    <p class="mb-1" v-if="$root.data.status">To edit server settings, stop the server.</p>
                    <p class="mb-1" v-if="!$root.data.status">To start the server, click Start.</p>
                    <v-row>
                      <v-col sm="4" style="padding-right: 6px;"><v-btn text block color="blue" @click="openRelayDir()">Open Path</v-btn></v-col>
                      <v-col sm="4" style="padding-right: 6px;"><v-btn text block color="indigo lighten-1" @click="openURL()">Open URL</v-btn></v-col>
                      <v-col sm="4" style="padding-left: 6px;"><v-btn text block color="red" @click="history = []">Clear</v-btn></v-col>
                    </v-row>
                    <v-btn block @click="$root.data.status ? stopServer() : startServer()" :color="$root.data.status ? 'red' : 'green'">{{ $root.data.status ? 'Stop' : 'Start' }}</v-btn>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" sm="12">
                <v-list nav dense class="elevation-3 fill-height">
                  <v-list-item-group mandatory v-model="tab">
                    <v-list-item value="console">
                      <v-list-item-icon><v-icon>mdi-console-line</v-icon></v-list-item-icon>
                      <v-list-item-title>Console</v-list-item-title>
                    </v-list-item>

                    <v-list-item value="explorer">
                      <v-list-item-icon><v-icon>mdi-folder</v-icon></v-list-item-icon>
                      <v-list-item-title>Explorer</v-list-item-title>
                    </v-list-item>

                    <v-list-item value="editor">
                      <v-list-item-icon><v-icon>mdi-pencil</v-icon></v-list-item-icon>
                      <v-list-item-title>Editor</v-list-item-title>
                    </v-list-item>
                  </v-list-item-group>
                </v-list>
              </v-col>
            </v-row>
          </v-col>

          <v-col cols="12" sm="9" class="py-6 pr-6">
            <v-card class="fill-height" style="height: calc( 100vh - 90px )">
              <v-card-text v-if="tab === 'console'" style="font-family: 'Roboto Mono';">
                <div v-for="(item, index) in history" :key="index">
                  <p v-html="item"></p>
                </div>
              </v-card-text>

              <v-card-text v-if="tab === 'editor'" @mouseover.self="hover_route = []" class="fill-height">
                <p>In order for any changes to take effect, click the Run button in the bottom right.</p>
                <!-- <v-list nav @mouseover.self="hover_route = []">
                  <v-list-item @mouseover="hover_route = route" v-for="(route, index) in $root.data.functions" :key="index">
                    <v-list-item-icon><v-icon>mdi-{{ route.type }}</v-icon></v-list-item-icon>
                    <v-list-item-title>
                      <v-container class="pa-0" fluid>
                        <v-row>
                          <v-col sm="3"><v-select background-color="grey darken-2" :items="route_type_options" label="Type" solo v-model="route.req"></v-select></v-col>
                          <v-col sm="3"><v-text-field solo background-color="grey darken-2" @change="$saveData()" label="Route" type="text" v-model="route.route"></v-text-field></v-col>
                          <v-col sm="3"><v-text-field solo background-color="grey darken-2" @change="$saveData()" label="Path" type="text" v-model="route.path"></v-text-field></v-col>

                          <v-col sm="2" class="text-right">
                            <v-btn @click="deleteRoute(index)" color="grey" x-small icon v-if="hover_route == route"><v-icon>mdi-close</v-icon></v-btn>
                          </v-col>
                        </v-row>
                      </v-container>
                    </v-list-item-title>
                  </v-list-item>
                </v-list>

                <v-speed-dial v-model="route_add_button" absolute fab bottom right direction="top">
                  <template v-slot:activator>
                    <v-btn v-model="route_add_button" color="blue darken-2" fab>
                      <v-icon v-if="route_add_button">mdi-close</v-icon>
                      <v-icon v-else>mdi-plus</v-icon>
                    </v-btn>
                  </template>
                  <v-btn @click="$root.data.functions.push({ req: '', type: 'folder', route: '', path: '' })" fab small color="green"><v-icon>mdi-folder</v-icon></v-btn>
                  <v-btn @click="$root.data.functions.push({ req: '', type: 'file', route: '', path: '' })" fab small color="indigo"><v-icon>mdi-file</v-icon></v-btn>
                </v-speed-dial>

                <p style="position: relative; bottom: 0px; padding: 12px;">For any changes to take effect, you must restart your server.</p> -->

                <textarea @keypress.tab.prevent style="resize: none; width: 100%; height: 100%; outline: none; font-family: 'Roboto Mono'; color: white;" id="scriptbox" v-model="$root.data.script" placeholder="JavaScript"></textarea>
                <v-btn color="green" fab absolute bottom right @click="executeScript()"><v-icon>mdi-play</v-icon></v-btn>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
		</v-content>

    <v-dialog v-model="shutdown_confirm" max-width="350">
      <v-card>
        <v-card-title>
          <span style="margin: auto;" class="red--text text--lighten-1 font-weight-bold text-uppercase">Confirm Shutdown</span>
        </v-card-title>

        <v-card-text style="text-align: center;">Closing the Relay Management Console will stop the server instance. Are you sure you want to continue?</v-card-text>

        <v-card-actions>
          <v-btn text color="green" @click="shutdown_confirm = false">Cancel</v-btn>
          <v-spacer></v-spacer>
          <v-btn text color="red" @click="close()">Confirm</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
import electron from 'electron'
import cors_proxy from 'cors-anywhere'
import { shell } from 'electron'
import path from 'path'
import fs from 'fs'
import recursive from 'recursive-readdir'
import ip from 'ip'
import express from 'express'
import formidable from 'formidable'
import cors from 'cors'
const mongoose = require('mongoose')
import session from 'express-session'
import passport from 'passport'
import bodyParser from 'body-parser'
// import AutoLaunch from 'auto-launch'

const remote = require('electron').remote

var app = express()
var server = null

export default {
	name: 'app',
	data() {
		return {
			win: remote.getCurrentWindow(),
      maximized: remote.getCurrentWindow().isMaximized(),
      history: [],
      files: [],
      shutdown_confirm: false,
      tab: 'console',
      process: process,
      hover_route: [],
      route_type_options: ['GET', 'POST', 'DELETE'],
      route_add_button: false
      // auto_launch: new AutoLaunch({
      //   name: 'Relay Management Console',
      //   path: 'C:/Users/Aidan Liddy/Dev/paradigm/rmc/node_modules/electron/dist/electron.exe'
      // })
		}
	},
  methods: {
    reload() {
      this.win.reload()
    },
    close() {
      this.win.close()
    },
    maximize() {
      this.win.maximize()
      this.maximized = remote.getCurrentWindow().isMaximized()
    },
    unmaximize() {
      this.win.unmaximize()
      this.maximized = remote.getCurrentWindow().isMaximized()
    },
    minimize() {
      this.win.minimize()
    },
    openURL() {
      shell.openItem(`http://${this.$root.data.ip}:${this.$root.data.port}`)
    },
    openRelayDir() {
      shell.openItem(this.$root.data.path)
    },
    toggleAutoLaunch(input) {
      this.$root.data.auto_start = input
      // if (input === true) {
      //   this.auto_launch.enable()
      // } else {
      //   this.auto_launch.disable()
      // }
      // console.log(this.auto_launch.isEnabled())
    },
    consolelog(input) {
      this.history.push(input)
    },
    consoleerror(input) {
      this.history.push(`<span class="red--text">${input}</span>`)
    },
    deleteRoute(index) {
      this.$root.data.functions.splice(index, 1)
      this.$saveData()
    },
    executeScript() {
      this.consolelog('Restarting server...')
      server.close(() => {
        server = null
        app = null
        this.startServer()
      })
    },
    stopServer() {
      server.close(() => {
        this.$root.data.status = false
        server = null
        this.consolelog('Server stopped!')
        app = null
      })
    },
    startServer() {
      server = null
      app = express()
      this.consolelog('Server starting...')
      this.$root.data.status = true
      this.$saveData()

      const port = parseInt(this.$root.data.port)
      const ip = this.$root.data.ip

      app.use(cors())
      this.consolelog('Initializing CORS')

      app.use(bodyParser.json())
      this.consolelog('Initializing body-parser')

      require('./server/config/passport')(passport)
      this.consolelog('Starting Passport with config')

      app.use(express.urlencoded({ extended: true }))

      app.use(passport.initialize())
      this.consolelog('Initializing Passport')

      app.use(
        session({
          secret: 'secret',
          resave: true,
          saveUninitialized: true
        })
      )

      mongoose.promise = global.Promise

      cors_proxy.createServer({
        originWhitelist: [],
        requireHeader: ['origin', 'x-requested-with'],
        removeHeaders: ['cookie', 'cookie2']
      }).listen(parseInt(port + 1), ip, () => {
        this.consolelog(`CORS Anywhere listening on http://${ip}:${port + 1}`)
      })

      const data = {
        ip: this.$root.data.ip,
        port: this.$root.data.port,
        path: this.$root.data.path
      }

      app.use('/users', require('./server/routes/users.js'))
      app.use('/flamechat', require('./server/routes/flamechat.js'))
      app.use('/paradox', require('./server/routes/paradox.js'))

      // ROVER
      app.use('/rover', express.static(this.$root.data.path + '/rover/dist'))

      // RELAY
      app.use('/', express.static(`${this.$root.data.path}/relay`))
      app.get('/relay/list/:path', (req, res) => {
        var dir = `${this.$root.data.path}/relay/${req.params.path}`

        fs.readdir(dir, (error, files) => {
          if (error) this.consoleerror(error)
          else {
            res.json(files)
            this.consolelog(`RELAY -- List: ${req.params.path}`)
          }
        })
      })

      // DRAWER
      app.get('/files/:username', (req, res) => {
        var dir = path.join(this.$root.data.path + '/drawer/' + req.params.username)
        if (fs.existsSync(dir)) {
          fs.readdir(dir, (error, filenames) => {
            if (error) {
              this.consoleerror(error)
            } else {
              res.json(filenames)
              this.consolelog(`DRAWER -- Sent: ${req.params.username}/file list`)
            }
          })
        } else {
          fs.mkdirSync(dir)
          this.consolelog(`DRAWER -- Created: ${req.params.username}`)
        }
      })
      app.get('/download/:username/:path', (req, res) => {
        res.download(path.join(this.$root.data.path + '/drawer/' + req.params.username + '/' + req.params.path))
        this.consolelog(`DRAWER -- Downloaded: ${req.params.username}/${req.params.path}`)
      })
      app.delete('/file/:username/:path', (req, res) => {
        fs.unlink(path.join(this.$root.data.path + '/drawer/' + req.params.username + '/' + req.params.path), error => {
          if (error) {
            throw error
          }
          this.consolelog(`DRAWER -- Deleted: ${req.params.username}/${req.params.path}`)
        })
      })
      app.post('/upload/:username', (req, res) => {
        var form = new formidable.IncomingForm()

        form.parse(req)

        form.on('fileBegin', (name, file) => {
          file.path = this.$root.data.path + '/drawer/' + req.params.username + '/' + file.name
        })

        form.on('file', (name, file) => {
          this.consolelog(`DRAWER -- Uploaded: ${req.params.username}/${file.name}`)
        })
      })

      // OTHER
      app.get('/terminal', (req, res) => {
        fs.readFile(`${this.$root.data.path}/relay/terminal.html`, (error, data) => {
          res.write(data)
        })
      })
      app.get('/terms', (req, res) => {
        fs.readFile(`${this.$root.data.path}/relay/terms.html`, (error, data) => {
          res.write(data)
        })
      })

      mongoose.connect('mongodb://localhost:27017/paradigm', { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
        this.consolelog('MongoDB server connected')
        server = app.listen(port, ip, () => {
          this.consolelog('Server started!')
          this.consolelog(`Ready! Listening at http://${ip}:${port}`)
        })
      }).catch(error => this.consoleerror(error))
    }
  },
  created() {
    server = null
    const userDataPath = (electron.app || electron.remote.app).getPath('userData')
    var pathway = path.join(userDataPath, 'config.json')

    console.log(userDataPath)

    this.$root.data = parseDataFile(pathway)
    this.$root.data.status = false

    if (this.$root.data.auto_start === true) {
      // this.auto_launch.enable()
      this.consolelog('The server is automatically starting...')
      this.startServer()
      this.$root.data.status = true
    } else {
      // this.auto_launch.disable()
    }

    // console.log(this.auto_launch.isEnabled())

    function parseDataFile(filePath) {
      try {
        var data = JSON.parse(fs.readFileSync(filePath))
        return data
      } catch(error) {
        this.consolelog('Configuration file not found', error)
        fs.writeFileSync(filePath, JSON.stringify({
          status: false,
          ip: ip.address(),
          port: 80,
          auto_start: true,
          path: '',
          functions: [],
          script: ''
        }))
        return {
          status: false,
          ip: ip.address(),
          port: 80,
          auto_start: true,
          path: '',
          functions: [],
          script: ''
        }
      }
    }

    // fs.readdir(this.$root.data.path, { withFileTypes: true }, (error, filenames) => {
    //   if (error) {
    //     this.consoleerror(error)
    //   } else {
    //     var file_list = []
    //     filenames.forEach(file => {
    //       this.consolelog(file)
    //       switch (file.isDirectory()) {
    //         case false:
    //           file_list.push({
    //             name: file.name,
    //             folder: false
    //           })
    //           break
    //         case true:
    //           file_list.push({
    //             name: file.name,
    //             folder: true,
    //             children: [
    //               { name: 'this is a folder' }
    //             ]
    //           })
    //       }
    //     })
    //     this.files = file_list
    //   }
    // }).catch(error => this.consolerror(error))

    // recursive(this.$root.data.path, [ 'node_modules', 'rover' ]).then(files => {
    //   files.forEach(file => {
    //     fs.readFile(file, (err, data) => {
    //       this.consolelog(file, data)
    //     })
    //   })
      // var file_list = []
      // files.forEach(file => {
      //   var info = {
      //     full_path: file,
      //     path: file.slice(this.$root.data.path.length),
      //     full_name: file.slice(file.lastIndexOf('\\') + 1),
      //     name: file.slice(file.lastIndexOf('\\') + 1, file.lastIndexOf('.')),
      //     type: file.slice(file.lastIndexOf('.') + 1)
      //   }
      //   file_list.push(info)
      // })
      // this.files = file_list
    // })
  }
}
</script>

<style>
/* Scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track { background: rgb(33, 33, 33); }
::-webkit-scrollbar-thumb { background: rgb(100, 100, 100); }
::-webkit-scrollbar-thumb:hover { background: rgb(60, 60, 60); }
::-webkit-scrollbar-corner { background: rgb(33, 33, 33); }

html {
  overflow-y: auto !important;
	-webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.appbar-icon { border-radius: 100px; }

.centralize {
  margin: 0;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
	text-align: center;
}
</style>
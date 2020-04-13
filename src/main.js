import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'

import axios from 'axios'
import electron from 'electron'
import path from 'path'
import fs from 'fs'

Vue.config.productionTip = false

Vue.prototype.$http = axios

Vue.mixin({
  methods: {
    $saveData() {
      const userDataPath = (electron.app || electron.remote.app).getPath('userData')
      var pathway = path.join(userDataPath, 'config.json')
    
      fs.writeFileSync(pathway, JSON.stringify(this.$root.data))
    }
  }
})

new Vue({
  vuetify,
  render: h => h(App),
  data() {
    return {
      data: {
        status: false,
        ip: '',
        port: '',
        path: '',
        functions: [
          { type: 'GET' }
        ],
        auto_start: true,
        script: ''
      }
    }
  }
}).$mount('#app')

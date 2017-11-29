import Vue from 'vue'
import { Alert, Form, FormItem, Input, Button } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/ja'
import App from '@/App.vue'

Vue.use(Alert, { locale })
Vue.use(Form, { locale })
Vue.use(FormItem, { locale })
Vue.use(Input, { locale })
Vue.use(Button, { locale })

new Vue({
  el: '#app',
  render: h => h(App)
})

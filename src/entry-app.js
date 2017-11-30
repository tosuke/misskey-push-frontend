import Vue from 'vue'
import { Col, Row, Alert, Form, FormItem, Input, Button } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/ja'
import App from '@/App.vue'

Vue.use(Col, { locale })
Vue.use(Row, { locale })
Vue.use(Alert, { locale })
Vue.use(Form, { locale })
Vue.use(FormItem, { locale })
Vue.use(Input, { locale })
Vue.use(Button, { locale })

new Vue({
  el: '#app',
  render: h => h(App)
})

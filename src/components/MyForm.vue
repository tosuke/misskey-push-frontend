<template>
  <div class="body">
    <el-alert
      v-if="error"
      :title="error.title"
      :description="error.description"
      type="error"
      show-icon
    />
    <el-form ref="form" :model="form" :rules="formRule" label-width="120px" size="medium">
      <el-form-item label="アカウント名" prop="username">
        <el-input type="text" v-model="form.username"/>
      </el-form-item>
      <el-form-item label="パスワード" prop="password">
        <el-input type="password" v-model="form.password"/>
      </el-form-item>
      <el-form-item>
        <el-row type="flex" :gutter="2">
          <el-col>
            <el-button type="primary" :loading="!subscribed && loading" :disabled="subscribed" @click="doSubscribe()">
              購読する
            </el-button>
          </el-col>
          <el-col>
            <el-button type="primary" :loading="subscribed && loading" :disabled="!subscribed" @click="doUnsubscribe()">
              購読を解除する
            </el-button>
          </el-col>
        </el-row>
      </el-form-item>
      <el-form-item>
      </el-form-item>
    </el-form>
  </div>  
</template>

<script>
import subscribe from '@/lib/subscribe'
import unsubscribe from '@/lib/unsubscribe'

const SUBSCRIPTION_ID = 'subscription-id'
export default {
  data() {
    const subscribed = localStorage.getItem(SUBSCRIPTION_ID) !== null
    return {
      form: {
        username: '',
        password: '',
      },
      formRule: {
        username: [
          { required: true, message: 'アカウント名を入力してください。', trigger: 'blur' },
          { min: 3, message: 'アカウント名は3文字以上です。', trigger: 'change' },
          { pattern: /^[0-9A-Za-z\-]*$/, message: 'アカウント名は半角英数字、ハイフンのみです。', trigger: 'change'}
        ],
        password: [
          { required: true, message: 'パスワードを入力してください。', trigger: 'blur' },
          { min: 8, message: 'パスワードは8文字以上です。', trigger: 'change'}
        ]
      },
      loading: false,
      subscribed,
      error: null,
    }
  },
  methods: {
    async doSubscribe() {
      const { username, password } = this.form
      this.loading = true
      try {
        const id = await subscribe(username, password)
        localStorage.setItem(SUBSCRIPTION_ID, id)
        this.subscribed = true
      } catch(e) {
        console.error(e)
        this.processError(e)
      } finally {
        this.loading = false
      }
    },
    async doUnsubscribe() {
      const { username, password } = this.form
      this.loading = true
      try {
        const id = localStorage.getItem(SUBSCRIPTION_ID)
        await unsubscribe(username, password, id)
        localStorage.removeItem(SUBSCRIPTION_ID)
        this.subscribed = false
      } catch(e) {
        console.error(e)
        this.processError(e)
      } finally {
        this.loading = false
      }
    },
    processError(err) {
      const name = err.message
      switch(name) {
        case 'auth-failure':
          this.error = {
            title: '認証に失敗しました。',
            description: 'アカウント名やパスワードが間違っていないか確認してください。'
          }
          break
        case 'cannot-get-permission':
          this.error = {
            title: '通知の購読許可が得られませんでした。',
            description: 'ブラウザの通知設定を変更してください。'
          }
          break
        case 'cannot-use-webpush':
          this.error = {
            title: '通知を利用できる環境ではありません。',
            description: 'お使いのブラウザの対応状況を確認してください。'
          }
          break
        default:
          this.error = {
            title: '処理に失敗しました。'+name,
            description: ''
          }
          break
      }
    }
  },
}
</script>

<style scoped>
.body {
  padding: 1rem;
  margin: 1rem;
  margin-top: 1.2rem;
  background-color: #fff;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  max-width: 90%;
}
</style>



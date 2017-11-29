<template>
  <div class="body">
    <el-alert
      v-if="error"
      :title="error.title"
      :description="error.description"
      type="error"
      show-icon
    />
    <el-form ref="form" :model="form" label-width="100px" size="medium">
      <el-form-item label="アカウント名">
        <el-input type="text" v-model="form.username"/>
      </el-form-item>
      <el-form-item label="パスワード">
        <el-input type="password" v-model="form.password"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="!subscribed && loading" :disabled="subscribed" @click="doSubscribe()">
          購読する
        </el-button>
        <el-button type="primary" :loading="subscribed && loading" :disabled="!subscribed" @click="doUnsubscribe()">
          購読を解除する
        </el-button>
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
      loading: false,
      subscribed,
      error: null,
    }
  },
  methods: {
    async doSubscribe() {
      const { username, password } = this.form
      console.log(username)
      console.log(password)
      this.loading = true
      try {
        const id = await subscribe(username, password)
        localStorage.setItem(SUBSCRIPTION_ID, id)
      } catch(e) {
        console.error(e)
      } finally {
        this.loading = false
        this.subscribed = true
      }
    },
    async doUnsubscribe() {
      const { username, password } = this.form
      console.log(username)
      console.log(password)
      this.loading = true
      try {
        const id = localStorage.getItem(SUBSCRIPTION_ID)
        await unsubscribe(username, password, id)
        localStorage.removeItem(SUBSCRIPTION_ID)
      } catch(e) {
        console.error(e)
      } finally {
        this.loading = false
        this.subscribed = false
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
}
</style>



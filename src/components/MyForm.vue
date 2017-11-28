<template>
  <div>
    <el-form :model="form" label-width="100px">
      <el-form-item label="アカウント名">
        <el-input type="text" v-model="form.username"/>
      </el-form-item>
      <el-form-item label="パスワード">
        <el-input type="password" v-model="form.password"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary">購読する</el-button>
      </el-form-item>
    </el-form>
  </div>  
</template>

<script>
export default {
  data() {
    return {
      form: {
        username: '',
        password: ''
      }
    }
  }
}
</script>

<style scoped>
div {
  padding: 15px;
  background-color: #fff;
  border-radius: 6px;
}
</style>



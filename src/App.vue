<template>
  <div id="app">
    <el-form ref="form" :model="form" label-width="120px">
      <el-form-item label="アカウント名">
        <el-input v-model="form.name"/>
      </el-form-item>
    </el-form>
  </div>  
</template>

<script>
export default {
  data() {
    return {
      form: {
        name: ''
      }
    }
  }
}
</script>


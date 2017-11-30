<template>
  <div id="app">
    <h1>Misskey Push</h1>
    <p>Misskeyの通知を購読するマン</p>
    <MyForm/>
    <footer>
      <div class="center">
        <p>&copy; 2017 <a href="https://github.com/Tosuke">@Tosuke</a></p>
        <p>Icons made by <a href="https://www.flaticon.com/authors/smashicons" title="Smashicons">Smashicons</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></p>
      </div>
    </footer>
  </div>  
</template>

<script>
import MyForm from '@/components/MyForm.vue'
export default {
  components: {
    MyForm
  },
}
</script>

<style src="./main.css"></style>
<style scoped>
h1,p {
  color: #fff;
}
h1 {
  margin: 0;
  font-weight: 200;
  font-size: 2rem;
}
p {
  font-weight: 300;
}
a {
  color: #fff;
  text-decoration: none;
}
a:hover {
  text-decoration: underline;
}
.center {
  text-align: center
}
</style>




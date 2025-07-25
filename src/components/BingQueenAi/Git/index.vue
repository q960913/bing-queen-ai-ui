<template>
  <div>
    <svg-icon icon-class="github" @click="goto" />
  </div>
</template>

<script>
export default {
  name: 'BingQueenAiGit',
  url: 'https://github.com/q960913/bing-queen-ai-proxy',
  data() {
    return {
    }
  },
  methods: {
    goto() {
      window.open(this.url)
    }
  }
}
</script>

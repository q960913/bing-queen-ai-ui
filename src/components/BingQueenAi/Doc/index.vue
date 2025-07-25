<template>
  <div>
    <svg-icon icon-class="question" @click="goto" />
  </div>
</template>

<script>
export default {
  name: 'BingQueenAiDoc',
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

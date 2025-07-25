<template>
  <div>
    <svg-icon icon-class="github" @click="goto" />
  </div>
</template>

<script>
export default {
  name: 'BingQueenAiGit',
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

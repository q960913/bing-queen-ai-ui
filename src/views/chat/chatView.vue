<template>
  <div class="app-container chat-page-container" :class="theme">
    <SessionPanel />
    <ChatWindow />
  </div>
</template>

<script>
import SessionPanel from './components/SessionPanel.vue'
import ChatWindow from './components/ChatWindow.vue'
import { mapState } from 'vuex'

export default {
  name: 'ChatView',
  components: { SessionPanel, ChatWindow },
  computed: {
    ...mapState('chat', ['theme'])
  },
  created() {
    // this.$store.dispatch('chat/fetchInitialData');
  }
}
</script>

<style lang="scss" scoped>
/* [核心] 定义颜色变量 */
.chat-page-container {
  /* --- 日间模式 (默认) --- */
  --bg-primary: #ffffff;
  --bg-secondary: #f5f7fa;
  --bg-tertiary: #f0f2f5;
  --border-color: #e6e6e6;
  --text-primary: #303133;
  --text-secondary: #606266;
  --brand-color: #409EFF;
  --brand-text-color: #ffffff;

  /* ... 其他布局样式 ... */
  height: calc(100vh - 84px);
  display: flex;
}

/* [核心] 当有 .dark 类时，覆盖上面的变量 */
.chat-page-container.dark {
  --bg-primary: #1a1b1e;
  --bg-secondary: #212529;
  --bg-tertiary: #343a40;
  --border-color: #343a40;
  --text-primary: #f8f9fa;
  --text-secondary: #adb5bd;
  --brand-color: #007bff;
  --brand-text-color: #ffffff;
}

/* ... 后面的所有 CSS ... */
/* --- 1. 顶层 Flexbox 布局 --- */

.chat-page-container {
  height: calc(100vh - 84px); /* 占满若依主内容区的高度，这是成功的关键！ */
  width: 100%;
}

/* [新增] 抽屉内部面板的样式 */
.drawer-session-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}


.session-topic {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-grow: 1; /* 占据主要空间 */
}


</style>

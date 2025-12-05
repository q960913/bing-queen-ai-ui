<template>
  <!-- [核心] 在根容器上动态绑定 is-fullscreen 类 -->
  <div class="app-container chat-page-container" :class="[{ 'is-fullscreen': isFocusMode }, theme, size]">

    <!-- [核心] 把 isFocusMode 和 @toggle 事件传递给子组件 -->
    <SessionPanel/>
    <ChatWindow :is-focus-mode="isFocusMode" @toggle-focus="toggleFocusMode" />
  </div>
</template>

<script>
import SessionPanel from './components/SessionPanel.vue'
import ChatWindow from './components/ChatWindow.vue'
import { mapState,mapActions } from 'vuex'

export default {
  name: 'ChatView',
  components: { SessionPanel, ChatWindow },
  computed: {
    // [核心] 从 app 模块中，订阅 size 状态
    ...mapState({
      size: state => state.app.size
    }),
    ...mapState('chat', ['theme','isFocusMode'])
  },
  created() {
    // this.$store.dispatch('chat/fetchInitialData');
  },
  methods: {
    // [核心] 从 Vuex 映射 actions
    ...mapActions('chat', [
      'toggleFocusMode'
    ])
  },}
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
/* src/views/chat/index.vue -> <style scoped> */

.chat-page-container.is-fullscreen {
  position: fixed; /* [核心] 使用固定定位 */
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2000; /* [核心] 确保层级足够高，能覆盖若依的 Header 和 Sidebar */

  /* [重要] 覆盖掉若依 .app-container 自带的 padding */
  padding: 0 !important;
}

/* 在全屏模式下，聊天区域需要重新计算高度 */
.is-fullscreen .chat-area {
  height: 100vh;
}
.is-fullscreen .chat-container-relative {
  height: 100vh;
}


</style>

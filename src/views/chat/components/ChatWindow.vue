<template>
  <!-- 3. 右侧聊天区域 -->
  <div class="chat-area">
    <!-- 我们之前调试好的、基于“绝对定位”的聊天窗口代码，原封不动地放在这里 -->
    <div class="chat-container-relative">
      <ChatHeader/>
      <MessageList/>
      <MessageInput/>


    </div>
  </div>
</template>

<script>
// import mapState, mapActions from vuex
import ChatHeader from "@/views/chat/components/ChatHeader.vue";
import MessageList from "@/views/chat/components/MessageList.vue";
import MessageInput from "@/views/chat/components/MessageInput.vue";

export default {
  components: {ChatHeader, MessageList, MessageInput},
  name: 'ChatWindow',
  data() {
    return {};
  },
  computed: {},

  // ... mapState('chat', ['sessions', 'activeSessionId']) ...


  methods: {}
}


</script>

<style lang="scss" scoped>
/* --- 3. 右侧聊天区域样式 --- */

.chat-area {
  flex-grow: 1; /* [核心] 右侧占据所有剩余的水平空间 */
  height: 100%;
  display: flex;
  width: 100%;
  background-color: var(--bg-primary);
}

/* --- 4. 聊天窗口内部 (绝对定位布局) --- */
/* 这部分是我们之前调试好的，保持不变 */

/* --- 4. 聊天窗口内部 (Flexbox 布局) --- */
.chat-container-relative {
  height: 100%;
  width: 100%;
  background-color: #ffffff;
  display: flex; /* [新增] */
  flex-direction: column; /* [新增] 垂直排列 */
  position: relative;
}


</style>

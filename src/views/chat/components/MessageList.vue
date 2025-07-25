<template>
  <!-- 聊天记录区 -->
  <el-main class="chat-main-area">
    <el-scrollbar ref="scrollbar">
      <div class="message-list">
        <!-- 加载更多 -->
        <div v-if="!noMore" class="load-more" @click="loadMoreMessages">
          {{ loading ? '加载中...' : '加载更多历史记录' }}
        </div>
        <div v-else class="no-more">没有更多消息了</div>

        <!-- 消息循环 -->
        <div
          v-for="msg in currentMessages"
          :key="msg.id"
          class="message-item-wrapper"
          :class="msg.role === 'user' ? 'user-message' : 'ai-message'"
        >
          <el-checkbox-group v-model="selectedMessagesProxy">
            <el-checkbox
              v-if="isSelectionMode"
              v-model="selectedMessagesProxy"
              :label="msg.id"
              class="message-checkbox"
            >
              <span></span>
            </el-checkbox>
          </el-checkbox-group>
          <el-avatar :src="msg.avatar" class="avatar"></el-avatar>


          <!-- 消息气泡 -->
          <div class="message-bubble">{{ msg.content }}</div>

          <!-- [新增] 悬浮的操作栏 -->
          <div class="message-actions-bar">
            <el-tooltip content="修改" placement="top">
              <el-button
                icon="el-icon-edit"
                size="mini"
                circle
                @click="editMessage(msg)"
              ></el-button>
            </el-tooltip>
            <el-tooltip content="截图" placement="top">
              <el-button
                icon="el-icon-camera"
                size="mini"
                circle
                @click="screenshotMessage(msg)"
              ></el-button>
            </el-tooltip>
            <el-tooltip content="导出" placement="top">
              <el-button
                icon="el-icon-download"
                size="mini"
                circle
                @click="exportMessage(msg)"
              ></el-button>
            </el-tooltip>
          </div>


        </div>
      </div>
    </el-scrollbar>
  </el-main>
</template>

<script>
import {mapGetters, mapState} from 'vuex'

export default {
  name: 'MessageList',
  data() {
    return {
      loading: false,
      noMore: false,
    }
  },
  computed: {
    ...mapGetters('chat', ['currentMessages']),
    ...mapState('chat', ['isSelectionMode','selectedMessages']),
    // [核心] 可写的计算属性，作为 v-model 的代理
    selectedMessagesProxy: {
      get() {
        return this.selectedMessages;
      },
      set(value) {
        this.$store.commit('chat/SET_SELECTED_MESSAGES', value);
      }
    }
  },
  mounted() {
  },
  methods: {
    exportMessage(message) {
      console.log('准备导出消息:', message);
      alert('导出功能待实现。可以将内容保存为 TXT 或 Markdown 文件。');
      // 伪代码:
      // const content = message.content;
      // const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      // const link = document.createElement('a');
      // link.href = URL.createObjectURL(blob);
      // link.download = `chat-message-${message.id}.txt`;
      // link.click();
      // URL.revokeObjectURL(link.href);
    },
    screenshotMessage(message) {
      // 这个功能需要用到第三方库，比如 html2canvas
      // npm install html2canvas
      console.log('准备截图消息:', message);
      alert('截图功能待实现。需要使用 html2canvas 库。');
      // 伪代码:
      // import html2canvas from 'html2canvas';
      // const bubbleElement = document.querySelector(`[data-message-id="${message.id}"] .message-bubble`);
      // html2canvas(bubbleElement).then(canvas => {
      //   const link = document.createElement('a');
      //   link.download = `chat-message-${message.id}.png`;
      //   link.href = canvas.toDataURL();
      //   link.click();
      // });
    },
    editMessage(message) {
      // 实际应用中，通常只允许修改用户自己发的消息
      console.log('准备修改消息:', message);
      this.$prompt('请输入新的内容', '修改消息', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: message.content, // 将原始内容填入
      }).then(({value}) => {
        // 假逻辑：更新前端数据
        message.content = value;
        this.$message.success('修改成功');
      }).catch(() => {
      });
    }
    , loadMoreMessages() {

    }
    // ... computed for currentMessages ...
    // ... methods for copyMessageContent, editMessage, etc. ...
    // ... mounted hook for scroll listener ...
  }
}
</script>

<style lang="scss" scoped>

.chat-main-area {
  flex-grow: 1; /* [新增] 占据所有剩余的垂直空间 */
  padding: 0;
  /* [关键] 需要让 el-scrollbar 知道该怎么撑开 */
  overflow: hidden;
  background-color: var(--bg-primary);
}

/* --- 5. 消息列表和气泡样式 --- */
/* 这部分也保持不变 */

.load-more, .no-more {
  text-align: center;
  color: #999;
  padding: 10px;
  font-size: 12px;
}

.load-more {
  cursor: pointer;
}

.message-item-wrapper {
  display: flex;
  margin-bottom: 20px;
  align-items: flex-end; /* [修改] 改为底部对齐，这样操作栏会和气泡底部在一条线上 */
}

/* [核心] 当鼠标悬停在【整行消息】上时，显示操作栏 */
.message-item-wrapper:hover .message-actions-bar {
  opacity: 1;
  visibility: visible;
}

.avatar {
  margin: 0 10px;
  flex-shrink: 0;
}

.message-bubble {
  padding: 10px 15px;
  border-radius: 15px;
  max-width: 70%;
  word-wrap: break-word;
  line-height: 1.5;
}

/* --- 聊天气泡样式 --- */
.ai-message .message-bubble {
  background-color: var(--bg-tertiary); /* 原来是 #f0f2f5 */
  color: var(--text-primary);
}

.user-message .message-bubble {
  background-color: var(--brand-color); /* 原来是 #409EFF */
  color: var(--brand-text-color);
}

/* [修改] 悬浮操作栏的样式 */
.message-actions-bar {
  display: flex;
  margin: 0 5px; /* [新增] 与气泡之间留出一点间距 */
  flex-shrink: 0; /* 防止被压缩 */

  /* 显隐逻辑 */
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease-in-out;
}


/* 用户消息的操作栏需要靠右对齐 */
.user-message .message-actions-bar {
  left: auto; /* 取消左侧定位 */
  right: 15px; /* 改为右侧定位 */
}
/* AI 消息 (默认) */
.ai-message {
  flex-direction: row; /* [默认] 头像在左，气泡在右 */
  justify-content: flex-start;
}

/* 用户消息 */
.user-message {
  /* [核心] 新增下面这一行代码！*/
  justify-content: flex-start;
  flex-direction: row-reverse; /* [修改] 翻转顺序，变为 操作栏, 气泡, 头像 */
}

/* 包含 .chat-main-area, .message-list, .message-bubble 等所有消息相关样式 */
</style>

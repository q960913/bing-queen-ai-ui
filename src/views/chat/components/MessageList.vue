<template>
  <!-- 聊天记录区 -->
  <el-main class="chat-main-area">
    <el-scrollbar ref="scrollbar">
      <div class="message-list" ref="messageContainer">
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


          <!-- ... 在 v-for 循环中 ... -->

          <div class="message-bubble">
            <!-- [核心修改] 使用 vue-markdown 组件 -->
            <vue-markdown :source="msg.content" class="markdown-body"></vue-markdown>
          </div>
          <!-- 在 v-for 循环中，AI 消息的部分 -->
          <div
            v-if="msg.totalVersions > 1"
            class="version-switcher"
          >
            <el-button
              icon="el-icon-arrow-left"
              size="mini"
              circle
              :disabled="msg.activeVersion === 1"
              @click="fetchVersion(msg, msg.activeVersion - 1)"
            ></el-button>

            <span style="   color: var(--text-primary);">{{ msg.activeVersion }} / {{ msg.totalVersions }}</span>

            <el-button
              icon="el-icon-arrow-right"
              size="mini"
              circle
              :disabled="msg.activeVersion === msg.totalVersions"
              @click="fetchVersion(msg, msg.activeVersion + 1)"
            ></el-button>
          </div>
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
            <el-tooltip content="删除" placement="top">
              <el-button
                icon="el-icon-delete"
                size="mini"
                circle
                @click="deleteMessage(msg)"
              ></el-button>
            </el-tooltip>
            <el-tooltip content="重新生成" placement="top">
              <el-button
                icon="el-icon-refresh"
                size="mini"
                circle
                @click="refreshMessage(msg)"
              ></el-button>
            </el-tooltip>
          </div>


        </div>
      </div>
    </el-scrollbar>
  </el-main>
</template>

<script>
import {mapGetters, mapState,mapMutations} from 'vuex'
// [核心修改] 导入 vue-markdown 组件
import VueMarkdown from 'vue-markdown';

export default {
  name: 'MessageList',
  // [核心修改] 注册新组件
  components: {
    VueMarkdown // 不再是 Vue2MarkdownIt
  },
  data() {
    return {
      loading: false,
      noMore: false,
    }
  },
  computed: {
    ...mapGetters('chat', ['currentMessages','activeSession']),
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
    refreshMessage(message) {
      console.log('准备重新生成消息:', message);
      alert('重新生成功能待实现');
    },
    deleteMessage(message) {
      console.log('准备删除消息:', message);
      alert('删除功能待实现');
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

    },
    // [核心] 映射一个 mutation
    ...mapMutations('chat', ['UPDATE_MESSAGE_CONTENT']),

    async fetchVersion(originalMessage, targetVersion) {
      try {
        // [核心] 显示一个加载状态，比如在气泡上覆盖一个 loading 图标
        // this.setLoadingState(originalMessage.id, true);

        // 调用我们新设计的后端 API
        // const response = await axios.get(`/api/chat/turn/${originalMessage.turnId}/version/${targetVersion}`);

        // --- 模拟后端返回 ---
        const fakeBackendResponse = {
          data: {
            id: originalMessage.id, // ID 保持不变
            content: `这是从后端获取的第 ${targetVersion} 版的新内容。`,
            activeVersion: targetVersion,
            // ... 其他可能更新的数据
          }
        };
        // --- 模拟结束 ---

        const newVersionData = fakeBackendResponse.data;

        // [核心] 调用 mutation 来更新 Vuex state 中的这条消息
        this.UPDATE_MESSAGE_CONTENT({
          sessionId: this.activeSession.sessionId,
          messageId: originalMessage.id,
          newData: newVersionData
        });

      } catch (error) {
        console.error("获取历史版本失败:", error);
        this.$message.error("加载版本失败！");
      } finally {
        // 取消加载状态
        // this.setLoadingState(originalMessage.id, false);
      }
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
  position: relative; /* 或者 display: flex; 也可以 */
}

/*
  [核心修复 2] 让 el-scrollbar 充满它的父容器 el-main
  我们可能需要用 ::v-deep 来确保能选中 el-scrollbar 的根元素
*/
::v-deep .el-scrollbar {
  height: 100%;
}
/*
  [核心修复 3] el-scrollbar 内部的 wrap 容器也需要设置高度。
  Element UI 通常会自动处理，但如果不行，我们需要手动强制它。
*/
::v-deep .el-scrollbar__wrap {
  overflow-x: hidden; /* 隐藏水平滚动条，防止意外出现 */
  height: 100%; /* [重要] 确保滚动容器也有 100% 的高度 */
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
  max-width: 60%;
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
/* --- 尺寸响应式样式 --- */

/* 默认 (medium) 尺寸下的字体大小 */
.message-bubble {
  font-size: 14px;
}


/* 当父容器有 .small class 时 */
.small .message-bubble {
  font-size: 13px;
}


/* 当父容器有 .mini class 时 */
.mini .message-bubble {
  font-size: 12px;
}

/* 包含 .chat-main-area, .message-list, .message-bubble 等所有消息相关样式 */
</style>

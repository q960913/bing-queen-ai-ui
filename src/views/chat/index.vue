<template>
  <!-- 1. 根容器，我们将用 flexbox 来布局它 -->
  <div class="chat-page-container">

    <!-- 2. 左侧会话面板 -->
    <div class="session-panel">
      <div class="session-header">
        <h3>历史会话</h3>
        <el-button
          type="primary"
          icon="el-icon-plus"
          circle
          size="mini"
          @click="createNewSession"
        ></el-button>
      </div>
      <el-scrollbar class="session-list-scrollbar">
        <div
          v-for="session in sessions"
          :key="session.sessionId"
          class="session-item"
          :class="{ 'active': session.sessionId === activeSessionId }"
          @click="switchSession(session.sessionId)"
        >
          {{ session.topic }}
        </div>
      </el-scrollbar>
    </div>

    <!-- 3. 右侧聊天区域 -->
    <div class="chat-area">
      <!-- 我们之前调试好的、基于“绝对定位”的聊天窗口代码，原封不动地放在这里 -->
      <div class="chat-container-relative">
        <el-header class="chat-header">
          <!-- 显示标题的区域 -->
          <div v-if="!isEditingTopic" class="topic-display" @click="startEditTopic">
            <span>{{ activeSession.topic }}</span>
            <i class="el-icon-edit-outline" style="margin-left: 10px; cursor: pointer;"></i>
          </div>

          <!-- 编辑标题的输入框 -->
          <el-input
            v-else
            v-model="currentTopicInput"
            size="mini"
            @blur="saveTopic"
            @keyup.enter.native="saveTopic"
            ref="topicInput"
          ></el-input>
        </el-header>
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
                <el-avatar v-if="msg.role === 'ai'" :src="msg.avatar" class="avatar"></el-avatar>
                <div class="message-bubble">{{ msg.content }}</div>
                <el-avatar v-if="msg.role === 'user'" :src="msg.avatar" class="avatar"></el-avatar>
              </div>
            </div>
          </el-scrollbar>
        </el-main>

        <!-- 输入框区 -->
        <el-footer class="chat-footer-area">
          <el-input
            v-model="userInput"
            placeholder="请输入消息..."
            @keyup.enter.native="sendMessage"
          >
            <el-button
              slot="append"
              icon="el-icon-s-promotion"
              @click="sendMessage"
            ></el-button>
          </el-input>
        </el-footer>

      </div>
    </div>

  </div>
</template>
<script>
export default {
  mounted() {
    // 假设你在这里加载了第一页数据
    // this.loadMoreMessages().then(() => {
    //   this.scrollToBottom(); // 数据加载完成后滚动到底部
    // });

    // 对于假数据，直接调用
    this.scrollToBottom();

    // ... 监听滚动的代码 ...
  },
  // ... data() ...
  computed: {
    // 计算当前活跃会话的详细信息
    activeSession() {
      return this.sessions.find(s => s.sessionId === this.activeSessionId) || {};
    },
    // 计算当前应该显示的消息列表
    currentMessages() {
      return this.allMessages[this.activeSessionId] || [];
    }
  },
  name: 'Chat', // 给组件起个名字是个好习惯
  data() {
    return {
      // 这里将存放从后端获取的动态数据
      // 在 data() 中
      // --- 假数据 ---
      noMore: false,
      loading: false,
      // 1. 会话列表 (用于渲染左侧菜单)
      sessions: [
        { sessionId: 'session-1', topic: '关于若依部署的讨论' },
        { sessionId: 'session-2', topic: '如何学习 Swift' },
        { sessionId: 'session-3', topic: '夏天的诗' },
      ],

      // 2. 当前活跃的会话ID
      activeSessionId: 'session-1',

      // 3. 所有会话的消息 (用一个对象来存，方便查找)
      allMessages: {
        'session-1': [
          { id: 1, role: 'ai', content: '若依部署有什么问题吗？', avatar: '...' },
          { id: 2, role: 'user', content: '我想把它部署到 Vercel。', avatar: '...' },
        ],
        'session-2': [
          { id: 3, role: 'ai', content: '学习 Swift 最好的方法是用 Playgrounds！', avatar: '...' },
        ],
        'session-3': [
          { id: 4, role: 'user', content: '给我写一首关于夏天的诗。', avatar: '...' },
          { id: 5, role: 'ai', content: '骄阳似火照，蝉鸣声声高。', avatar: '...' },
        ],
      },
      // --- 界面状态 ---
      userInput: '',
      isEditingTopic: false, // 是否正在编辑标题
      currentTopicInput: '', // 编辑标题时的临时输入
    };
  },
  methods: {
    loadMoreMessages(){

    },
    // 切换会话
    switchSession(sessionId) {
      this.activeSessionId = sessionId;
    },

    // 创建新会话 (假)
    createNewSession() {
      const newId = 'session-' + Date.now();
      // 1. 在 sessions 列表前面加一条
      this.sessions.unshift({ sessionId: newId, topic: '新的聊天' });
      // 2. 在 allMessages 里为空会话创建空数组
      this.$set(this.allMessages, newId, []);
      // 3. 切换到这个新会话
      this.activeSessionId = newId;
    },


    // 开始编辑标题
    startEditTopic() {
      console.log("startEditTopic 方法被调用了！");
      this.currentTopicInput = this.activeSession.topic;
      this.isEditingTopic = true;
      // 让输入框自动聚焦
      this.$nextTick(() => {
        this.$refs.topicInput.focus();
      });
    },

    // 保存标题 (假)
    saveTopic() {
      // 找到当前 session 并修改它的 topic
      const session = this.sessions.find(s => s.sessionId === this.activeSessionId);
      if (session) {
        session.topic = this.currentTopicInput;
      }
      this.isEditingTopic = false;
    },
    scrollToBottom() {
      // 使用 $nextTick 确保 DOM 已经更新完毕
      this.$nextTick(() => {
        const scrollbar = this.$refs.scrollbar;
        if (scrollbar) {
          // el-scrollbar 的 wrap 元素是真正滚动的容器
          const wrap = scrollbar.wrap;
          // 将 scrollTop 设置为 scrollHeight，就能滚动到底部
          wrap.scrollTop = wrap.scrollHeight;
        }
      });
    },

    // [修改] 在 sendMessage 方法的末尾调用它
    sendMessage() {
      if (!this.userInput.trim()) return;

      this.allMessages[this.activeSessionId].push({
        id: Date.now(),
        role: 'user',
        content: this.userInput,
        avatar: '...'
      });
      this.userInput = '';
      this.scrollToBottom(); // 发送后立即滚动

      setTimeout(() => {
        this.allMessages[this.activeSessionId].push({
          id: Date.now() + 1,
          role: 'ai',
          content: '这是模拟回复。',
          avatar: '...'
        });
        this.scrollToBottom(); // 接收到回复后再次滚动
      }, 1000);
    }
  }
};
</script>

<style scoped>
/* --- 1. 顶层 Flexbox 布局 --- */

.chat-page-container {
  display: flex; /* 启用 Flexbox */
  height: calc(100vh - 84px); /* 占满若依主内容区的高度，这是成功的关键！ */
  width: 100%;
}

/* --- 2. 左侧会话面板样式 --- */

.session-panel {
  flex-basis: 280px; /* 左侧固定宽度为 280px */
  flex-shrink: 0; /* 防止面板被压缩 */
  height: 100%;
  background-color: #f5f7fa;
  border-right: 1px solid #e6e6e6;
  display: flex;
  flex-direction: column; /* 内部也使用 flex 垂直布局 */
}

.session-header {
  padding: 15px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.session-header h3 {
  margin: 0;
  font-size: 16px;
}

.session-list-scrollbar {
  flex-grow: 1; /* 占满剩余的垂直空间 */
  height: 100%;
}

.session-item {
  padding: 15px 20px;
  cursor: pointer;
  border-bottom: 1px solid #e4e7ed;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.session-item:hover {
  background-color: #ecf5ff;
}
.session-item.active {
  background-color: #d9ecff;
  font-weight: bold;
}

/* --- 3. 右侧聊天区域样式 --- */

.chat-area {
  flex-grow: 1; /* [核心] 右侧占据所有剩余的水平空间 */
  height: 100%;
  display: flex;
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
}

.chat-header {
  flex-shrink: 0; /* [新增] 防止被压缩 */
  height: 60px;
  line-height: 60px;
  padding: 0 20px;
  border-bottom: 1px solid #eee;
}

.chat-main-area {
  flex-grow: 1; /* [新增] 占据所有剩余的垂直空间 */
  padding: 0;
  /* [关键] 需要让 el-scrollbar 知道该怎么撑开 */
  overflow: hidden;
}

.chat-footer-area {
  flex-shrink: 0; /* [新增] 防止被压缩 */
  height: 60px;
  padding: 10px 20px;
  border-top: 1px solid #f0f0f0;
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
  align-items: flex-start;
  margin-bottom: 20px;
}
.ai-message {
  justify-content: flex-start;
}
.user-message {
  justify-content: flex-end;
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
.ai-message .message-bubble {
  background-color: #f0f2f5;
  color: #333;
}
.user-message .message-bubble {
  background-color: #409EFF;
  color: #fff;
}
</style>

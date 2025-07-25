<template>
  <!-- 1. 根容器，我们将用 flexbox 来布局它 -->
  <div class="chat-page-container" :class="theme">
    <el-drawer
      title="历史会话"
      :visible.sync="drawerVisible"
      direction="ltr"
      :with-header="true"
      size="300px">
    <!-- 2. 左侧会话面板 -->
    <div class="session-panel">
      <div class="session-header">
        <el-button
          type="primary"
          icon="el-icon-plus"
          circle
          size="mini"
          @click="createNewSession"
        ></el-button>
        <!-- [新增] 主题切换按钮 -->
        <el-button
          :icon="theme === 'light' ? 'el-icon-moon' : 'el-icon-sunny'"
          circle size="mini"
          @click="toggleTheme"
          style="margin-left: 10px;"
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
          <span class="session-topic">{{ session.topic }}</span>
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            circle
            plain
            class="delete-session-btn"
            @click.stop="deleteSession(session)"
          ></el-button>
        </div>
      </el-scrollbar>
    </div>
      <!-- [移动] 把原来的 session-panel 内容（除了 header）都放进来 -->
      <div class="drawer-session-panel">
        <el-scrollbar class="session-list-scrollbar">
          <div
            v-for="session in sessions"
            :key="session.sessionId"
            class="session-item"
            :class="{ 'active': session.sessionId === activeSessionId }"
            @click="switchSession(session.sessionId)"
          >
            <span class="session-topic">{{ session.topic }}</span>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              circle
              plain
              class="delete-session-btn"
              @click.stop="deleteSession(session)"
            ></el-button>
          </div>
        </el-scrollbar>
      </div>

    </el-drawer>
    <!-- 3. 右侧聊天区域 -->
    <div class="chat-area">
      <!-- 我们之前调试好的、基于“绝对定位”的聊天窗口代码，原封不动地放在这里 -->
      <div class="chat-container-relative">
        <el-header class="chat-header">
          <el-button
            icon="el-icon-s-operation"
            circle
            @click="drawerVisible = true"
            style="margin-right: 15px;"
          ></el-button>
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
          <el-button size="mini" @click="toggleSelectionMode">
            {{ isSelectionMode ? '取消多选' : '多选' }}
          </el-button>
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
                <el-checkbox-group v-model="selectedMessages">
                <el-checkbox
                  v-if="isSelectionMode"
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

        <!-- 输入框区 -->
        <el-footer class="chat-footer-area" :style="{ height: filesToUpload.length > 0 ? 'auto' : '60px' }">
          <!-- 条件一：如果不在选择模式 -->
          <template v-if="!isSelectionMode">
          <!-- [新] 文件预览区域 (移到输入框上方) -->
          <div v-if="filesToUpload.length > 0" class="file-preview-area">
            <el-tag
              v-for="(file, index) in filesToUpload"
              :key="index"
              closable
              @close="removeFile(index)"
            >
              <i :class="fileIcon(file.type)"></i> {{ file.name }}
            </el-tag>
          </div>

          <!-- 输入框和按钮的容器 -->
          <div class="input-container">

            <!-- [核心修改] 使用 Popover 整合所有上传方式 -->
            <el-popover
              placement="top"
              width="auto"
              trigger="click"
              popper-class="upload-popper"
            >
              <div class="upload-options-grid">
                <!-- 拍照 -->
                <el-upload action="#" :http-request="handleUpload" :show-file-list="false" accept="image/*" capture="camera">
                  <div class="option-item"><i class="el-icon-camera-solid"></i><span>拍照</span></div>
                </el-upload>
                <!-- 相册 -->
                <el-upload action="#" :http-request="handleUpload" :show-file-list="false" accept="image/*" :multiple="true">
                  <div class="option-item"><i class="el-icon-picture-outline"></i><span>相册</span></div>
                </el-upload>
                <!-- 文件 -->
                <el-upload action="#" :http-request="handleUpload" :show-file-list="false" :multiple="true">
                  <div class="option-item"><i class="el-icon-folder-opened"></i><span>文件</span></div>
                </el-upload>
                <!-- 录像 (可选) -->
                <el-upload action="#" :http-request="handleUpload" :show-file-list="false" accept="video/*" capture="camcorder">
                  <div class="option-item"><i class="el-icon-video-camera-solid"></i><span>录像</span></div>
                </el-upload>
                <!-- 录音 (可选) -->
                <el-upload action="#" :http-request="handleUpload" :show-file-list="false" accept="audio/*" capture="microphone">
                  <div class="option-item"><i class="el-icon-microphone"></i><span>录音</span></div>
                </el-upload>
              </div>

              <!-- 触发 Popover 的按钮 -->
              <template #reference>
                <el-button icon="el-icon-plus" circle class="upload-button"></el-button>
              </template>            </el-popover>

            <!-- 文本输入框 -->
            <el-input
              class="chat-input"
              v-model="userInput"
              placeholder="请输入消息..."
              @keyup.enter.native="sendMessage"
            ></el-input>

            <!-- 发送按钮 -->
            <el-button
              class="send-button"
              type="primary"
              icon="el-icon-s-promotion"
              @click="sendMessage"
            ></el-button>

          </div>
          </template>
          <!-- 条件二：如果在选择模式 -->
          <template v-else>
          <div  class="batch-actions-bar">
            <span>已选择 {{ selectedMessages.length }} 条消息</span>
            <div>
              <el-button size="small" @click="exportSelectedMessages">导出选中</el-button>
              <el-button size="small" @click="screenshotSelectedMessages">截图选中</el-button>
            </div>
          </div>
          </template>
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
      theme: 'light', // [核心 2] 新增主题状态
      isSelectionMode: false,
      drawerVisible: false, // [新增] 控制抽屉的显示和隐藏
      selectedMessages:[],
      // 这里将存放从后端获取的动态数据
      // 在 data() 中
      // --- 假数据 ---
      noMore: false,
      loading: false,
      filesToUpload: [], // 存储用户选择的文件对象
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
      messages: []
    };
  },
  methods: {
    // [核心 3] 新增主题切换方法
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('chat-theme', this.theme); // 保存用户偏好
    },
    toggleSelectionMode() {
      this.isSelectionMode = !this.isSelectionMode;
      // 退出选择模式时，清空已选项
      if (!this.isSelectionMode) {
        this.selectedMessages = [];
      }
    },
    exportSelectedMessages() {
      console.log('准备导出选中的消息:', this.selectedMessages);
      alert('批量导出功能待实现。');
      // 伪代码:
      // 1. 根据 selectedMessages 数组，从 allMessages 中过滤出完整的消息对象
      // 2. 将这些消息对象格式化成一个字符串（比如 Markdown 或 TXT）
      // 3. 使用 Blob 和 <a> 标签下载
    },

    screenshotSelectedMessages() {
      console.log('准备截图选中的消息:', this.selectedMessages);
      alert('批量截图功能待实现。');
      // 伪代码:
      // 1. 这是一个复杂的功能。你需要找到所有被选中的消息 DOM 元素。
      // 2. 创建一个新的、隐藏的 div，把这些 DOM 元素的克隆体放进去，并排列好。
      // 3. 使用 html2canvas 对这个隐藏的 div 进行截图。
    },
    editMessage(message) {
      // 实际应用中，通常只允许修改用户自己发的消息
      console.log('准备修改消息:', message);
      this.$prompt('请输入新的内容', '修改消息', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: message.content, // 将原始内容填入
      }).then(({ value }) => {
        // 假逻辑：更新前端数据
        message.content = value;
        this.$message.success('修改成功');
      }).catch(() => {});
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
    deleteSession(session) {
      this.$confirm(`确定要删除会话 "${session.topic}" 吗？此操作不可恢复。`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 这里是“假逻辑”，实际应调用 Vuex action
        console.log('正在删除会话:', session.sessionId);

        // 从前端假数据中移除
        const index = this.sessions.findIndex(s => s.sessionId === session.sessionId);
        if (index !== -1) {
          this.sessions.splice(index, 1);
        }
        // 如果删除的是当前会话，需要切换到一个新的会话
        if (this.activeSessionId === session.sessionId) {
          this.activeSessionId = this.sessions.length > 0 ? this.sessions[0].sessionId : null;
        }

        this.$message({
          type: 'success',
          message: '删除成功!'
        });
      }).catch(() => {
        // 用户点击了取消
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },
    loadMoreMessages(){

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
// 1. 上传前的校验
// 2. [核心] 覆盖默认的上传行为
    handleUpload(options) {
      // options.file 就是用户选择的文件对象
      const file = options.file;

      // 把文件对象添加到我们的预览数组中
      this.filesToUpload.push(file);

      // 因为我们是手动管理上传，这里不需要调用 options.onSuccess() 等
      // 这个方法的作用就是把选中的文件存到我们的 data 里
      return Promise.resolve(); // 返回一个 resolved Promise 即可
    },

    // 3. 移除待上传的文件
    removeFile(index) {
      this.filesToUpload.splice(index, 1);
    },

    // 4. [改造] 发送消息的方法
    sendMessage() {
      const hasText = this.userInput.trim().length > 0;
      const hasFiles = this.filesToUpload.length > 0;

      if (!hasText && !hasFiles) {
        // 如果既没有文本也没有文件，就不发送
        return;
      }

      // [核心] 这里是发送逻辑
      // 实际应用中，你需要用 FormData 来包装文本和文件，然后发送给后端
      console.log('准备发送消息:', this.userInput);
      console.log('准备发送文件:', this.filesToUpload.map(f => f.name));

      // --- 假逻辑：在前端显示 ---
      // 显示文本消息（如果有）
      if (hasText) {
        this.messages.push({
          id: Date.now(),
          role: 'user',
          content: this.userInput,
          avatar: '...'
        });
      }
      // 显示文件预览（假装上传成功）
      if (hasFiles) {
        this.filesToUpload.forEach(file => {
          this.messages.push({
            id: Date.now() + Math.random(),
            role: 'user',
            content: `[文件: ${file.name}]`, // 简单显示文件名
            avatar: '...'
          });
        });
      }

      // 清空输入框和待上传文件列表
      this.userInput = '';
      this.filesToUpload = [];
      this.scrollToBottom();

      // 模拟 AI 回复
      // ...
    }
    ,
    // [新增] 辅助方法，根据文件类型返回不同的 Element UI 图标类名
    fileIcon(fileType) {
      if (fileType.startsWith('image/')) {
        return 'el-icon-picture-outline';
      }
      if (fileType.startsWith('video/')) {
        return 'el-icon-video-camera';
      }
      if (fileType.startsWith('audio/')) {
        return 'el-icon-headset';
      }
      return 'el-icon-document'; // 默认为文档图标
    },
    // 当用户在抽屉里点击一个会话后，切换并关闭抽屉
    switchSession(sessionId) {
      this.activeSessionId = sessionId;
      this.drawerVisible = false; // [新增] 点击后自动关闭抽屉
    },

  }
};
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
  display: flex; /* 改为 flex 布局，方便对齐 */
  justify-content: space-between;
  align-items: center;
}
.session-topic {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-grow: 1; /* 占据主要空间 */
}

.delete-session-btn {
  visibility: hidden; /* [核心] 默认隐藏 */
  flex-shrink: 0; /* 防止被压缩 */
  margin-left: 10px;
}

.session-item:hover .delete-session-btn {
  visibility: visible; /* [核心] 悬停时显示 */
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

.chat-header {
  flex-shrink: 0; /* [新增] 防止被压缩 */
  height: 60px;
  line-height: 60px;
  padding: 0 20px;
  border-bottom: 1px solid #eee;
  display: flex; /* [新增] 启用 Flexbox */
  justify-content: space-between; /* [新增] 两端对齐 */
  align-items: center; /* [新增] 垂直居中 */
  background-color: var(--bg-primary);
}

.chat-main-area {
  flex-grow: 1; /* [新增] 占据所有剩余的垂直空间 */
  padding: 0;
  /* [关键] 需要让 el-scrollbar 知道该怎么撑开 */
  overflow: hidden;
  background-color: var(--bg-primary);
}


.chat-footer-area {
  flex-shrink: 0;
  /* height: 60px; (去掉固定高度) */
  padding: 10px 20px;
  border-top: 1px solid #f0f0f0;
  box-sizing: border-box;
  transition: height 0.3s ease; /* 高度变化动画 */
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


.ai-message {
  justify-content: flex-start;
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


.message-item-wrapper {
  display: flex;
  margin-bottom: 20px;
  align-items: flex-end; /* [修改] 改为底部对齐，这样操作栏会和气泡底部在一条线上 */
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

/* [核心] 当鼠标悬停在【整行消息】上时，显示操作栏 */
.message-item-wrapper:hover .message-actions-bar {
  opacity: 1;
  visibility: visible;
}

/* 用户消息的操作栏需要靠右对齐 */
.user-message .message-actions-bar {
  left: auto; /* 取消左侧定位 */
  right: 15px; /* 改为右侧定位 */
}


/* AI 消息 (默认) */
.ai-message {
  flex-direction: row; /* [默认] 头像在左，气泡在右 */
}

/* 用户消息 */
.user-message {
  /* [核心] 新增下面这一行代码！*/
  justify-content: flex-start;
  flex-direction: row-reverse; /* [修改] 翻转顺序，变为 操作栏, 气泡, 头像 */
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

.input-container {
  display: flex;
  align-items: center;
  width: 100%;
}
/* [新增] Popover 菜单的样式 */
.upload-options-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.upload-button {
  margin-right: 10px;
}

.chat-input {
  flex-grow: 1; /* 输入框占据剩余空间 */
}

.send-button {
  margin-left: 10px;
}

.file-preview-area {
  margin-top: 10px;
}
/* [核心] 批量操作栏的新样式 */
.batch-actions-bar {
  display: flex;
  justify-content: space-between; /* 两端对齐 */
  align-items: center;
  width: 100%; /* 撑满 Footer */
  font-size: 14px;
  color: #606266;
}
.option-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 70px; /* 稍微大一点 */
  height: 70px;
  cursor: pointer;
  border-radius: 8px;
  background-color: #f5f7fa;
  color: #606266;
}
.option-item:hover {
  background-color: #ecf5ff;
  color: #409eff;
}
.option-item i {
  font-size: 28px;
  margin-bottom: 5px;
}
.option-item span {
  font-size: 12px;
}
/* [新增] 去掉 Popover 默认的 padding */

/* [新增] 文件预览区域样式 */
.file-preview-area {
  margin-bottom: 10px;
  display: flex;
  flex-wrap: wrap; /* 文件多时可换行 */
  gap: 10px;
}
.file-preview-area .el-tag i {
  margin-right: 5px;
}
/* [新增] 抽屉内部面板的样式 */
.drawer-session-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.drawer-session-panel .session-list-scrollbar {
  flex-grow: 1;
}

/* [可选] 自定义抽屉的样式，比如去掉 body 的 padding */

/* session-item 和 delete-session-btn 的样式保持不变，但可以简化 */
.delete-session-btn {
  visibility: visible; /* 在抽屉里可以直接显示，不用再悬停了 */
}
/* --- 左侧会话面板样式 --- */
.session-panel {
  background-color: var(--bg-secondary); /* 原来是 #f5f7fa */
  border-right: 1px solid var(--border-color); /* 原来是 #e6e6e6 */
}
.session-header h3 {
  color: var(--text-primary);
}
/* ... 等等 ... */


/* --- 聊天气泡样式 --- */
.ai-message .message-bubble {
  background-color: var(--bg-tertiary); /* 原来是 #f0f2f5 */
  color: var(--text-primary);
}
.user-message .message-bubble {
  background-color: var(--brand-color); /* 原来是 #409EFF */
  color: var(--brand-text-color);
}


/* --- Element UI 组件覆盖 --- */
/* 这里我们依然需要 ::v-deep，但只需要写一次，而不是为每个主题都写！ */
::v-deep .el-input__inner {
  background-color: var(--bg-tertiary);
  border-color: var(--border-color);
  color: var(--text-primary);
}
/* [新增] 覆盖 el-tag 的样式 */
::v-deep .el-tag {
  background-color: var(--bg-tertiary);
  border-color: var(--border-color);
  color: var(--text-secondary);
}
::v-deep .el-tag .el-tag__close {
  color: var(--text-secondary);
}
::v-deep .el-tag .el-tag__close:hover {
  background-color: var(--brand-color);
  color: var(--brand-text-color);
}

/* [核心修复] 为 Header 内的标题和图标在夜间模式下设置颜色 */
.dark .topic-display {
  color: var(--text-primary); /* 使用我们定义的主要文字亮色变量 */
}

/* （可选）如果你想让编辑图标的颜色更柔和一点 */
.dark .topic-display i {
  color: var(--text-secondary); /* 使用次要文字颜色 */
}

/* 确保多选按钮在夜间模式下也清晰可见 */
.dark .chat-header .el-button {
  color: var(--text-primary);
  background-color: var(--bg-tertiary);
  border-color: var(--border-color);}
</style>

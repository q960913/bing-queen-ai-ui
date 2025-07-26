<template>
  <el-header class="chat-header">
    <!-- [核心] 我们的折叠按钮在这里！ -->
    <el-button
      :icon="isCollapsed ? 'el-icon-s-unfold' : 'el-icon-s-fold'"
      circle
      @click="toggleSessionPanel"
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
</template>

<script>
import {mapGetters, mapActions, mapState} from 'vuex'

export default {
  name: 'ChatHeader',
  data() {
    return {
      drawerVisible: false,
      // [核心] 这两个 UI 状态，保留在组件内部
      isEditingTopic: false,
      currentTopicInput: ''
    }
  },
  mounted() {
  },
  computed: {
    ...mapGetters('chat', ['activeSession']),
    // [核心] 从 Vuex 读取折叠状态，用来切换图标
    ...mapState('chat', {
      isCollapsed: state => state.isSessionPanelCollapsed
    },),
      ...mapState('chat', ['sessions','selectedMessages','isSelectionMode'])
  },
  methods: {
    ...mapActions('chat', ['toggleSelectionMode', 'toggleSessionPanel','updateTopic']),
   // 开始编辑标题
    startEditTopic() {
      this.currentTopicInput = this.activeSession.topic;
      this.isEditingTopic = true;
      this.$nextTick(() => this.$refs.topicInput.focus());
    },
    // [核心] 这是修改后的 saveTopic 方法
    saveTopic() {
      // 检查内容是否有变化，以及是否为空
      if (this.currentTopicInput && this.currentTopicInput !== this.activeSession.topic) {
        // 调用 Vuex action，并把 sessionId 和新标题作为 payload 传递过去
        this.updateTopic({
          sessionId: this.activeSession.sessionId,
          newTopic: this.currentTopicInput
        });
      }
      // 无论是否保存，都退出编辑模式
      this.isEditingTopic = false;
    }

  }
  // ... computed for activeSession.topic ...
  // ... methods for startEditTopic, toggleTheme ...
}
</script>

<style lang="scss" scoped>

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

/* 确保多选按钮在夜间模式下也清晰可见 */
.dark .chat-header .el-button {
  color: var(--text-primary);
  background-color: var(--bg-tertiary);
  border-color: var(--border-color);
}

/* [核心修复] 为 Header 内的标题和图标在夜间模式下设置颜色 */
.dark .topic-display {
  color: var(--text-primary); /* 使用我们定义的主要文字亮色变量 */
}

/* 只包含 .chat-header 内部的样式 */
</style>

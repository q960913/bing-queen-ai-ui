<template>
  <el-header class="chat-header">
    <!-- [核心] 我们的折叠按钮在这里！ -->
    <div class="header-group left">
    <el-button
      :icon="isCollapsed ? 'el-icon-s-unfold' : 'el-icon-s-fold'"
      circle
      @click="toggleSessionPanel"
      style="margin-right: 15px;"
    ></el-button>
    <el-button size="mini" @click="toggleSelectionMode">
      {{ isSelectionMode ? '取消多选' : '多选' }}
    </el-button>
    </div>
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
    <div class="header-group right">
      <el-tooltip :content="isFocusMode ? '退出专注模式' : '进入专注模式'" placement="bottom">
        <el-button
          :icon="isFocusMode ? 'el-icon-copy-document' : 'el-icon-full-screen'"
          circle
          @click="toggleFocusMode"
        ></el-button>
      </el-tooltip>
    <!-- [核心] 搜索功能下拉菜单 -->
    <el-dropdown trigger="click" @command="handleSearchCommand">
      <el-button icon="el-icon-search" circle></el-button>
      <el-dropdown-menu v-slot="" class="header-dropdown">
        <div class="dropdown-content">
          <el-input placeholder="在当前对话中搜索..." v-model="searchKeyword" size="small" clearable></el-input>
          <el-date-picker v-model="searchDateRange" type="datetimerange" size="small" range-separator="至"
                          start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
          <el-select v-model="searchRole" placeholder="按说话人筛选" size="small" clearable>
            <el-option label="我" value="user"></el-option>
            <el-option label="AI" value="ai"></el-option>
          </el-select>
          <el-checkbox v-model="searchHasFile">只看带文件的</el-checkbox>
          <el-button type="primary" size="mini" @click.stop="executeSearch">开始搜索</el-button>
        </div>
      </el-dropdown-menu>
    </el-dropdown>
    <el-dropdown trigger="click" @command="handleConfigCommand">
      <el-button icon="el-icon-setting" circle></el-button>
      <el-dropdown-menu v-slot="" class="header-dropdown">
        <div class="dropdown-content">
          <label>模型</label>
          <el-select v-model="config.model" size="small">
            <el-option label="Gemini 1.5 Flash" value="gemini-1.5-flash"></el-option>
          </el-select>
          <label>温度</label>
          <el-slider v-model="config.temperature" :min="0" :max="2" :step="0.1" show-input></el-slider>
          <label>系统提示词 (System Instruction)</label>
          <el-input type="textarea" :rows="4" v-model="config.systemInstruction"></el-input>
          <el-button type="primary" size="mini" @click.stop="saveConfig">保存设置</el-button>
        </div>
      </el-dropdown-menu>
    </el-dropdown>
    </div>
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
      currentTopicInput: '',
      searchKeyword: '',
      searchDateRange: null,
      searchRole: '',
      searchHasFile: false,
      config: {
        temperature: null,
        systemInstruction:''
      }
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
    ...mapState('chat', ['sessions', 'selectedMessages', 'isSelectionMode','isFocusMode'])
  },
  methods: {
    ...mapActions('chat', ['toggleSelectionMode', 'toggleSessionPanel', 'updateTopic','toggleFocusMode']),
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
    },
    executeSearch() {

    },
    saveConfig() {
    },
    handleConfigCommand() {},
    handleSearchCommand(){}
    // ... computed for activeSession.topic ...
    // ... methods for startEditTopic, toggleTheme ...
  }
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
.header-left, .header-right {
  display: flex;
  align-items: center;
  gap: 10px; /* 按钮之间的间距 */
}
.header-dropdown .dropdown-content {
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 500px; /* 给下拉菜单一个合适的宽度 */
}
.header-dropdown label {
  font-size: 12px;
  color: #606266;
  margin-bottom: -5px;
}

.header-group {
  display: flex;
  align-items: center;
  gap: 15px; /* 组内元素之间的间距 */
}
/* 只包含 .chat-header 内部的样式 */
</style>

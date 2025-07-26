<template>
  <div class="session-panel" :class="{ 'collapsed': isSessionPanelCollapsed }">
    <div class="session-header">
      <h3>历史会话</h3>
      <div>
        <el-button
          type="primary"
          icon="el-icon-plus"
          circle
          size="mini"
          @click="createNewSession"
        ></el-button>
        <el-button
          :icon="theme === 'light' ? 'el-icon-moon' : 'el-icon-sunny'"
          circle
          size="mini"
          @click="toggleTheme"
          style="margin-left: 10px;"
        ></el-button>
      </div>
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
          @click.stop="handleDelete(session)"
        ></el-button>
      </div>
    </el-scrollbar>
  </div>
</template>

<script>
// [核心] 导入 Vuex 辅助函数
import {mapState, mapActions} from 'vuex'

export default {
  name: 'SessionPanel',
  computed: {
    // [核心] 从 Vuex 读取 state
    ...mapState('chat', ['sessions', 'activeSessionId', 'theme', 'isSessionPanelCollapsed'])
  },
  methods: {
    // [核心] 从 Vuex 映射 actions
    ...mapActions('chat', [
      'switchSession',
      'createNewSession',
      'deleteSession', // 映射纯数据的删除 action
      'toggleTheme'
    ]),

    // [核心] 组件自己的方法，负责 UI 交互
    handleDelete(session) {
      this.$confirm(`确定要删除会Git Flow - A successful Git branching model - Vincent Driessen - nvie.com 话 "${session.topic}" 吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 用户确认后，调用映射过来的 Vuex action
        this.deleteSession(session.sessionId);
        this.$message.success('删除成功!');
      }).catch(() => {
        this.$message.info('已取消删除');
      });
    }
  }
}
</script>

<style scoped>
/* 把所有 session-panel 相关的 CSS 放在这里 */
.session-panel {
  flex-basis: 280px;
  flex-shrink: 0;
  height: 100%;
  background-color: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: flex-basis 0.3s ease;
  min-width: 0; /* 防止被内容撑开 */
}

.session-header {
  padding: 15px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.session-header h3 {
  margin: 0;
  font-size: 16px;
  color: var(--text-primary);
}

.session-list-scrollbar {
  flex-grow: 1;
  height: 100%;
}
.drawer-session-panel .session-list-scrollbar {
  flex-grow: 1;
}
/* [核心修复] 为 Header 内的标题和图标在夜间模式下设置颜色 */
.dark .session-list-scrollbar {
  color: var(--text-primary); /* 使用我们定义的主要文字亮色变量 */

}
.session-item {
  padding: 15px 20px;
  cursor: pointer;
  border-bottom: 1px solid var(--border-color);
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.session-topic {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-grow: 1;
}

.delete-session-btn {
  visibility: hidden;
  flex-shrink: 0;
  margin-left: 10px;
}

.session-item:hover .delete-session-btn {
  visibility: visible;
}

.session-item:hover {
  background-color: var(--bg-tertiary);
}

.session-item.active {
  background-color: var(--brand-color);
  color: var(--brand-text-color);
  font-weight: bold;
}

.session-panel.collapsed {
  flex-basis: 0; /* 或者一个很小的值，比如 64px */
}
</style>

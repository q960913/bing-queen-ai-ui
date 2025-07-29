// src/store/modules/chat.js

// 1. 定义需要全局共享的状态 (State - 公告牌)
const state = {
  isFocusMode: false, // [新增] 全局的专注模式状态
  isSessionPanelCollapsed: false, // [新增]
  isSelectionMode: false,
  selectedMessages: [],
  sessions: [{sessionId: '0', topic: '关于若依部署的讨论'}, {
    sessionId: '1',
    topic: '如何学习 Swift',
  }, {sessionId: '2', topic: '夏天的诗'},], activeSession: "", activeSessionId: '0', messages: {
    '0': [{
      id: 1,
      role: 'ai',
      content: '这是行内代码：`int a=1;`。这是代码块：\n' +
        '\n' +
        '```c++\n' +
        'int main(int argc , char** argv){\n' +
        '    std::cout << "Hello World!\\n";\n' +
        '    return 0;\n' +
        '}\n' +
        '```',
      avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
      turnId: 'turn-uuid-123', // [新增] 轮次ID
      activeVersion: 2,         // [新增] 当前版本号
      totalVersions: 5          // [新增] 总版本数
    }, {
      id: 2,
      role: 'user',
      content: '这是**加粗**，*斜体*，~~删除线~~，[链接](https://blog.imalan.cn)。\n' +
        '\n' +
        '这是块引用与嵌套块引用：\n' +
        '\n' +
        '> 安得广厦千万间，大庇天下寒士俱欢颜！风雨不动安如山。\n' +
        '> > 呜呼！何时眼前突兀见此屋，吾庐独破受冻死亦足！',
      avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
      turnId: 'turn-uuid-123', // [新增] 轮次ID
      activeVersion: 2,         // [新增] 当前版本号
      totalVersions: 5          // [新增] 总版本数
    },], '1': [{
      id: 3,
      role: 'ai',
      content:'这是有序列表：\n' +
        '\n' +
        '1. 打开冰箱\n' +
        '    1. 右手放在冰箱门拉手上\n' +
        '    2. 左手扶住冰箱主体\n' +
        '    3. 右手向后用力\n' +
        '2. 把大象放进冰箱\n' +
        '3. 关上冰箱\n' +
        '\n' +
        '这是行内公式：$m\\times n$，这是块级公式：\n' +
        '\n' +
        '$C_{m\\times k}=A_{m\\times n}\\cdot B_{n\\times k}$\n' +
        '\n' +
        '这是一张图片：\n' +
        '\n' +
        '![1fa0f7b958d4234db58eac4f75318d7b.jpeg](https://cdn.imalan.cn/img/post/2934349b033b5bb5a19efc7233d3d539b700bcf5.jpg)\n' +
        '\n' +
        '这是表格：\n' +
        '\n' +
        '第一格表头 | 第二格表头\n' +
        '--------- | -------------\n' +
        '内容单元格 第一列第一格 | 内容单元格第二列第一格\n' +
        '内容单元格 第一列第二格 多加文字 | 内容单元格第二列第二格\n' +
        '\n' +
        '水平分割线[^这是脚注]：\n' +
        '\n' +
        '------',
      avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
      turnId: 'turn-uuid-123', // [新增] 轮次ID
      activeVersion: 2,         // [新增] 当前版本号
      totalVersions: 5          // [新增] 总版本数
    },], 'session-3': [],
  }, theme: localStorage.getItem('chat-theme') || 'light', // ... 其他需要共享的状态 ...
}

// 2. 定义派生状态 (Getters - 公告牌的智能看板)
const getters = {
  // 根据 activeSessionId 找到完整的会话对象
  activeSession: (state) => {
    return state.sessions.find(s => s.sessionId === state.activeSessionId) || {}
  }, // 根据 activeSessionId 找到当前应该显示的消息列表
  currentMessages: (state) => {
    return state.messages[state.activeSessionId] || []
  }
}

// 3. 定义同步修改 State 的方法 (Mutations - 公告牌的唯一修改入口)
const mutations = {
  TOGGLE_SESSION_PANEL: (state) => { // [新增]
    state.isSessionPanelCollapsed = !state.isSessionPanelCollapsed;
  },
  SET_SESSIONS: (state, sessions) => {
    state.sessions = sessions
  }, SET_ACTIVE_SESSION: (state, sessionId) => {
    state.activeSessionId = sessionId
  },// [修正版] ADD_SESSION Mutation
  ADD_SESSION: (state, newSession) => {
    // 确保 sessions 是数组
    const sessions = Array.isArray(state.sessions) ? state.sessions : [];

    // [核心修改] 不要用 .unshift()，而是创建一个全新的数组并重新赋值
    // 这会强制 Vue 触发响应式更新
    state.sessions = [newSession, ...sessions];

    // Vue.set 依然是给 messages 对象添加新属性的最佳方式
    Vue.set(state.messages, newSession.sessionId, []);
  }, ADD_MESSAGE: (state, {sessionId, message}) => {
    if (state.messages[sessionId]) {
      state.messages[sessionId].push(message)
    }
  }, SET_THEME: (state, theme) => {
    state.theme = theme
    localStorage.setItem('chat-theme', theme)
  },  // [核心] 新增或确认这个 mutation
  DELETE_SESSION: (state, sessionId) => {
    // 1. 从 sessions 数组中找到并删除
    const index = state.sessions.findIndex(s => s.sessionId === sessionId);
    if (index > -1) {
      state.sessions.splice(index, 1);
    }

    // 2. 从 messages 对象中删除对应的消息列表
    Vue.delete(state.messages, sessionId);

    // 3. 如果删除的是当前活跃的会话，自动切换到第一个
    if (state.activeSessionId === sessionId) {
      state.activeSessionId = state.sessions.length > 0 ? state.sessions[0].sessionId : null;
    }
  },
  TOGGLE_SELECTION_MODE(state) {
    state.isSelectionMode = !state.isSelectionMode;
    if (!state.isSelectionMode) {
      state.selectedMessages = []; // 退出时清空
    }
  },
  SET_SELECTED_MESSAGES(state, messages) {
    state.selectedMessages = messages;
  },
  SET_CURRENT_TOPIC_INPUT(state, messages) {
    state.currentTopicInput = messages;
  },
  SET_IS_EDITING_TOPIC(state, messages) {
    state.isEditingTopic = messages;
  },
  // [核心] 这是正确的修改标题的 mutation
  UPDATE_TOPIC: (state, { sessionId, newTopic }) => {
    // 1. 找到要修改的那个 session 对象
    const sessionToUpdate = state.sessions.find(session => session.sessionId === sessionId);

    // 2. 如果找到了，就修改它的 topic
    if (sessionToUpdate) {
      sessionToUpdate.topic = newTopic;
    }
  },
  // ...
  TOGGLE_FOCUS_MODE: (state) => { // [新增]
    state.isFocusMode = !state.isFocusMode;
  },
  // src/store/modules/chat.js -> mutations

  UPDATE_MESSAGE_CONTENT: (state, { sessionId, messageId, newData }) => {
    if (!state.messages[sessionId]) return;

    // 找到需要更新的那条消息的索引
    const messageIndex = state.messages[sessionId].findIndex(m => m.id === messageId);

    if (messageIndex > -1) {
      // 找到原始消息对象
      const originalMessage = state.messages[sessionId][messageIndex];

      // [核心] 用新数据覆盖旧数据
      const updatedMessage = { ...originalMessage, ...newData };

      // 使用 Vue.set 来确保替换是响应式的
      Vue.set(state.messages[sessionId], messageIndex, updatedMessage);
    }
  },
}

// 4. 定义异步操作或复杂的业务逻辑 (Actions - 操作手册)
const actions = {
  toggleSessionPanel({ commit }) { // [新增]
    commit('TOGGLE_SESSION_PANEL');
  },
  toggleSelectionMode({ commit }) {
    commit('TOGGLE_SELECTION_MODE');},
  // 主题切换
  toggleTheme({commit, state}) {
    const newTheme = state.theme === 'light' ? 'dark' : 'light'
    commit('SET_THEME', newTheme)
  },

  switchSession({ commit }, sessionId) {
    // 它只做一件事：提交一个 mutation
    commit('SET_ACTIVE_SESSION', sessionId);
  },  deleteSession({ commit }, sessionId) {
    // (未来这里会是调用后端 API 的地方)
    // api.deleteSession(sessionId).then(() => { ... })

    commit('DELETE_SESSION', sessionId);
  },

// [修正后] 的 createNewSession action
  createNewSession({ commit }) {
    // 1. 创建一个唯一的 session ID
    const newSessionId = 'session-' + Date.now();

    // 2. 构造一个结构正确的会话对象
    const newSession = {
      sessionId: newSessionId, // [修正] 使用 sessionId 作为键
      topic: '新的聊天'        // [修正] 使用 topic 作为键
    };

    // 3. 提交 ADD_SESSION mutation，将完整的 newSession 对象传递过去
    commit('ADD_SESSION', newSession);

    // 4. 提交 SET_ACTIVE_SESSION mutation，并传递正确的 newSessionId
    commit('SET_ACTIVE_SESSION', newSessionId);
  },

  // 发送消息 (假逻辑)
  sendMessage({commit, state}, {userInput}) {
    const sessionId = state.activeSessionId
    if (!sessionId) return

    // 创建用户消息
    const userMessage = {
      id: Date.now(), role: 'user', content: userInput, // ... 其他信息
    }
    commit('ADD_MESSAGE', {sessionId, message: userMessage})

    // 模拟 AI 回复
    setTimeout(() => {
      const aiMessage = {
        id: Date.now() + 1, role: 'ai', content: `这是对“${userInput}”的模拟回复。`, // ...
      }
      commit('ADD_MESSAGE', {sessionId, message: aiMessage})
    }, 1000)
  },

  // [核心] 这是正确的修改标题的 action
  updateTopic({ commit }, { sessionId, newTopic }) {
    // (未来这里会是调用后端 API 的地方)
    // api.updateSession(sessionId, { topic: newTopic }).then(() => { ... })

    // 提交 mutation 来更新前端的状态
    commit('UPDATE_TOPIC', { sessionId, newTopic });
  },
  // ...
  toggleFocusMode({ commit }) { // [新增]
    commit('TOGGLE_FOCUS_MODE');
  }

  // ... 未来对接后端的 Action ...
  // fetchSessions({ commit }) {
  //   api.getSessions().then(res => commit('SET_SESSIONS', res.data))
  // },
}

// 别忘了导入 Vue
import Vue from 'vue'

export default {
  namespaced: true, state, getters, mutations, actions
}

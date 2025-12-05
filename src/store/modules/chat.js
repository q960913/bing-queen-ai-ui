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
  }, {sessionId: '2', topic: '夏天的诗'},], activeSession: "", activeSessionId: '0', messages:
    []
  , theme: localStorage.getItem('chat-theme') || 'light', // ... 其他需要共享的状态 ...
}

// 2. 定义派生状态 (Getters - 公告牌的智能看板)
const getters = {
  // 根据 activeSessionId 找到完整的会话对象
  activeSession: (state) => {
    return state.sessions.find(s => s.sessionId === state.activeSessionId) || {}
  }, // 根据 activeSessionId 找到当前应该显示的消息列表
  currentMessages: (state) => {
    return state.messages || []
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
  },

  // ... 原有的 ADD_MESSAGE ...
  ADD_MESSAGE(state, {sessionId, message}) {
    const session = state.sessions.find(s => s.sessionId === sessionId)
    if (session) {
      state.messages.push(message)
    }
  },

  // ✨ 新增：用于流式追加文本
  APPEND_LAST_MESSAGE_CONTENT(state, {sessionId, text}) {
    const session = state.sessions.find(s => s.sessionId === sessionId)
    if (session && state.messages.length > 0) {
      // 找到最后一条消息（即 AI 正在生成的这条）
      const lastMsg = state.messages[state.messages.length - 1]
      // 只有当角色是 ai 时才追加
      lastMsg.content += text

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
  UPDATE_TOPIC: (state, {sessionId, newTopic}) => {
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

  UPDATE_MESSAGE_CONTENT: (state, {sessionId, messageId, newData}) => {
    if (!state.messages[sessionId]) return;

    // 找到需要更新的那条消息的索引
    const messageIndex = state.messages[sessionId].findIndex(m => m.id === messageId);

    if (messageIndex > -1) {
      // 找到原始消息对象
      const originalMessage = state.messages[sessionId][messageIndex];

      // [核心] 用新数据覆盖旧数据
      const updatedMessage = {...originalMessage, ...newData};

      // 使用 Vue.set 来确保替换是响应式的
      Vue.set(state.messages[sessionId], messageIndex, updatedMessage);
    }
  },
}

// 4. 定义异步操作或复杂的业务逻辑 (Actions - 操作手册)
const actions = {
  toggleSessionPanel({commit}) { // [新增]
    commit('TOGGLE_SESSION_PANEL');
  },
  toggleSelectionMode({commit}) {
    commit('TOGGLE_SELECTION_MODE');
  },
  // 主题切换
  toggleTheme({commit, state}) {
    const newTheme = state.theme === 'light' ? 'dark' : 'light'
    commit('SET_THEME', newTheme)
  },

  switchSession({commit}, sessionId) {
    // 它只做一件事：提交一个 mutation
    commit('SET_ACTIVE_SESSION', sessionId);
  }, deleteSession({commit}, sessionId) {
    // (未来这里会是调用后端 API 的地方)
    // api.deleteSession(sessionId).then(() => { ... })

    commit('DELETE_SESSION', sessionId);
  },

// [修正后] 的 createNewSession action
  createNewSession({commit}) {
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

  sendMessage({commit, state}, {userInput}) {
    const sessionId = state.activeSessionId
    if (!sessionId || !userInput.trim()) return

    // 1. 立即提交用户的消息
    const userMessage = {
      id: Date.now(),
      role: 'user', // 或者 'human'
      content: userInput,
      createTime: new Date().toLocaleString(),
      turnId : 1,
      activeVersion : 1,
      totalVersions : 1,
      avatar : 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
    }
    commit('ADD_MESSAGE', {sessionId, message: userMessage})

    // 2. 立即提交一个“空”的 AI 消息占位符
    // 这样界面上会立刻出现一个气泡，等待填充内容
    const aiMessageId = Date.now() + 1
    const aiMessage = {
      id: aiMessageId,
      role: 'ai', // 或者 'model'，需与后端保持一致
      content: '', // 初始为空
      createTime: new Date().toLocaleString(),
      loading: true, // 可选：用于界面显示 loading 状态
      turnId : 1,
      activeVersion : 1,
      totalVersions : 1,
      avatar : 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
    }
    commit('ADD_MESSAGE', {sessionId, message: aiMessage})

    // 3. 拼接请求地址 (假设你配置了 devServer 代理 /dev-api)
    // 注意：需要对中文参数进行 URL 编码
    const url = `/dev-api/ai/chat/stream?content=${encodeURIComponent(userInput)}&sessionId=${sessionId}`

    // 4. 创建 SSE 连接
    const eventSource = new EventSource(url)

    // --- 监听消息推送 ---
    eventSource.onmessage = (event) => {
      try {
        // 后端传回来的数据是 JSON 字符串: data: {"text": "..."}
        // event.data 就是那个 JSON 字符串
        const data = event.data

        // 提取文本部分 (根据你后端的 DTO 结构，可能是 data.text 或 data.content)
        const newText = data || ''

        if (newText) {
          // 提交 mutation，追加文本
          commit('APPEND_LAST_MESSAGE_CONTENT', {sessionId, text: newText})
        }
      } catch (error) {
        console.error('解析消息失败:', error)
      }
    }


    eventSource.onerror = (event) => {
      // readyState: 0=CONNECTING (重连中), 1=OPEN (连接中), 2=CLOSED (已关闭)

      if (eventSource.readyState === 0) {
        // === 核心修改 ===
        // 状态为 0 说明连接断开了，浏览器正在尝试重连。
        // 在我们这个场景下，通常意味着 AI 说完了，后端正常关闭了连接。
        console.log('✅ 服务端已关闭连接，对话结束。');

        // 我们不需要重连，所以手动彻底关闭它
        eventSource.close();

        // 可选：你可以在这里 commit 一个状态，告诉界面“生成完毕”
        // commit('UPDATE_STATUS', 'finished');
      } else {
        // 其他情况才是真正的异常
        console.error('❌ SSE 发生未知错误:', event);
        eventSource.close();
      }
    };

    // 如果你后端发了自定义的结束事件 (例如 event: end)
    // eventSource.addEventListener('end', () => { eventSource.close() })
  }
  ,

  // [核心] 这是正确的修改标题的 action
  updateTopic({commit}, {sessionId, newTopic}) {
    // (未来这里会是调用后端 API 的地方)
    // api.updateSession(sessionId, { topic: newTopic }).then(() => { ... })

    // 提交 mutation 来更新前端的状态
    commit('UPDATE_TOPIC', {sessionId, newTopic});
  },
  // ...
  toggleFocusMode({commit}) { // [新增]
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

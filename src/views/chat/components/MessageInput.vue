<template>
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
            <el-upload action="#" :http-request="handleUpload" :show-file-list="false" accept="image/*"
                       capture="camera">
              <div class="option-item"><i class="el-icon-camera-solid"></i><span>拍照</span></div>
            </el-upload>
            <!-- 相册 -->
            <el-upload action="#" :http-request="handleUpload" :show-file-list="false" accept="image/*"
                       :multiple="true">
              <div class="option-item"><i class="el-icon-picture-outline"></i><span>相册</span></div>
            </el-upload>
            <!-- 文件 -->
            <el-upload action="#" :http-request="handleUpload" :show-file-list="false" :multiple="true">
              <div class="option-item"><i class="el-icon-folder-opened"></i><span>文件</span></div>
            </el-upload>
            <!-- 录像 (可选) -->
            <el-upload action="#" :http-request="handleUpload" :show-file-list="false" accept="video/*"
                       capture="camcorder">
              <div class="option-item"><i class="el-icon-video-camera-solid"></i><span>录像</span></div>
            </el-upload>
            <!-- 录音 (可选) -->
            <el-upload action="#" :http-request="handleUpload" :show-file-list="false" accept="audio/*"
                       capture="microphone">
              <div class="option-item"><i class="el-icon-microphone"></i><span>录音</span></div>
            </el-upload>
            <div class="option-item"><i class="el-icon-paperclip"></i><span>网址</span></div>
          </div>

          <!-- 触发 Popover 的按钮 -->
          <template #reference>
            <el-button icon="el-icon-plus" circle class="upload-button"></el-button>
          </template>
        </el-popover>

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
      <div class="batch-actions-bar">
        <span>已选择 {{ selectedMessages.length }} 条消息</span>
        <div>
          <el-button size="small" @click="exportSelectedMessages">导出选中</el-button>
          <el-button size="small" @click="screenshotSelectedMessages">截图选中</el-button>
        </div>
      </div>
    </template>
  </el-footer>
</template>

<script>
import { mapState } from 'vuex';
export default {
  name: 'MessageInput',
  computed: {
  ...mapState('chat', ['isSelectionMode', 'selectedMessages'])
  },
  data() {
    return {
      filesToUpload: [],
      userInput: '',
    }
  },
  mounted() {
  },

  methods: {
    exportSelectedMessages() {
    },
    // MessageInput.vue

    sendMessage() {
      if (!this.userInput.trim() && this.filesToUpload.length === 0) return;

      // 调用 Vuex 的 action 来发送消息
      this.$store.dispatch('chat/sendMessage', {
        userInput: this.userInput,
        files: this.filesToUpload
      });

      // 清空本地状态
      this.userInput = '';
      this.filesToUpload = [];
    },
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
    },    // 3. 移除待上传的文件
    removeFile(index) {
      this.filesToUpload.splice(index, 1);
    },// 1. 上传前的校验
// 2. [核心] 覆盖默认的上传行为
    handleUpload(options) {
      // options.file 就是用户选择的文件对象
      const file = options.file;

      // 把文件对象添加到我们的预览数组中
      this.filesToUpload.push(file);

      // 因为我们是手动管理上传，这里不需要调用 options.onSuccess() 等
      // 这个方法的作用就是把选中的文件存到我们的 data 里
      return Promise.resolve(); // 返回一个 resolved Promise 即可
    },    // 保存标题 (假)

    screenshotSelectedMessages() {
      console.log('准备截图选中的消息:', this.selectedMessages);
      alert('批量截图功能待实现。');
      // 伪代码:
      // 1. 这是一个复杂的功能。你需要找到所有被选中的消息 DOM 元素。
      // 2. 创建一个新的、隐藏的 div，把这些 DOM 元素的克隆体放进去，并排列好。
      // 3. 使用 html2canvas 对这个隐藏的 div 进行截图。

    }

    // ... data for userInput, filesToUpload ...
    // ... methods for sendMessage, handleUpload, etc. ...
  }
}
</script>

<style lang="scss" scoped>
/* 包含 .chat-footer-area, .input-container, .batch-actions-bar 等所有输入区相关样式 */

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


.chat-footer-area {
  flex-shrink: 0;
  /* height: 60px; (去掉固定高度) */
  padding: 10px 20px;
  border-top: 1px solid #f0f0f0;
  box-sizing: border-box;
  transition: height 0.3s ease; /* 高度变化动画 */
  background-color: var(--bg-primary);
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
</style>

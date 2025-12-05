<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="用户ID(关联sys_user)" prop="userId">
        <el-input
          v-model="queryParams.userId"
          placeholder="请输入用户ID(关联sys_user)"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="会话标题" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入会话标题"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="模型标识" prop="model">
        <el-input
          v-model="queryParams.model"
          placeholder="请输入模型标识"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="温度(创意度)" prop="temperature">
        <el-input
          v-model="queryParams.temperature"
          placeholder="请输入温度(创意度)"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="上下文携带条数" prop="historyLimit">
        <el-input
          v-model="queryParams.historyLimit"
          placeholder="请输入上下文携带条数"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="是否置顶(0否 1是)" prop="isPinned">
        <el-input
          v-model="queryParams.isPinned"
          placeholder="请输入是否置顶(0否 1是)"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:session:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:session:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:session:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPermi="['system:session:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="sessionList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="会话ID" align="center" prop="id" />
      <el-table-column label="用户ID(关联sys_user)" align="center" prop="userId" />
      <el-table-column label="会话标题" align="center" prop="title" />
      <el-table-column label="模型标识" align="center" prop="model" />
      <el-table-column label="人设/系统指引" align="center" prop="systemPrompt" />
      <el-table-column label="温度(创意度)" align="center" prop="temperature" />
      <el-table-column label="上下文携带条数" align="center" prop="historyLimit" />
      <el-table-column label="是否置顶(0否 1是)" align="center" prop="isPinned" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['system:session:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['system:session:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改AI会话对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户ID(关联sys_user)" prop="userId">
          <el-input v-model="form.userId" placeholder="请输入用户ID(关联sys_user)" />
        </el-form-item>
        <el-form-item label="会话标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入会话标题" />
        </el-form-item>
        <el-form-item label="模型标识" prop="model">
          <el-input v-model="form.model" placeholder="请输入模型标识" />
        </el-form-item>
        <el-form-item label="人设/系统指引" prop="systemPrompt">
          <el-input v-model="form.systemPrompt" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="温度(创意度)" prop="temperature">
          <el-input v-model="form.temperature" placeholder="请输入温度(创意度)" />
        </el-form-item>
        <el-form-item label="上下文携带条数" prop="historyLimit">
          <el-input v-model="form.historyLimit" placeholder="请输入上下文携带条数" />
        </el-form-item>
        <el-form-item label="是否置顶(0否 1是)" prop="isPinned">
          <el-input v-model="form.isPinned" placeholder="请输入是否置顶(0否 1是)" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listSession, getSession, delSession, addSession, updateSession } from "@/api/system/session"

export default {
  name: "Session",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // AI会话表格数据
      sessionList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userId: null,
        title: null,
        model: null,
        systemPrompt: null,
        temperature: null,
        historyLimit: null,
        isPinned: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        userId: [
          { required: true, message: "用户ID(关联sys_user)不能为空", trigger: "blur" }
        ],
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询AI会话列表 */
    getList() {
      this.loading = true
      listSession(this.queryParams).then(response => {
        this.sessionList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        userId: null,
        title: null,
        model: null,
        systemPrompt: null,
        temperature: null,
        historyLimit: null,
        isPinned: null,
        createTime: null,
        updateTime: null
      }
      this.resetForm("form")
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm")
      this.handleQuery()
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = "添加AI会话"
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids
      getSession(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = "修改AI会话"
      })
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateSession(this.form).then(response => {
              this.$modal.msgSuccess("修改成功")
              this.open = false
              this.getList()
            })
          } else {
            addSession(this.form).then(response => {
              this.$modal.msgSuccess("新增成功")
              this.open = false
              this.getList()
            })
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids
      this.$modal.confirm('是否确认删除AI会话编号为"' + ids + '"的数据项？').then(function() {
        return delSession(ids)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess("删除成功")
      }).catch(() => {})
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('system/session/export', {
        ...this.queryParams
      }, `session_${new Date().getTime()}.xlsx`)
    }
  }
}
</script>

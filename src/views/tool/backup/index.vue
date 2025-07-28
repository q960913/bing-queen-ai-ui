<template>
  <div class="app-container">
    <el-table
      ref="multipleTable"
      :data="tableData"
      tooltip-effect="dark"
      style="width: 100%"
      @selection-change="handleSelectionChange">
      <el-table-column
        type="selection"
        width="55">
      </el-table-column>
    <el-table-column
      fixed
      prop="date"
      label="日期"
      width="150">
    </el-table-column>
    <el-table-column
      prop="name"
      label="备份名称"
      width="120">
    </el-table-column>
    <el-table-column
      prop="count"
      label="备份消息条数"
      width="150">
    </el-table-column>
    <el-table-column
      prop="size"
      label="备份大小"
      width="100">
    </el-table-column>
    <el-table-column
      prop="backupTimeRange"
      label="备份时间区间"
      width="300">
    </el-table-column>
    <el-table-column
      prop="backupType"
      label="备份类型"
      width="80">
    </el-table-column>
    <el-table-column
      prop="backupStatus"
      label="备份情况"
      width="80">
    </el-table-column>
    <el-table-column
      fixed="right"
      label="操作"
      width="100">
      <template v-slot:default="scope">
        <el-button @click="handleClick(scope.row)" type="text" size="small">下载</el-button>
        <el-button type="text" size="small">删除</el-button>
      </template>
    </el-table-column>
  </el-table>
  <div class="block">
    <div>
    <el-button type="primary">立刻生成全部手动备份</el-button>
    <el-button type="primary">自动备份设置</el-button></div>
    <el-pagination
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
    :current-page="currentPage4"
    :page-sizes="[100, 200, 300, 400]"
    :page-size="100"
    layout="total, sizes, prev, pager, next, jumper"
    :total="400">
  </el-pagination>
  </div>
  </div>
</template>

<script>
export default {
  methods: {
    handleClick(row) {
      console.log(row);
    },
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`);
    },
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`);
    },
    handleSelectionChange() {
    }
  },

  data() {
    return {
      currentPage4: 1,
      tableData: [{
        date: '2024-05-26',
        name: '备份',
        count: '10000',
        size: '100MB',
        backupTimeRange: '2024-02-25-2024-05-26',
        backupType: '自动',
        backupStatus: '已完成'
      },{
        date: '2024-05-26',
        name: '备份',
        count: '10000',
        size: '100MB',
        backupTimeRange: '2024-02-25-2024-05-26',
        backupType: '自动',
        backupStatus: '已完成'
      },{
        date: '2024-05-26',
        name: '备份',
        count: '10000',
        size: '100MB',
        backupTimeRange: '2024-02-25-2024-05-26',
        backupType: '自动',
        backupStatus: '已完成'
      }]
    }
  }
}
</script>
<style lang="scss" scoped>
/*
  使用 .app-container 作为根元素的类名，
  可以自动继承若依后台的通用内边距和布局样式，
  让你的页面和若依的其他页面风格完全统一。
  请确保你的模板最外层是 <div class="app-container">
*/

/* 为 el-card 添加一些底部外边距，让它和分页器之间有呼吸空间 */
.el-card {
  margin-bottom: 20px;
}

/* 自定义卡片头部的样式 */
.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}
.clearfix:after {
  clear: both
}
.clearfix span {
  font-weight: bold;
  font-size: 16px;
}

/* 描述性文字的样式，让它更柔和 */
.backup-description {
  font-size: 14px;
  color: #909399;
  line-height: 1.5;
  margin-top: 0;
  margin-bottom: 20px;
}

/* 手动备份操作区的布局 */
.manual-backup-actions {
  display: flex;
  align-items: center;
  gap: 15px; /* 使用 gap 属性创建元素间隔，比 margin 更现代 */
}

/* 解决 el-upload 组件默认的块级显示问题 */
.restore-uploader {
  display: inline-block;
  margin-left: 10px;
}

/* 表格单元格默认居中，让视觉上更整齐 */
/* 如果你不喜欢，可以移除这段 */
.el-table ::v-deep th,
.el-table ::v-deep td {
  text-align: center;
}

/* 但让“备份名称”和“备份时间区间”这两列左对齐，因为它们内容较长 */
.el-table ::v-deep .el-table__cell:nth-child(2) .cell,
.el-table ::v-deep .el-table__cell:nth-child(5) .cell {
  text-align: left;
}

/* 操作列的按钮之间增加一点间距 */
.el-table ::v-deep .el-table__cell:last-child .cell {
  display: flex;
  justify-content: center;
  gap: 10px;
}

/* 分页器的样式，让它和表格之间有明确的间距 */
.block {
  margin-top: 20px;
  text-align: right; /* 分页器通常右对齐 */
  display: flex;
  justify-content: space-between;
}
</style>

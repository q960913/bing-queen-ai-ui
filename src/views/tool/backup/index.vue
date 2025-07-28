<template>
  <div>
  <el-table
    :data="tableData"
    border
    style="width: 100%">
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
      width="120">
    </el-table-column>
    <el-table-column
      prop="size"
      label="备份大小"
      width="120">
    </el-table-column>
    <el-table-column
      prop="backupTimeRange"
      label="备份时间区间"
      width="300">
    </el-table-column>
    <el-table-column
      prop="backupType"
      label="备份类型"
      width="120">
    </el-table-column>
    <el-table-column
      prop="backupStatus"
      label="备份情况"
      width="120">
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

<template>
  <el-form ref="form" :model="form" :rules="rules" label-width="80px">
    <el-form-item label="提示词" prop="nickName">
      <el-input v-model="form.nickName" maxlength="30" />
    </el-form-item>
    <el-form-item label="apikey1" prop="phonenumber">
      <el-input v-model="form.phonenumber" maxlength="11" />
    </el-form-item>
    <el-form-item label="apikey2" prop="email">
      <el-input v-model="form.email" maxlength="50" />
    </el-form-item>
    <el-form-item label="偏好模式">
      <el-radio-group v-model="form.sex">
        <el-radio label="0">夜间</el-radio>
        <el-radio label="1">白天</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" size="mini" @click="submit">保存</el-button>
      <el-button type="danger" size="mini" @click="close">关闭</el-button>
    </el-form-item>
  </el-form>
</template>

<script>

export default {
  name: "aiManage",
  props: {
    user: {
      type: Object
    }
  },
  data() {
    return {
      form: {},
      // 表单校验
      rules: {
      }
    }
  },
  watch: {
  },
  methods: {
    submit() {
    },
    close() {
      this.$tab.closePage()
    }
  }
}
</script>

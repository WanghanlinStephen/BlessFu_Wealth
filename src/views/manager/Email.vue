<template>
    <div>
      <el-form label-width="100px" style="padding-right: 50px; margin: 20px;" :model="emailForm" :rules="emailRules" ref="emailFormRef">
        <el-form-item label="发送者" prop="sender">
          <el-select v-model="emailForm.sender" placeholder="请选择发送者">
            <el-option label="cstutor2024@outlook.com" value="cstutor2024@outlook.com"></el-option>
            <el-option label="wanghanlinstephen@outlook.com" value="wanghanlinstephen@outlook.com"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="接收者类型" prop="receiverType">
          <el-radio-group v-model="emailForm.receiverType">
            <el-radio label="single">单个用户</el-radio>
            <el-radio label="all">现存所有用户</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="emailForm.receiverType === 'single'" label="接收者" prop="receiver">
          <el-input v-model="emailForm.receiver" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="标题" prop="subject">
          <el-input v-model="emailForm.subject" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input type="textarea" :rows="5" v-model="emailForm.content" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button @click="resetForm">取消</el-button>
          <el-button type="primary" @click="sendEmail">发送</el-button>
        </el-form-item>
      </el-form>
  
      <el-dialog title="发送结果" :visible.sync="resultDialogVisible" width="50%">
        <el-table :data="emailResults" stripe>
          <el-table-column prop="receiver" label="邮箱" align="center"></el-table-column>
          <el-table-column prop="status" label="状态" align="center">
            <template slot-scope="scope">
              <el-tag :type="scope.row.status === 'success' ? 'success' : 'danger'">{{ scope.row.status === 'success' ? '成功' : '失败' }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
        <div slot="footer" class="dialog-footer">
          <el-button @click="resultDialogVisible = false">关闭</el-button>
        </div>
      </el-dialog>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    name: "EmailSend",
    data() {
      return {
        emailForm: {
          sender: 'cstutor2024@outlook.com',
          receiverType: 'single', // 默认选择单个用户
          receiver: '',
          subject: '',
          content: '',
          date: null
        },
        emailRules: {
          sender: [
            { required: true, message: '请选择发送者', trigger: 'blur' },
          ],
          receiverType: [
            { required: true, message: '请选择接收者类型', trigger: 'change' }
          ],
          receiver: [
            { required: true, message: '请输入接收者', trigger: 'blur', type: 'string', min: 1 }
          ],
          subject: [
            { required: true, message: '请输入标题', trigger: 'blur' },
          ],
          content: [
            { required: true, message: '请输入内容', trigger: 'blur' },
          ]
        },
        resultDialogVisible: false,
        emailResults: [] // 用于存储每个邮件的发送结果
      };
    },
    methods: {
      sendEmail() {
        this.$refs.emailFormRef.validate((valid) => {
          if (valid) {
            let receiver = this.emailForm.receiverType === 'single' ? this.emailForm.receiver : '';
            const postData = {
              sender: this.emailForm.sender,
              receiverType: this.emailForm.receiverType,
              receiver: receiver,
              subject: this.emailForm.subject,
              content: this.emailForm.content,
              date: this.emailForm.date
            };
            axios.post('http://localhost:9090/email/send', postData, {
              headers: {
                'Content-Type': 'application/json'
              }
            }).then(res => {
                console.log(res.data)
              if (res.data && Array.isArray(res.data)) { // 检查响应是否为数组
                this.emailResults = res.data.map(email => ({
                  receiver: email.receiver,
                  status: email.status
                }));
                this.resultDialogVisible = true; // 打开结果对话框
                this.resetForm(); // 成功后重置表单
              } else {
                this.$message.error('发送失败: ' + res.data.message);
              }
            }).catch(error => {
              this.$message.error('发送失败: ' + error.message);
            });
          }
        });
      },
  
      resetForm() {
        this.$refs.emailFormRef.resetFields();
      }
    }
  };
  </script>
  
  <style scoped>
  .name-item {
    display: flex;
    align-items: center;
  }
  </style>
  
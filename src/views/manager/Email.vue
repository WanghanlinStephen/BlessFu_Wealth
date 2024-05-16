<template>
    <div>
        <el-form label-width="100px" style="padding-right: 50px; margin: 20px;" :model="emailForm" :rules="emailRules"
            ref="emailFormRef">
            <el-form-item label="发送者" prop="sender">
                <el-select v-model="emailForm.sender" placeholder="请选择发送者">
                    <el-option label="cstutor2024@outlook.com" value="cstutor2024@outlook.com"></el-option>
                    <el-option label="wanghanlinstephen@outlook.com" value="wanghanlinstephen@outlook.com"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="接收者" prop="receiver">
                <el-input v-model="emailForm.receiver" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="标题" prop="subject">
                <el-input v-model="emailForm.subject" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="内容" prop="content">
                <el-input type="textarea" :rows="5" v-model="emailForm.content" autocomplete="off"></el-input>
            </el-form-item>
            <!-- <el-form-item label="发送日期" prop="date">
                <el-date-picker v-model="emailForm.date" type="datetime" value-format="yyyy-MM-dd HH:mm:ss"
                    placeholder="选择日期和时间">
                </el-date-picker>
            </el-form-item> -->
            <el-form-item>
                <el-button @click="resetForm">取消</el-button>
                <el-button type="primary" @click="sendEmail">发送</el-button>
            </el-form-item>
        </el-form>
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
                receiver: '',
                content: '',
                date: null
            },
            emailRules: {
                sender: [
                    { required: true, message: '请选择发送者', trigger: 'blur' },
                ],
                receiver: [
                    { required: true, message: '请输入接收者', trigger: 'blur' },
                ],
                content: [
                    { required: true, message: '请输入内容', trigger: 'blur' },
                ],
                date: [
                    { required: true, message: '请选择发送日期', trigger: 'blur' },
                ]
            }
        }
    },
    methods: {
        sendEmail() {
            this.$refs.emailFormRef.validate((valid) => {
                if (valid) {
                    //todo: 上线前修改为线上链接
                    axios.post('http://localhost:9090/email/send', `to=${encodeURIComponent(this.emailForm.receiver)}&subject=${encodeURIComponent(this.emailForm.subject)}&body=${encodeURIComponent(this.emailForm.content)}`, {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    }).then(res => {
                        if (res.data && res.status === 200) {  // 检查响应状态码和数据
                            this.$message.success('邮件发送成功');
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
}
</script>

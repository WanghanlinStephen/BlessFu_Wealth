<template>
    <div>
        <div class="search">
            <el-input placeholder="请输入用户姓名查询" style="width: 200px; margin-right: 10px" v-model="userName"></el-input>
            <el-date-picker value-format="yyyy-MM-dd" format="yyyy-MM-dd" v-model="start" placeholder="请选择开始日期查询"
                style="width: 200px; margin-right: 10px"></el-date-picker>
            <el-date-picker value-format="yyyy-MM-dd" format="yyyy-MM-dd" v-model="end" placeholder="请选择结束日期查询"
                style="width: 200px;"></el-date-picker>
            <el-button type="info" plain style="margin-left: 10px" @click="load(1)">查询</el-button>
            <el-button type="warning" plain style="margin-left: 10px" @click="reset">重置</el-button>
        </div>

        <div class="operation">
            <el-button type="primary" plain @click="handleAdd">记一笔</el-button>
            <el-button type="danger" plain @click="delBatch">批量删除</el-button>
            <!-- <el-button type="info" plain @click="exportBatch">全部导出</el-button> -->
        </div>

        <div class="table">
            <el-table :data="tableData" stripe @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55" align="center"></el-table-column>
                <el-table-column prop="id" label="序号" width="70" align="center" sortable></el-table-column>
                <el-table-column prop="userName" label="用户"></el-table-column>
                <el-table-column prop="startDate" label="开始时间"></el-table-column>
                <el-table-column prop="endDate" label="结束日期"></el-table-column>
                <el-table-column prop="time" label="贡献时间/day"></el-table-column>
                <el-table-column label="操作" align="center" width="180">
                    <template v-slot="scope">
                        <el-button size="mini" type="primary" plain @click="handleEdit(scope.row)">编辑</el-button>
                        <el-button size="mini" type="danger" plain @click="del(scope.row.id)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <div class="pagination">
                <el-pagination background @current-change="handleCurrentChange" :current-page="pageNum"
                    :page-sizes="[5, 10, 20]" :page-size="pageSize" layout="total, prev, pager, next" :total="total">
                </el-pagination>
            </div>
        </div>

        <el-dialog title="记录义工时间" :visible.sync="formVisible" width="40%" :close-on-click-modal="false"
            destroy-on-close>
            <el-form :model="form" label-width="100px" style="padding-right: 50px" :rules="rules" ref="formRef">
                <el-form-item label="选择用户" prop="userName">
                    <el-autocomplete v-model="form.userName" :fetch-suggestions="querySearch" placeholder="请输入用户姓名"
                        style="width: 100%" @select="handleSelect">
                        <template slot-scope="{ item }">
                            <div class="name-item">{{ item.value }}</div>
                        </template>
                    </el-autocomplete>
                </el-form-item>
                <el-form-item label="开始日期" prop="startDate">
                    <el-date-picker v-model="form.startDate" type="datetime" placeholder="选择开始日期"
                        style="width: 100%"></el-date-picker>
                </el-form-item>
                <el-form-item label="结束日期" prop="endDate">
                    <el-date-picker v-model="form.endDate" type="datetime" placeholder="选择结束日期"
                        style="width: 100%"></el-date-picker>
                </el-form-item>
                <el-form-item label="贡献时间" prop="time">
                    <el-input v-model="form.time" placeholder="贡献时间" style="width: 100%"></el-input>
                </el-form-item>
                <el-form-item label="备注" prop="comment">
                    <el-input type="textarea" v-model="form.comment" placeholder="备注"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="formVisible = false">取消</el-button>
                <el-button type="primary" @click="save">确认</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: "VolunteerTime",
    data() {
        return {
            tableData: [],
            pageNum: 1,
            pageSize: 10,
            total: 0,
            userName: null,
            startDate: null,
            endDate: null,
            start: null,
            end: null,
            formVisible: false,
            form: {},
            user: JSON.parse(localStorage.getItem('xm-user') || '{}'),
            rules: {
                userName: [
                    { required: true, message: '请选择用户', trigger: 'blur' }
                ],
                startDate: [
                    { type: 'date', required: true, message: '请选择开始日期', trigger: 'change' }
                ],
                endDate: [
                    { type: 'date', required: true, message: '请选择结束日期', trigger: 'change' }
                ],
                time: [
                    { required: true, message: '请输入预计贡献时间', trigger: 'blur' }
                ]
            },
            ids: [],
            categoryList: []
        };
    },
    created() {
        this.load(1);
    },
    methods: {
        handleSelect(item) {
            this.form.userId = item.id;
            this.form.userName = item.value;
            this.$refs.formRef.validateField('userName');
        },
        querySearch(queryString, cb) {
            this.$request({
                url: '/user/selectAll',
                method: 'GET'
            }).then(response => {
                if (response.code === '200') {
                    const users = response.data.map(user => {
                        return { id: user.id, value: user.username };
                    });
                    const results = queryString ? users.filter(user => user.value.toLowerCase().includes(queryString.toLowerCase())) : users;
                    cb(results);
                } else {
                    console.error('Failed to fetch users:', response.msg);
                    cb([]);
                }
            }).catch(error => {
                console.error('Error fetching users:', error);
                cb([]);
            });
        },
        handleAdd() {
            this.form = {};  // Reset form
            this.formVisible = true;
        },
        handleEdit(row) {
            this.form = JSON.parse(JSON.stringify(row));
            this.formVisible = true;
        },
        save() {
            this.$refs.formRef.validate((valid) => {
                if (valid) {
                    const apiURL = this.form.id ? '/volunteer/update' : '/volunteer/add';
                    this.$request({
                        url: apiURL,
                        method: 'POST',
                        data: this.form
                    }).then(res => {
                        if (res.code === '200') {
                            this.$message.success('保存成功');
                            this.load(1);
                            this.formVisible = false;
                        } else {
                            this.$message.error(res.msg);
                        }
                    });
                }
            });
        },
        del(id) {
            this.$confirm('您确定要删除这条记录吗？', '确认删除', { type: "warning" }).then(() => {
                this.$request.delete('/volunteer/delete/' + id).then(res => {
                    if (res.code === '200') {
                        this.$message.success('删除成功');
                        this.load(1);
                    } else {
                        this.$message.error(res.msg);
                    }
                });
            }).catch(() => { });
        },
        delBatch() {
            if (!this.ids.length) {
                this.$message.warning('请选择要删除的记录');
                return;
            }
            this.$confirm('您确定要批量删除这些记录吗？', '确认删除', { type: "warning" }).then(() => {
                this.$request.delete('/volunteer/delete/batch', { data: this.ids }).then(res => {
                    if (res.code === '200') {
                        this.$message.success('删除成功');
                        this.load(1);
                    } else {
                        this.$message.error(res.msg);
                    }
                });
            }).catch(() => { });
        },
        load(pageNum) {
            if (pageNum) this.pageNum = pageNum;
            this.$request.get('/volunteer/selectPage', {
                params: {
                    pageNum: this.pageNum,
                    pageSize: this.pageSize,
                    userName: this.userName,
                    startDate: this.startDate,
                    endDate: this.endDate,
                    start: this.start,
                    end: this.end,
                }
            }).then(res => {
                this.tableData = res.data?.list;
                this.total = res.data?.total;
            });
        },
        reset() {
            this.userName = null;
            this.startDate = null;
            this.endDate = null;
            this.start = null
            this.end = null
            this.load(1);
        },
        handleCurrentChange(pageNum) {
            this.load(pageNum);
        },
    }
}
</script>

<style scoped></style>
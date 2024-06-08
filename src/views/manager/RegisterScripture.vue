<template>
  <div>
    <div class="search">
      <el-input placeholder="请选择经书类型查询" style="width: 200px; margin-right: 10px" v-model="category"></el-input>
      <el-date-picker value-format="yyyy-MM-dd" format="yyyy-MM-dd" v-model="start" placeholder="请选择开始日期查询" style="width: 200px; margin-right: 10px"></el-date-picker>
      <el-date-picker value-format="yyyy-MM-dd" format="yyyy-MM-dd" v-model="end" placeholder="请选择结束日期查询" style="width: 200px;"></el-date-picker>
      <el-button type="info" plain style="margin-left: 10px" @click="load(1)">查询</el-button>
      <el-button type="warning" plain style="margin-left: 10px" @click="reset">重置</el-button>
    </div>

    <div class="summary-board">
      <el-card>
        <el-table :data="summaryData" stripe>
          <el-table-column prop="category" label="经书类型" align="center"></el-table-column>
          <el-table-column prop="totalCount" label="总次数" align="center"></el-table-column>
        </el-table>
      </el-card>
    </div>

    <div class="operation">
      <el-button type="primary" plain @click="handleAdd">新增打卡</el-button>
      <el-button type="danger" plain @click="delBatch">批量删除</el-button>
    </div>

    <div class="table">
      <el-table :data="tableData" stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center"></el-table-column>
        <el-table-column prop="id" label="序号" width="70" align="center" sortable></el-table-column>
        <el-table-column prop="userName" label="用户"></el-table-column>
        <el-table-column prop="category" label="经书类型"></el-table-column>
        <el-table-column prop="count" label="次数"></el-table-column>
        <el-table-column prop="time" label="时间"></el-table-column>
        <el-table-column prop="comment" label="备注"></el-table-column>
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

    <el-dialog title="信息" :visible.sync="fromVisible" width="40%" :close-on-click-modal="false" destroy-on-close>
      <el-form :model="form" label-width="100px" style="padding-right: 50px" :rules="rules" ref="formRef">
        <el-form-item label="选择用户" prop="userName" v-if="user.role === 'ADMIN'">
          <el-autocomplete v-model="form.userName" :fetch-suggestions="querySearch" placeholder="请输入用户姓名"
            style="width: 100%" @select="handleSelect">
            <template slot-scope="{ item }">
              <div class="name-item">{{ item.value }}</div>
            </template>
          </el-autocomplete>
        </el-form-item>

        <el-form-item label="经文个数" prop="scriptureCount">
          <el-input v-model="form.scriptureCount" placeholder="请输入经文个数" @change="handleScriptureCountChange"></el-input>
        </el-form-item>

        <div v-for="(scripture, index) in form.scriptures" :key="index">
          <el-form-item :label="'经书类型 ' + (index + 1)" :prop="'scriptures[' + index + '].category'">
            <el-select v-model="scripture.category" style="width: 100%">
              <el-option v-for="item in scriptureList" :key="item.id" :value="item.name"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item :label="'次数 ' + (index + 1)" :prop="'scriptures[' + index + '].count'">
            <el-input v-model="scripture.count" placeholder="次数" :min="1"></el-input>
          </el-form-item>
        </div>

        <el-form-item label="自定义日期" prop="time">
          <el-date-picker v-model="form.time" type="datetime" placeholder="选择日期" style="width: 100%"></el-date-picker>
        </el-form-item>
        <el-form-item label="备注" prop="comment">
          <el-input type="textarea" v-model="form.comment" placeholder="备注"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="fromVisible = false">取 消</el-button>
        <el-button type="primary" @click="save">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Scripture",
  data() {
    return {
      tableData: [],
      summaryData: [],
      pageNum: 1,
      pageSize: 10,
      total: 0,
      category: null,
      start: null,
      end: null,
      fromVisible: false,
      form: {
        userName: '',
        scriptureCount: 1,
        scriptures: [{ category: '', count: '' }],
        time: '',
        comment: ''
      },
      user: JSON.parse(localStorage.getItem('xm-user') || '{}'),
      rules: {
        userName: [
          { required: true, message: '请选择用户类型', trigger: 'blur' }
        ],
        scriptureCount: [
          { required: true, message: '请输入经文个数', trigger: 'blur' }
        ],
        time: [
          { required: true, message: '请选择时间', trigger: 'blur' }
        ],
        comment: [
          { required: false }
        ]
      },
      ids: [],
      scriptureList: []
    }
  },
  created() {
    this.load(1);
    this.getScriptureList();
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
    getScriptureList() {
      this.$request.get('/scripture/selectAll').then(res => {
        this.scriptureList = res.data || [];
      });
    },
    handleAdd() {
      this.form = {
        userName: '',
        scriptureCount: 1,
        scriptures: [{ category: '', count: '' }],
        time: '',
        comment: ''
      };
      this.fromVisible = true;
    },
    handleEdit(row) {
      this.form = JSON.parse(JSON.stringify(row));
      this.fromVisible = true;
    },
    handleScriptureCountChange(value) {
      const count = Number(value);
      if (count && count > 0) {
        const scriptures = [];
        for (let i = 0; i < count; i++) {
          scriptures.push({ category: '', count: '' });
        }
        this.form.scriptures = scriptures;
      }
    },
    save() {
      this.$refs.formRef.validate((valid) => {
        if (valid) {
          const requests = this.form.scriptures.map(scripture => {
            const data = {
              userName: this.form.userName,
              category: scripture.category,
              count: scripture.count,
              time: this.form.time,
              comment: this.form.comment,
              userId: this.form.userId
            };
            return this.$request({
              url: '/registerScripture/add',
              method: 'POST',
              data
            });
          });
          Promise.all(requests).then(responses => {
            if (responses.every(res => res.code === '200')) {
              this.$message.success('保存成功');
              this.load(1);
              this.fromVisible = false;
            } else {
              this.$message.error('保存失败');
            }
          });
        }
      });
    },
    del(id) {
      this.$confirm('您确定删除吗？', '确认删除', { type: "warning" }).then(response => {
        this.$request.delete('/registerScripture/delete/' + id).then(res => {
          if (res.code === '200') {
            this.$message.success('操作成功');
            this.load(1);
          } else {
            this.$message.error(res.msg);
          }
        });
      }).catch(() => {});
    },
    handleSelectionChange(rows) {
      this.ids = rows.map(v => v.id);
    },
    delBatch() {
      if (!this.ids.length) {
        this.$message.warning('请选择数据');
        return;
      }
      this.$confirm('您确定批量删除这些数据吗？', '确认删除', { type: "warning" }).then(response => {
        this.$request.delete('/registerScripture/delete/batch', { data: this.ids }).then(res => {
          if (res.code === '200') {
            this.$message.success('操作成功');
            this.load(1);
          } else {
            this.$message.error(res.msg);
          }
        });
      }).catch(() => {});
    },
    load(pageNum) {
      if (pageNum) this.pageNum = pageNum;
      this.$request.get('/registerScripture/selectPage', {
        params: {
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          category: this.category,
          start: this.start,
          end: this.end,
        }
      }).then(res => {
        this.tableData = res.data?.list;
        this.total = res.data?.total;
        this.loadSummaryData();
      });
    },
    loadSummaryData() {
      this.$request.get('/registerScripture/selectAll', {
        params: {
          category: this.category,
          start: this.start,
          end: this.end,
        }
      }).then(res => {
        const data = res.data || [];
        const summary = data.reduce((acc, curr) => {
          const found = acc.find(item => item.category === curr.category);
          if (found) {
            found.totalCount += Number(curr.count);
          } else {
            acc.push({ category: curr.category, totalCount: Number(curr.count) });
          }
          return acc;
        }, []);
        this.summaryData = summary;
      });
    },
    reset() {
      this.category = null;
      this.start = null;
      this.end = null;
      this.load(1);
    },
    handleCurrentChange(pageNum) {
      this.load(pageNum);
    }
  }
}
</script>

<style scoped>
.name-item {
  display: flex;
  align-items: center;
}
.summary-board {
  margin-bottom: 20px;
}
</style>

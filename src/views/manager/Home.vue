<template>
  <div>
    <div class="card" style="padding: 15px; margin-bottom: 10px">
      您好，{{ user?.name }}！欢迎使用本系统
      <el-button type="primary" style="margin-left: 10px" @click="$router.push('/bill')">开始记账</el-button>
    </div>

    <div style="margin-bottom: 10px">
      <el-row :gutter="10">
        <el-col :span="8">
          <el-card>
            <div style="display: flex; align-items: center">
              <div style="width: 150px">
                <div style="font-size: 20px">账户余额</div>
              </div>
              <div style="flex: 1">
                <div style="font-size: 16px; color: red; font-weight: bold">￥ {{ ac.balance || 0 }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card>
            <div style="display: flex; align-items: center">
              <div style="width: 150px">
                <div style="font-size: 20px">账户支出</div>
              </div>
              <div style="flex: 1">
                <div style="font-size: 16px; color: green; font-weight: bold">￥ {{ ac.pay || 0 }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card>
            <div style="display: flex; align-items: center">
              <div style="width: 150px">
                <div style="font-size: 20px">账户收入</div>
              </div>
              <div style="flex: 1">
                <div style="font-size: 16px; color: orange; font-weight: bold">￥ {{ ac.income || 0 }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div style="display: flex; grid-gap: 10px; margin-bottom: 10px">
      <div style="width: 50%" class="card">
        <div style="font-weight: bold; font-size: 24px; margin-bottom: 20px">支出统计</div>
        <div v-for="item in payList" :key="item.id" style="margin-bottom: 6px">
          {{ item.category }} {{ item.money }}
          <el-progress :stroke-width="12" :percentage="item.percent" :color="colorList"></el-progress>
        </div>
      </div>

      <div style="width: 50%" class="card">
        <div style="font-weight: bold; font-size: 24px; margin-bottom: 20px">收入统计</div>
        <div v-for="item in incomeList" :key="item.id" style="margin-bottom: 6px">
          {{ item.category }} {{ item.money }}
          <el-progress :stroke-width="12" :percentage="item.percent" :color="colorList"></el-progress>
        </div>
      </div>
    </div>

    <div style="display: flex; grid-gap: 10px; margin-bottom: 10px">
      <div style="width: 50%" class="card">
        <div id="pie" style="width: 100%; height: 400px"></div>
      </div>
      <div style="width: 50%" class="card">
        <div id="pie1" style="width: 100%; height: 400px"></div>
      </div>
    </div>

    <!-- <div style="display: flex; margin: 10px 0">
      <div style="width: 50%;" class="card">
        <div style="margin-bottom: 30px; font-size: 20px; font-weight: bold">公告列表</div>
        <div>
          <el-timeline reverse slot="reference">
            <el-timeline-item v-for="item in notices" :key="item.id" :timestamp="item.time">
              <el-popover placement="right" width="200" trigger="hover" :content="item.content">
                <span slot="reference">{{ item.title }}</span>
              </el-popover>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
    </div> -->
  </div>
</template>

<script>
import * as echarts from 'echarts'

const pieOption = {
  title: {
    text: '账户支出分类统计',
    subtext: '比例图',
    left: 'center'
  },
  tooltip: {
    trigger: 'item'
  },
  legend: {
    orient: 'vertical',
    left: 'left'
  },
  series: [
    {
      type: 'pie',
      center: ['50%', '60%'],
      radius: '50%',
      data: [],
      label: {
        show: true,
        formatter(param) {
          return param.name + ' (' + param.percent + '%)';
        }
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
}

const pieOption1 = {
  title: {
    text: '账户收入分类统计',
    subtext: '比例图',
    left: 'center'
  },
  tooltip: {
    trigger: 'item'
  },
  legend: {
    orient: 'vertical',
    left: 'left'
  },
  series: [
    {
      type: 'pie',
      center: ['50%', '60%'],
      radius: '50%',
      data: [],
      label: {
        show: true,
        formatter(param) {
          return param.name + ' (' + param.percent + '%)';
        }
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
}

export default {
  name: 'Home',
  data() {
    return {
      user: JSON.parse(localStorage.getItem('xm-user') || '{}'),
      notices: [],
      ac: {},
      payList: [],
      incomeList: [],
      colorList: ['#f56c6c', '#e6a23c', '#5cb87a', '#1989fa', '#6f7ad3']
    }
  },
  created() {
    this.$request.get('/notice/selectAll').then(res => {
      this.notices = res.data || []
    })

    this.$request.get('/ac/selectAll', { params: { userId: this.user.id } }).then(res => {
      this.ac = res.data?.length ? res.data[0] : {}
    })
  },
  mounted() {
    if (this.user.role === 'USER') {
      this.loadUserData();
    } else if (this.user.role === 'ADMIN') {
      this.loadAdminData();
    }
  },
  methods: {
    // loadUserData() {
    //   // 支出饼图
    //   let pieDom = document.getElementById('pie');
    //   let pieChart = echarts.init(pieDom);

    //   // 收入饼图
    //   let pieDom1 = document.getElementById('pie1');
    //   let pieChart1 = echarts.init(pieDom1);


    //   this.$request.get('/bill/count', { params: { type: '支出' } }).then(res => {
    //     this.payList = res.data || []
    //     let arr = []
    //     this.payList.forEach(item => {
    //       arr.push({ name: item.category, value: item.money })
    //     })
    //     pieOption.series[0].data = arr
    //     pieChart.setOption(pieOption)
    //   })

    //   this.$request.get('/bill/count', { params: { type: '收入' } }).then(res => {
    //     this.incomeList = res.data || []

    //     let arr = []
    //     this.incomeList.forEach(item => {
    //       arr.push({ name: item.category, value: item.money })
    //     })
    //     pieOption1.series[0].data = arr
    //     pieChart1.setOption(pieOption1)
    //   })
    // },
    loadUserData() {
      let pieDom = document.getElementById('pie');
      let pieChart = echarts.init(pieDom);
      let pieDom1 = document.getElementById('pie1');
      let pieChart1 = echarts.init(pieDom1);

      Promise.all([
        this.$request.get('/bill/count', { params: { type: '支出' } }),
        this.$request.get('/bill/count', { params: { type: '收入' } })
      ]).then((results) => {
        let totalPay = 0, totalIncome = 0;
        let payArr = [], incomeArr = [];

        // 处理支出数据
        results[0].data.forEach(item => {
          payArr.push({ name: item.category, value: item.money });
          totalPay += parseFloat(item.money); // 确保金额为数字
        });

        // 设置支出饼图
        pieOption.series[0].data = payArr;
        pieChart.setOption(pieOption);

        // 处理收入数据
        results[1].data.forEach(item => {
          incomeArr.push({ name: item.category, value: item.money });
          totalIncome += parseFloat(item.money); // 确保金额为数字
        });

        // 设置收入饼图
        pieOption1.series[0].data = incomeArr;
        pieChart1.setOption(pieOption1);

        // 更新 payList 和 incomeList 并计算百分比
        this.payList = results[0].data.map(item => {
          let percent = totalPay > 0 ? (item.money / totalPay * 100).toFixed(2) : 0;
          return { ...item, percent };
        });

        this.incomeList = results[1].data.map(item => {
          let percent = totalIncome > 0 ? (item.money / totalIncome * 100).toFixed(2) : 0;
          return { ...item, percent };
        });

        // 计算并更新账户余额
        let calculatedBalance = totalIncome - totalPay;
        // this.ac = {
        //   balance: calculatedBalance,
        //   pay: totalPay,
        //   income: totalIncome
        // };
      }).catch((error) => {
        console.error('Error loading data:', error);
      });
    },


    loadAdminData() {
      let pieDom = document.getElementById('pie');
      let pieChart = echarts.init(pieDom);
      let pieDom1 = document.getElementById('pie1');
      let pieChart1 = echarts.init(pieDom1);

      Promise.all([
        this.$request.get('/bill/admin/count', { params: { type: '支出' } }),
        this.$request.get('/bill/admin/count', { params: { type: '收入' } })
      ]).then((results) => {
        let totalPay = 0, totalIncome = 0;
        let payArr = [], incomeArr = [];

        // 处理支出数据
        results[0].data.forEach(item => {
          payArr.push({ name: item.category, value: item.money });
          totalPay += parseFloat(item.money);  // 确保金额为数字
        });

        // 处理收入数据
        results[1].data.forEach(item => {
          incomeArr.push({ name: item.category, value: item.money });
          totalIncome += parseFloat(item.money);  // 确保金额为数字
        });

        console.log('总支出:', totalPay, '总收入:', totalIncome);  // 输出总支出和总收入

        // 设置饼图数据
        pieOption.series[0].data = payArr;
        pieChart.setOption(pieOption);
        pieOption1.series[0].data = incomeArr;
        pieChart1.setOption(pieOption1);

        // 更新 payList 和 incomeList 并计算百分比
        this.payList = results[0].data.map(item => {
          let percent = totalPay > 0 ? (item.money / totalPay * 100).toFixed(2) : 0;
          return { ...item };
        });

        this.incomeList = results[1].data.map(item => {
          let percent = totalIncome > 0 ? (item.money / totalIncome * 100).toFixed(2) : 0;
          return { ...item };
        });

        let calculatedBalance = totalIncome - totalPay;
        this.ac = {
          balance: calculatedBalance,
          pay: totalPay,
          income: totalIncome
        };
      }).catch((error) => {
        console.error('Error loading data:', error);
      });
    }






  }
}
</script>

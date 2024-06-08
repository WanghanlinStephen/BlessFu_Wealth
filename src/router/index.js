import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push (location) {
  return originalPush.call(this, location).catch(err => err)
}

const routes = [
  {
    path: '/',
    name: 'Manager',
    component: () => import('../views/Manager.vue'),
    redirect: '/home',  // 重定向到主页
    children: [
      { path: '403', name: 'NoAuth', meta: { name: '无权限' }, component: () => import('../views/manager/403') },
      { path: 'home', name: 'Home', meta: { name: '系统首页' }, component: () => import('../views/manager/Home') },
      { path: 'admin', name: 'Admin', meta: { name: '管理员信息' }, component: () => import('../views/manager/Admin') },
      { path: 'adminPerson', name: 'AdminPerson', meta: { name: '个人信息' }, component: () => import('../views/manager/AdminPerson') },
      { path: 'password', name: 'Password', meta: { name: '修改密码' }, component: () => import('../views/manager/Password') },
      { path: 'notice', name: 'Notice', meta: { name: '公告信息' }, component: () => import('../views/manager/Notice') },
      { path: 'email', name: 'Email', meta: { name: '邮件提醒' }, component: () => import('../views/manager/Email') },
      { path: 'user', name: 'User', meta: { name: '用户信息' }, component: () => import('../views/manager/User') },
      { path: 'userPerson', name: 'UserPerson', meta: { name: '个人信息' }, component: () => import('../views/manager/UserPerson') },
      { path: 'ac', name: 'Ac', meta: { name: '账户信息' }, component: () => import('../views/manager/Ac') },
      { path: 'category', name: 'Category', meta: { name: '账户信息' }, component: () => import('../views/manager/Category') },
      { path: 'bill', name: 'Bill', meta: { name: '我的账单' }, component: () => import('../views/manager/Bill') },
      { path: 'time', name: 'Time', meta: { name: '时间贡献' }, component: () => import('../views/manager/Time') },
      // { path: 'notebook', name: 'Notebook', meta: { name: '念经打卡' }, component: () => import('../views/manager/Notebook') },
      { path: 'registerScripture', name: 'RegisterScripture', meta: { name: '打卡经文' }, component: () => import('../views/manager/RegisterScripture') },
      { path: 'scripture', name: 'Scripture', meta: { name: '经文分类' }, component: () => import('../views/manager/Scripture') },
      // { path: 'plan', name: 'Plan', meta: { name: '存钱计划' }, component: () => import('../views/manager/Plan') },
      { path: 'planDetail', name: 'PlanDetail', meta: { name: '存钱计划明细' }, component: () => import('../views/manager/PlanDetail') },
    ]
  },
  { path: '/login', name: 'Login', meta: { name: '登录' }, component: () => import('../views/Login.vue') },
  { path: '/register', name: 'Register', meta: { name: '注册' }, component: () => import('../views/Register.vue') },
  { path: '*', name: 'NotFound', meta: { name: '无法访问' }, component: () => import('../views/404.vue') },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router

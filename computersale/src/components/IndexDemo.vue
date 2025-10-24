<template>
  <t-menu theme="light" default-value="item2" :collapsed="collapsed" @change="changeHandler" >
    <template #logo>
      <img :width="collapsed ? 35 : 136" :src="iconUrl" alt="logo" />
       <h1>电脑销售系统</h1>
    </template>
    <t-menu-group title="主导航">
      <t-menu-item value="item1">
        <template #icon>
          <t-icon name="app" />
        </template>
        <router-link to="/home">主页</router-link>
      </t-menu-item>
    </t-menu-group>
    <t-menu-group title="功能">
      <t-submenu title="订单管理" value="2-1">
        <template #icon>
          <t-icon name="server" />
        </template>
        <t-menu-item value="2-1-1">
          <router-link to="/order">查看订单</router-link>
        </t-menu-item>
        <t-menu-item value="2-1-2">
          <router-link to="/ordermoney">查询营业额</router-link>
        </t-menu-item>
      </t-submenu>

      <t-submenu title="维修单管理" value="2-2">
        <template #icon>
          <t-icon name="server" />
        </template>
        <t-menu-item value="2-2-1">
          <router-link to="/maintain">查看维修单</router-link>
        </t-menu-item>
        <t-menu-item value="2-2-2">
          <router-link to="/maintainmoney">查询维修费用</router-link>
        </t-menu-item>
      </t-submenu>

      <t-submenu title="财务管理" value="2-3">
        <template #icon>
          <t-icon name="server" />
        </template>
        <t-menu-item value="2-3-1">
          <router-link to="/total">查询总营收</router-link>
        </t-menu-item>
      </t-submenu>
      

    </t-menu-group>
    
    <template #operations>
      <t-button class="t-demo-collapse-btn" variant="text" shape="square" @click="changeCollapsed">
        <template #icon><t-icon name="view-list" /></template>
      </t-button>
    </template>
  </t-menu>


    <div class="manager-main-right">
          <router-view></router-view>
    </div>

    
  

</template>

<script setup>
// import router from '@/rooter';
import { ref } from 'vue';

const collapsed = ref(true);
const iconUrl = ref('https://tse4-mm.cn.bing.net/th/id/OIP-C.i3d7LGVW5jLLmU_5FMiLdAHaHa?w=193&h=193&c=7&r=0&o=5&dpr=1.3&pid=1.7');

const changeCollapsed = () => {
  collapsed.value = !collapsed.value;
  iconUrl.value = collapsed.value
    ? 'https://tse4-mm.cn.bing.net/th/id/OIP-C.i3d7LGVW5jLLmU_5FMiLdAHaHa?w=193&h=193&c=7&r=0&o=5&dpr=1.3&pid=1.7'
    : 'https://tdesign.gtimg.com/site/baseLogo-light.png';
};

const changeHandler = (active) => {
  console.log('change', active);
};
</script>

<style scoped>
@import "@/assets/css/manager.css";
</style>
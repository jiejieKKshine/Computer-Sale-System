<template>
  <div class="main-container">
    <h1 class="title">查询营业额和总利润</h1>
    <t-space direction="vertical" class="content-space">
      <div class="date-picker-container">
        <t-date-range-picker
          allow-input
          clearable
          format="YYYY-MM-DD HH:mm:ss"
          :default-time="['00:00:00', '22:22:22']"
          @pick="onPick"
          @change="onChange"
          v-model="dateRange"
        />
        <t-button @click="queryTotalRevenueAndProfit" class="query-button">查询</t-button>
      </div>
      <div v-if="revenue !== null && totalProfit !== null" class="results-container">
        <t-card :title="'营业额'" header-bordered class="card">
          {{ revenue }} 元
        </t-card>
        <t-card :title="'总利润'" header-bordered class="card">
          {{ totalProfit }} 元
        </t-card>
      </div>
    </t-space>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import axios from 'axios';

const revenue = ref(null);
const totalProfit = ref(null);
const dateRange = ref([null, null]);

const onPick = (value, context) => console.log('onPick:', value, context);
const onChange = (value, context) => {
  console.log('onChange:', value, context);
  console.log(
    'timestamp:',
    context.dayjsValue.map((d) => d.valueOf()),
  );
  console.log(
    'YYYYMMDD:',
    context.dayjsValue.map((d) => d.format('YYYYMMDD')),
  );
};

const queryTotalRevenueAndProfit = async () => {
  if (!dateRange.value[0] || !dateRange.value[1]) {
    MessagePlugin.warning('请选择日期范围');
    return;
  }

  try {
    const revenueResponse = await axios.get('/api/orders/revenue', {
      params: {
        startDate: dateRange.value[0],
        endDate: dateRange.value[1],
      },
    });

    const repairProfitResponse = await axios.get('/api/repairs/profit', {
      params: {
        startDate: dateRange.value[0],
        endDate: dateRange.value[1],
      },
    });

    revenue.value = revenueResponse.data.revenue;
    totalProfit.value = revenueResponse.data.profit + repairProfitResponse.data.profit;
    MessagePlugin.success('查询成功');
  } catch (error) {
    console.error('查询失败', error);
    MessagePlugin.error('查询失败');
  }
};
</script>

<style scoped>
.main-container {
  max-width: 1300px;
  margin: 0 auto;
  padding: 20px;
  background-image: url('https://pic.616pic.com/bg_w1180/00/01/42/1N4RVH64Vh.jpg!/fw/1120');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: top center;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  height: 100vh;
}

.title {
  text-align: center;
  margin-bottom: 20px;
  font-size: 24px;
  color: #fff;
}

.content-space {
  width: 100%;
}

.date-picker-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.query-button {
  margin-left: 10px;
}

.results-container {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.card {
  width: 48%;
  height: 200px;
  font-size: 18px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border: none;
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.8);
}
</style>
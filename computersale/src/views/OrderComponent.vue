<template>
  <!-- 搜索框代码 -->
  <t-space direction="vertical" size="large">
    <t-form :data="formData" :label-align="formData.labelAlign" :label-width="60">
      <t-form-item label="订单号" name="oid" style="display: flex; align-items: center;">
        <t-input v-model="formData.oid" style="flex-grow: 1; margin-right: 20px;"></t-input>
        <t-button theme="primary" type="submit" @click="handleQuery">查询</t-button>
      </t-form-item>
    </t-form>
  </t-space>

  <!-- 订单列表代码 -->
  <t-space direction="vertical">
    <!-- 按钮操作区域 -->
    <t-radio-group v-model="size" variant="default-filled">
      <t-radio-button value="medium">订单列表</t-radio-button>
    </t-radio-group>

    <!-- 当数据为空需要占位时，会显示 cellEmptyContent -->
    <t-table
      row-key="index"
      :data="data"
      :columns="columns"
      :stripe="stripe"
      :bordered="bordered"
      :hover="hover"
      :table-layout="tableLayout ? 'auto' : 'fixed'"
      :size="size"
      :pagination="pagination"
      :show-header="showHeader"
      cell-empty-content="-"
      resizable
      lazy-load
      @row-click="handleRowClick"
    >
    </t-table>
  </t-space>

  <!-- 订单详细对话框 -->
  <t-dialog
    v-model:visible="visible"
    header="订单详细"
    width="60%"
    :confirm-on-enter="true"
    :on-cancel="onCancel"
    :on-esc-keydown="onEscKeydown"
    :on-close-btn-click="onCloseBtnClick"
    :on-overlay-click="onOverlayClick"
    :on-close="close"
    :on-confirm="onConfirmAnother"
  >
    <t-space direction="vertical" style="width: 100%; overflow: auto; max-height: 400px;">
      <t-table
        row-key="index"
        :data="orderDetail.items"
        :columns="orderColumns"
        :stripe="true"
        :bordered="true"
        :hover="true"
        :table-layout="'auto'"
        :size="'medium'"
        :show-header="true"
        cell-empty-content="-"
        resizable
      >
      </t-table>
      <div style="text-align: right; margin-top: 10px;">
        <strong>订单总价: {{ orderDetail.total_price.toFixed(2) }}</strong>
      </div>
    </t-space>
  </t-dialog>
</template>

<script setup lang="jsx">
import { reactive, ref, onMounted } from 'vue';
import axios from 'axios';

const formData = reactive({
  labelAlign: 'right',
  oid: '',
});

const data = ref([]);
const total = ref(0);
const orderDetail = ref({ items: [], total_price: 0 });
const visible = ref(false);

const stripe = ref(true);
const bordered = ref(true);
const hover = ref(false);
const tableLayout = ref(false);
const size = ref('medium');
const showHeader = ref(true);

const columns = ref([
  { colKey: 'oid', title: '订单号', width: '100' },
  { colKey: 'order_time', title: '下单时间', width: '150' },
  { colKey: 'cid', title: '顾客号', width: '100' },
  { colKey: 'cname', title: '顾客姓名', width: '100' },
  { colKey: 'status', title: '订单状态', width: '100' },
  { colKey: 'total_price', title: '订单总价', width: '100' },
  { colKey: 'detail', title: '订单详细', width: '100', cell: (h, { row }) => {
    return <t-button theme="primary" onClick={() => showOrderDetail(row.oid)}>查看详细</t-button>;
  }},
  { colKey: 'confirm', title: '确认订单', width: '100', cell: (h, { row }) => {
    return (
      <t-button
        theme="primary"
        disabled={row.status !== '未确认'}
        onClick={() => confirmOrder(row.oid)}
      >
        确认订单
      </t-button>
    );
  }},
]);

const orderColumns = ref([
  { colKey: 'product_name', title: '商品名', width: '150' },
  { colKey: 'unit_price', title: '单价', width: '100' },
  { colKey: 'count', title: '数量', width: '100' },
  { colKey: 'number', title: '商品库存', width: '100' }, // 新增列
  { colKey: 'total_price', title: '总价', width: '100', cell: (h, { row }) => {
    return <span>{(row.unit_price * row.count).toFixed(2)}</span>;
  }},
]);

const handleRowClick = (e) => {
  console.log(e);
};

const pagination = {
  defaultCurrent: 1,
  defaultPageSize: 5,
  total: total.value,
};

const fetchData = async (oid = '') => {
  try {
    console.log('开始请求数据开始啦...');
    const response = await axios.get(oid ? `/api/orders/search` : `/api/orders`, {
      params: { oid }
    });
    console.log('请求数据成功:', response.data);
    console.log("查询id:", oid);
    data.value = response.data;
    total.value = response.data.length;
    pagination.total = total.value;
  } catch (error) {
    console.error('请求数据失败:', error);
  }
};

const handleQuery = () => {
  fetchData(formData.oid);
};

const showOrderDetail = async (oid) => {
  try {
    const response = await axios.get(`/api/orders/content`, { params: { oid } });
    orderDetail.value.items = response.data;
    orderDetail.value.total_price = orderDetail.value.items.reduce((acc, item) => {
      return acc + item.unit_price * item.count;
    }, 0);
    visible.value = true;
  } catch (error) {
    console.error('获取订单详细信息失败:', error);
  }
};

const confirmOrder = async (oid) => {
  try {
    // 获取订单详细信息
    const response = await axios.get(`/api/orders/content`, { params: { oid } });
    const orderItems = response.data;

    console.log('确认订单的信息:', orderItems);

    // 检查库存数量
    const insufficientStockItems = orderItems.filter(item => item.count > item.number);
    if (insufficientStockItems.length > 0) {
      console.error('库存不足的商品:', insufficientStockItems);
      alert('确认失败，以下商品库存不足:\n' + insufficientStockItems.map(item => item.product_name).join(', '));
      return;
    }

    // 向后端发送修改产品数量的信息
    await axios.post(`/api/orders/confirm`, { items: orderItems });

    fetchData();
  } catch (error) {
    console.error('确认订单失败:', error);
  }
};

const onConfirmAnother = (context) => {
  console.log('点击了确认按钮', context);
  visible.value = false;
};

const close = (context) => {
  console.log('关闭弹窗，点击关闭按钮、按下ESC、点击蒙层等触发', context);
};

const onCancel = (context) => {
  console.log('点击了取消按钮', context);
};

const onEscKeydown = (context) => {
  console.log('按下了ESC', context);
};

const onCloseBtnClick = (context) => {
  console.log('点击了关闭按钮', context);
};

const onOverlayClick = (context) => {
  console.log('点击了蒙层', context);
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
/* 样式范围限定在当前组件 */
</style>
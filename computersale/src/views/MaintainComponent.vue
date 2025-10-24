<template>
  <!-- 搜索框代码 -->
  <t-space direction="vertical" size="large">
    <t-form :data="formData" :label-align="formData.labelAlign" :label-width="60">
      <t-form-item label="维修单号" name="aid" style="display: flex; align-items: center;">
        <t-input v-model="formData.aid" style="flex-grow: 1; margin-right: 20px;"></t-input>
        <t-button theme="primary" type="submit" @click="handleQuery">查询</t-button>
      </t-form-item>
    </t-form>
  </t-space>

  <!-- 维修单列表代码 -->
  <t-space direction="vertical">
    <!-- 按钮操作区域 -->
    <t-radio-group v-model="size" variant="default-filled">
      <t-radio-button value="medium">维修单列表</t-radio-button>
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

  <!-- 维修单编辑对话框 -->
  <t-dialog
    v-model:visible="visible"
    header="编辑维修单"
    width="60%"
    :confirm-on-enter="true"
    :on-cancel="onCancel"
    :on-esc-keydown="onEscKeydown"
    :on-close-btn-click="onCloseBtnClick"
    :on-overlay-click="onOverlayClick"
    :on-close="close"
    :on-confirm="onConfirm"
    :confirm-button-props="{ disabled: isRepairCompleted }" 
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
        <!-- <strong>订单总价: {{ orderDetail.total_price.toFixed(2) }}</strong> -->
      </div>
    </t-space>

    <t-form :data="editFormData" :label-align="'right'" :label-width="80">
      <div style="margin-top: 10px; color: red;">在保修期内，免费维修或换新</div>
      <t-form-item label="售后详细" name="sales_detail">
        <t-input v-model="editFormData.sales_detail"></t-input>
      </t-form-item>
      <t-form-item label="售后方式" name="way">
        <t-input v-model="editFormData.way"></t-input>
      </t-form-item>
      <t-form-item label="服务时间" name="service_time">
        <t-date-picker v-model="editFormData.service_time" format="YYYY-MM-DD HH:mm:ss"></t-date-picker>
      </t-form-item>
      <t-form-item label="职工号" name="eid">
        <t-select v-model="editFormData.eid" placeholder="请选择职工号" :options="employeeNumberOptions" @change="onEmployeeNumberChange"></t-select>
      </t-form-item>
      <t-form-item label="职工名" name="ename">
        <t-select v-model="editFormData.ename" placeholder="请选择职工名" :options="employeeNameOptions" @change="onEmployeeNameChange"></t-select>
      </t-form-item>
      <div style="margin-top: 10px; color: red;">上门维修需加在替换的产品售价基础上加20元服务费</div>
      <t-form-item label="成本费" name="cost">
        <t-input v-model="editFormData.cost" @input="calculateProfit"></t-input>
      </t-form-item>
      <t-form-item label="服务费" name="service_fee">
        <t-input v-model="editFormData.service_fee" @input="calculateProfit"></t-input>
      </t-form-item>
      <t-form-item label="利润" name="profit">
        <t-input v-model="editFormData.profit" disabled></t-input>
      </t-form-item>
    </t-form>
  </t-dialog>

  <!-- 成功提示对话框 -->
  <!-- 成功提示对话框 -->
<t-dialog v-model:visible="successVisible" header="提示" @close="onSuccessClose">
  确认成功！
  <template #footer>
    <t-button theme="primary" @click="onSuccessClose">确认</t-button>
  </template>
</t-dialog>

<!-- 失败提示对话框 -->
<t-dialog v-model:visible="failureVisible" header="提示" @close="onFailureClose">
  确认失败！
  <template #footer>
    <t-button theme="primary" @click="onFailureClose">确认</t-button>
  </template>
</t-dialog>

</template>

<script setup lang="jsx">
import { reactive, ref, onMounted } from 'vue';
import axios from 'axios';
import dayjs from 'dayjs';

const formData = reactive({
  labelAlign: 'right',
  aid: '',
});

const data = ref([]);
const total = ref(0);
const editFormData = reactive({ sales_detail: '', way: '', service_time: '', eid: '', ename: '', cost: '', service_fee: '', profit: '' });
const orderDetail = ref({ items: [], total_price: 0 });
const visible = ref(false);
const successVisible = ref(false); // 成功提示对话框的显示状态
const failureVisible = ref(false); // 失败提示对话框的显示状态
const isRepairCompleted = ref(false); // 新增状态变量用于禁用确认按钮

const stripe = ref(true);
const bordered = ref(true);
const hover = ref(false);
const tableLayout = ref(false);
const size = ref('medium');
const showHeader = ref(true);

const columns = ref([
  { colKey: 'aid', title: '维修单号', width: '100' },
  { colKey: 'apply_time', title: '申请时间', width: '150' },
  { colKey: 'oid', title: '关联订单号', width: '100' }, // 新增列
  { colKey: 'cname', title: '顾客名', width: '80' },
  { colKey: 'status', title: '订单状态', width: '100' },
  { colKey: 'sales_detail', title: '售后详细', width: '150' },
  { colKey: 'way', title: '售后方式', width: '100' },
  { colKey: 'service_time', title: '服务时间', width: '150' },
  { colKey: 'ename', title: '职工名', width: '100' },
  { colKey: 'profit', title: '利润', width: '100' }, // 修改列标题为利润
  { colKey: 'edit', title: '编辑信息', width: '100', cell: (h, { row }) => {
    return <t-button theme="primary" onClick={() => showEditDialog(row)}>编辑</t-button>;
  }},
  { colKey: 'confirm', title: '确认', width: '100', cell: (h, { row }) => {
    return (
      <t-button
        theme="primary"
        disabled={row.status !== '待维修'}
        onClick={() => confirmRepair(row.aid)}
      >
        确认
      </t-button>
    );
  }},
]);

const orderColumns = ref([
  { colKey: 'pid', title: '产品号', width: '100' }, // 添加产品号列
  { colKey: 'product_name', title: '商品名', width: '150' },
  { colKey: 'unit_price', title: '单价', width: '100' },
  { colKey: 'count', title: '数量', width: '100' },
  { colKey: 'number', title: '商品库存', width: '100' },
  { colKey: 'cost', title: '进价', width: '100' },
  { colKey: 'warranty', title: '是否在保修期内', width: '150', cell: (h, { row }) => {
    return row.warranty; // Display the warranty status
  }},
  { colKey: 'exchange_count', title: '更换数量', width: '100', cell: (h, { row }) => { // 添加更换数量列
    return <t-input v-model={row.exchange_count} />;
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

const fetchData = async (aid = '') => {
  try {
    console.log('开始请求数据开始啦...');
    const response = await axios.get(aid ? `/api/repairs/search` : `/api/repairs`, {
      params: { aid }
    });
    console.log('请求数据成功:', response.data);
    console.log("查询id:", aid);
    data.value = response.data;
    total.value = response.data.length;
    pagination.total = total.value;
  } catch (error) {
    console.error('请求数据失败:', error);
  }
};

const fetchEmployeeData = async () => {
  try {
    const response = await axios.get('/api/employee');
    const employees = response.data;
    employeeOptions.value = employees;
    employeeNumberOptions.value = employees.map(emp => ({ label: emp.eid, value: emp.eid }));
    employeeNameOptions.value = employees.map(emp => ({ label: emp.ename, value: emp.ename }));
  } catch (error) {
    console.error('获取员工数据失败:', error);
  }
};

const handleQuery = () => {
  fetchData(formData.aid);
};

const showEditDialog = async (row) => {
  try {
    const response = await axios.get(`/api/orders/content`, { params: { oid: row.oid } });
    const applyTime = dayjs(row.apply_time);
    console.log('申请时间:', applyTime.format('YYYY-MM-DD HH:mm:ss'));

    orderDetail.value.items = response.data.map(item => {
      console.log('下单时间:', item.order_time);
      const orderTime = dayjs(item.order_time);
      const warrantyPeriodYears = item.warranty_period;
      console.log('订单保修期:', warrantyPeriodYears);
      const warrantyEndDate = orderTime.add(warrantyPeriodYears, 'year');
      console.log('保修期结束时间:', warrantyEndDate.format('YYYY-MM-DD HH:mm:ss'));

      const isUnderWarranty = warrantyEndDate.isAfter(applyTime) ? '是' : '否';
      // 保留上次更改的值
      const existingItem = orderDetail.value.items.find(i => i.pid === item.pid);
      const exchange_count = existingItem ? existingItem.exchange_count : 0;

      return { ...item, warranty: isUnderWarranty, pid: item.pid, exchange_count };
    });

    console.log('订单详情:', orderDetail.value.items);
  } catch (error) {
    console.error('获取订单详细信息失败:', error);
  }

  await fetchEmployeeData();

  editFormData.aid = row.aid;
  editFormData.sales_detail = row.sales_detail;
  editFormData.way = row.way;
  editFormData.service_time = row.service_time;
  editFormData.eid = row.eid;
  editFormData.ename = row.ename;
  editFormData.cost = row.cost;
  editFormData.service_fee = row.service_fee;
  editFormData.profit = row.profit;
  isRepairCompleted.value = (row.status === '已维修'); // 根据订单状态设置确认按钮是否禁用
  visible.value = true;
};

const confirmRepair = async (aid) => {
  console.log('维修单已确认:', aid);

  // 获取当前维修单的信息
  const repairOrder = data.value.find(item => item.aid === aid);
  console.log('维修单信息:', repairOrder);

  // 获取并转换 service_time 格式
  repairOrder.service_time = dayjs(repairOrder.service_time).format('YYYY-MM-DDTHH:mm:ss');

  // 更新维修单状态为"已维修"
  repairOrder.status = '已维修';

  // 获取编辑表单里的商品pid和更换数量
  const productUpdates = orderDetail.value.items.map(item => ({
    pid: item.pid,
    exchangeCount: parseInt(item.exchange_count, 10),
  }));

  try {
    // 发送维修单信息到后端
    console.log('维修单信息', repairOrder);
    await axios.post('/api/repairs/update', repairOrder);

    // 发送产品pid和更换数量到后端
    console.log('啦啦啦维修单商品信息', productUpdates);
    await axios.post('/api/product/update', productUpdates);

    console.log('数据已成功发送到后端');
    successVisible.value = true; // 显示成功提示对话框
  } catch (error) {
    console.error('发送数据到后端失败:', error);
    failureVisible.value = true; // 显示失败提示对话框
  }
  location.reload();
};

const onConfirm = () => {
  // 检查更换数量是否小于商品库存
  const isValid = orderDetail.value.items.every(item => item.exchange_count <= item.number);
  if (!isValid) {
    failureVisible.value = true; // 显示失败提示对话框
    return;
  }
  
  console.log('编辑后的数据:', editFormData);
  visible.value = false;
  const index = data.value.findIndex(item => item.aid === editFormData.aid);
  if (index !== -1) {
    data.value[index] = { ...data.value[index], ...editFormData }; // 更新列表中的数据
  }
  successVisible.value = true; // 显示成功提示对话框
};

const onSuccessClose = () => {
  successVisible.value = false;
};

const onFailureClose = () => {
  failureVisible.value = false;
};

const employeeOptions = ref([]);
const employeeNumberOptions = ref([]);
const employeeNameOptions = ref([]);

const onEmployeeNumberChange = (value) => {
  const selectedEmployee = employeeOptions.value.find(emp => emp.eid === value);
  if (selectedEmployee) {
    editFormData.ename = selectedEmployee.ename;
  }
};

const onEmployeeNameChange = (value) => {
  const selectedEmployee = employeeOptions.value.find(emp => emp.ename === value);
  if (selectedEmployee) {
    editFormData.eid = selectedEmployee.eid;
  }
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

// 新增计算利润函数
const calculateProfit = () => {
  editFormData.profit = (parseFloat(editFormData.service_fee) || 0) - (parseFloat(editFormData.cost) || 0);
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
/* 样式范围限定在当前组件 */
</style>
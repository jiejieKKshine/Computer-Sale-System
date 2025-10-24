import Order from '../views/OrderComponent.vue'
import Maintain from '../views/MaintainComponent.vue'
import Home from '../views/home.vue'
import OrderMoney from '../views/OrderMoney.vue'
import MainMoney from '../views/MainMoney.vue'
import { createRouter, createWebHistory } from 'vue-router'
import TotalMoney from '@/views/TotalMoney.vue'


const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/order',
            name: 'order',
            component: Order

        },
        {
            path: '/maintain',
            name: 'maintain',
            component: Maintain
        },
        {
            path: '/home',
            name: 'home',
            component: Home
        },
        {
            path: '/ordermoney',
            name: 'ordermoney',
            component: OrderMoney
        },
        {
            path: '/maintainmoney',
            name: 'maintainmoney',
            component: MainMoney
        },
        {
            path: '/total',
            name: 'total',
            component: TotalMoney
        }
    ]
})
export default router
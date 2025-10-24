<template>
    <div>
        你好
    </div>
    <!-- style绑定 -->
    <p :style="{color:activeColor,fontSize:fontSize + 'px'}">样式绑定1</p>
    <p :style="styleObj">样式绑定2</p>
    <!-- 侦听器 -->
    <p>{{ message }}</p>
    <button @click="updateHandle">修改数据</button>
    <!-- 表单数据绑定 -->
     <form action="">
        <!-- 将输入框的文字与data中的message绑定 -->
        <input type="text" v-model.lazy="message">
        <p>{{ message }}</p>
        <input type="checkbox" id="checkbox" v-model="checked">
        <label for="checkbox">{{ checked }}</label>
     </form>
    <!-- 模板引用，获取dom节点 -->
     <div ref="container" class="container">{{ message }} </div>
     <button @click="getElementHandle">获取元素</button>
     <!-- 组件引用及嵌套 -->
      <!-- 引入，注入，使用标签 -->
    <!-- 组件注册方式 -->
     <!-- 1.局部注册 2.全局注册 -->
    <!-- 组件传递数据props,父子间传递，可以传多种类型（字符串，数字，对象，数组。。），但子元素不能修改 -->
    <!-- 组件传递-props校验，类型限制，默认值处理，必选项限制 -->
    <!-- 组件事件：组件传递数据，通过子级元素触发父级函数，子元素的数据传给父元素this.$emit('事件名称',参数) -->
     <!-- 组件传递数据的props也可以子传父 -->
    <!-- 使用插槽，可以将父组件的模板内容插入到子组件的指定位置，可以实现更灵活的布局，具名插槽 -->
      <!-- 也可以将子元素数据进行插槽，但是要先传给父亲再传给儿子 -->
       
</template>

<script >
export default {
    
    data() {
        return {         
                activeColor: 'blue',
                fontSize: 16,
                styleObj: {
                    color: 'red',
                    fontSize: '16px'
                },
                message: 'Hello Vue.js!',
                checked: false
            }
        },
    methods: {
        updateHandle(){
            this.message = '你好'
        },
        getElementHandle(){
            // this.$refs.container获取dom节点
            this.$refs.container.innerHTML='哈哈哈哈'
        }
    },
    watch: {
        // 函数名必须与侦听的数据对象保持同名
        message(newVal, oldVal) {
            // 数据发生变化，自动执行函数
            console.log('newVal:', newVal, 'oldVal:', oldVal)
        }
    }

    }
    
 
 </script>

<!-- scoped让当前样式只在当前组件中生效 -->
 <style scoped>
    .container{
        color: red;
    }
</style>
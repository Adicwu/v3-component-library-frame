import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    target: 'modules',
    outDir: 'es',
    rollupOptions: {
      // 排除不需要打包的内容
      external: ['vue', /\.less/],
      // 打包输入的入口文件
      input: ['index.ts'],
      // 打包输出为cjs(CommonJS)和esm(ESModule)两种形式
      output: [
        {
          format: 'es',
          entryFileNames: '[name].js',
          dir: resolve(__dirname, './dist/es'),
          preserveModules: true
        },
        {
          format: 'cjs',
          entryFileNames: '[name].js',
          dir: resolve(__dirname, './dist/lib'),
          preserveModules: true
        }
      ]
    },
    lib: {
      entry: './index.ts',
      name: 'sora'
    }
  },
  plugins: [
    vue(),
    // ts类型处理
    dts({
      entryRoot: 'src',
      outputDir: [
        resolve(__dirname, './dist/es/src'),
        resolve(__dirname, './dist/lib/src')
      ],
      // 这里需要引入我们项目根目录的ts配置，当然你也可以自己再下一个配置
      tsConfigFilePath: '../../tsconfig.json' 
    }),
    /**
     * 自定义插件
     * 通过读取已打包文件，将组件中样式的导入.less字符串替换为.css；配合前面写的gulp工具
     */
    {
      name: 'lessSuffixReplace',
      generateBundle(_, bundle) {
        const keys = Object.keys(bundle)
        for (const key of keys) {
          const bundler: any = bundle[key]
  
          this.emitFile({
            type: 'asset',
            fileName: key,
            source: bundler.code.replace(/\.less/g, '.css')
          })
        }
      }
    }
  ]
})
import { spawn } from "child_process";
import { dest, parallel, series, src } from "gulp";
import autoprefixer from "gulp-autoprefixer";
import less from "gulp-less";
import { resolve } from "path";

const rimraf = require("rimraf");
const componentPath = resolve(__dirname, "../");

/**
 * 终端指令
 */
const run = (command: string, path: string) => {
  //cmd表示命令，args代表参数，如 rm -rf  rm就是命令，-rf就为参数
  const [cmd, ...args] = command.split(" ");
  return new Promise((resolve, _) => {
    const app = spawn(cmd, args, {
      cwd: path, //执行命令的路径
      stdio: "inherit", //输出共享给父进程
      shell: true, //mac不需要开启，windows下git base需要开启支持
    });
    //执行完毕关闭并resolve
    app.on("close", resolve);
  });
};

/**
 * less 编译
 */
const lessTranspile = () => {
  return src(`${componentPath}/src/**/style/**.less`) // 匹配项目指定目录结构下less文件
    .pipe(less()) // less转css
    .pipe(autoprefixer()) // css兼容前缀补充
    .pipe(dest(`${componentPath}/dist/lib/src`)) // 放入lib包
    .pipe(dest(`${componentPath}/dist/es/src`)); // 放入es包
};

/**
 * 在sora下的终端执行 pnpm run build
 */
export const componentTranspile = async () => {
  return run('pnpm run build', componentPath)
}


export default series(
  // 同步执行删除
  async (e) =>
    new Promise((onFull) => rimraf(`${componentPath}/dist`, e, onFull)),
  /**
   * 并发执行打包
   * lessTranspile与componentTranspile构建出来的结果目录是一致的，此时两个结果会合并
   */
  parallel(
    async () => lessTranspile(),
    async () => componentTranspile()
  )
);

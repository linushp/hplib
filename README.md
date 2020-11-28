# lerna-app

### 开始了解

1. 仅支持 yarn workspace
2. 了解 lerna, monorepo 多模块项目开发相关的知识
3. 仅使用 typescript

### 开发

1. npx lerna bootstrap
2. 找到对应的 npm script 脚本启动

   `lerna run start --scope=XXXXX --stream`

### 包使用说明

1. 在项目根路径中复制当前项目中的 .npmrc，确保 npm 私有仓库能够使用。
2. 找到需要的 npm 包，使用 yarn（其他包管理器不保证可用）进行安装。
3. 安装对应的包到指定的目录：

   `lerna add react --scope=XXXX`

### package

##### 添加新的 package

1. 创建 package 目录

   ```zsh
   mkdir packages/package-name
   cd package-name
   yarn init

   ```

4) 完成 commit 之后，发布新的 package
   ```zsh
   lerna publish
   ```

# 使用官方 Node.js 镜像作为基础镜像
FROM node:14

# 设置工作目录
WORKDIR /usr/src/app

# 复制 package.json 并安装依赖
COPY package*.json ./
RUN npm install

# 复制项目文件
COPY . .

# 设置环境变量
ENV PORT 3452

# 暴露端口
EXPOSE 3452

# 启动应用
CMD ["node", "index.js"]

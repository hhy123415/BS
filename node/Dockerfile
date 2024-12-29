# 使用 Node.js 官方镜像作为基础镜像
FROM node:22

# 设置工作目录
WORKDIR /usr/src/app

# 将当前目录的所有文件复制到容器中
COPY . .

# 安装依赖
RUN apt-get update && apt-get install -y \
    fonts-dejavu-core \
    fonts-dejavu-extra \
    ca-certificates \
    fonts-liberation \
    fonts-noto-color-emoji \
    lsb-release \
    xdg-utils \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libexpat1 \
    libgbm1 \
    libglib2.0-0 \
    libnspr4 \
    libnss3 \
    libpango1.0-0 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libxkbcommon0 \
    libgconf-2-4 \
    libu2f-udev \
    libv4l-0 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*


RUN npm install --registry=https://registry.npmmirror.com/ &&\
    npx puppeteer browsers install chrome@131.0.6778.69

# 监听端口 3452
EXPOSE 3452

# 启动应用
CMD ["node", "app.js"]


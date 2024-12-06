//for jd
const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: false, defaultViewport: { width: 1920, height: 1080 },
        args: ['--start-maximized']
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    // 打开页面
    await page.goto('https://search.jd.com/Search?keyword=%E6%89%8B%E6%9C%BA', {
        waitUntil: 'networkidle2',
        timeout: 15000
    });

    // 模拟滚动
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 100; // 每次滚动的距离
            const timer = setInterval(() => {
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= document.body.scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });

    // 提取图片链接
    const hrefArr = await page.evaluate(() => {
        let arr = [];
        const imgNodes = document.querySelectorAll('img');
        imgNodes.forEach((item) => {
            arr.push(item.src);
        });
        return arr;
    });

    console.log(hrefArr);
    //await browser.close();
})();

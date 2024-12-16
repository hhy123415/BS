// 引入express
const express = require("express")
//这个组件用于接收post数据
const bodyParser = require("body-parser")
var jwt = require("jsonwebtoken")
//用于抓包
const puppeteer = require('puppeteer');
// 创建服务器对象
const app = express()
const mysql = require("mysql")
const alert = require("alert-node")
const conn = mysql.createConnection({
	host: "127.0.0.1",
	user: "root",
	password: "3452",
	database: "bs",
	multipleStatements: true,
})

app.use(express.static(__dirname + '/' + "public"));
app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({ extended: false }))
// app.use(bodyParser.json({ type: "application/*+json" }))
//解决跨域
app.all("*", function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*")
	res.header("Access-Control-Allow-Headers", "Content-Type")
	res.header("Access-Control-Allow-Methods", "*")
	res.header("Content-Type", "application/json;charset=utf-8")
	next()
})

app.post("/login", (req, res) => {
	var userName = req.body.username
	var passWord = req.body.password
	if (!userName || !passWord) {
		alert("请输入用户名和密码进行登录！");
		return
	}
	const sqlStr = "select * from users WHERE userName=? AND passWord=?"
	conn.query(sqlStr, [userName, passWord], (err, result) => {
		if (err) throw err
		if (result.length > 0) {
			// 生成token
			var token = jwt.sign(
				{
					identity: result[0].identity,
					userName: result[0].userName,
				},
				"secret",
				{ expiresIn: "1h" },
			)
			console.log(token);
			res.redirect("/home.html");
			// 如果没有登录成功，则返回登录失败
		} else {
			// 判断token
			if (req.headers.authorization == undefined || req.headers.authorization == null) {
				if (req.headers.authorization) {
					var token = req.headers.authorization.split(" ")[1] // 获取token
				}
				jwt.verify(token, "secret", (err, decode) => {
					if (err) {
						alert("登录失败！");
					}
				})
			}
		}
	})
})

//post请求
app.post("/register", (req, res) => {
	var userName = req.body.username
	var passWord = req.body.password1
	var email = req.body.email
	const result = `SELECT * FROM users WHERE userName = '${userName}'`
	conn.query(result, [userName], (err, results) => {
		if (results.length >= 1) {
			//如果有相同用户名，则注册失败，用户名重复
			alert("用户名已存在！");
			return;
		}
		else {
			const result2 = `SELECT * FROM users WHERE email = '${email}'`
			conn.query(result2, [email], (err, results) => {
				if (results.length >= 1) {
					//如果有相同用户名，则注册失败，用户名重复
					alert("邮箱已存在！");
					return;
				}
				else {
					const sqlStr = "insert into users(username,password,email) values(?,?,?)"
					conn.query(sqlStr, [userName, passWord, email], (err, results) => {
						if (results && results.affectedRows === 1) {
							alert("注册成功！");
							res.redirect("/home.html");
						}
						else {
							alert("注册失败！");
							return;
						}
					})
				}
			})
		}
	})

	console.log("接收", req.body)
})

app.post("/result", (req, res) => {
	var name = req.body.product;
	let suning_url = 'https://search.suning.com/' + name;

	(async () => {
		const browser = await (puppeteer.launch({ headless: true }));
		const page = await browser.newPage();

		// 进入页面
		await page.goto(suning_url);
		const maxPage = 2;

		//sql语句
		const sqlStr1 = "insert into products(name,image_url) values(?,?)"
		const sqlStr2 = "insert into productprices(username,password,email) values(?,?,?)"

		for (let i = 0; i < maxPage; i++) {
			// 因为苏宁页面的商品信息用了懒加载，所以需要把页面滑动到最底部，保证所有商品数据都加载出来
			await autoScroll(page);
			const result = await page.evaluate(() => {
				let itemList = document.querySelectorAll('div.product-box')
				for (var element of itemList) {
					const name = element.querySelector('div.title-selling-point').innerText;
					const price = element.querySelector('span.def-price').innerText;
					const img = element.querySelector('img').src;
				}
				return;
			})

			// 当当前页面并非最大页的时候，跳转到下一页
			if (i < maxPage - 1) {
				const nextPageUrl = await page.evaluate(() => {
					const url = $('#nextPage').get(0).href;
					return url;
				});
				await page.goto(nextPageUrl, { waitUntil: 'networkidle0' });
			}

			function autoScroll(page) {
				return page.evaluate(() => {
					return new Promise((resolve) => {
						var totalHeight = 0;
						var distance = 100;
						// 每200毫秒让页面下滑100像素的距离
						var timer = setInterval(() => {
							var scrollHeight = document.body.scrollHeight;
							window.scrollBy(0, distance);
							totalHeight += distance;
							if (totalHeight >= scrollHeight) {
								clearInterval(timer);
								resolve();
							}
						}, 200);
					})
				});
			}
		}
	}
	);

	res.redirect("/result.html");
})

//开启监听
app.listen(3452, () => {
	console.log("3452端口已经启动。。。")
})
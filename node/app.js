// 引入express
const express = require("express")
//这个组件用于接收post数据
const bodyParser = require("body-parser")
var jwt = require("jsonwebtoken")
//用于抓包
const puppeteer = require('puppeteer');
// 创建服务器对象
const app = express()

app.use(express.static(__dirname + '/' + "public"));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.engine('html', require('ejs').__express);
app.set('view engine', 'html');
app.set("views", __dirname + '/' + "public"); // 设置模板文件存放目录

const mysql = require("mysql")
const alert = require("alert-node")
const conn = mysql.createConnection({
	host: "127.0.0.1",
	user: "root",
	password: "3452",
	database: "bs",
	multipleStatements: true,
})

// 解决跨域
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
	let suning_url = 'https://search.suning.com/' + name + '/';
	let dangdang_url = 'https://search.dangdang.com/?key='+name+'&show=list';
	let arr =[];
	(async () => {
		const browser = await (puppeteer.launch({ headless: false }));
		const page1 = await browser.newPage();
		const page2 = await browser.newPage();
		await page1.goto(suning_url);
		await autoScroll(page1);
		const result1 = await page1.evaluate(() => {
			const arrList = []
			let itemList = document.querySelectorAll('div.product-box')
			for (var element of itemList) {
				const List = {}
				const name = element.querySelector('div.title-selling-point').innerText;
				const price = element.querySelector('span.def-price').innerText;
				const img = element.querySelector('img').src;
				const pid = element.querySelector('a').getAttribute("sa-data").substring(24, 35);
				List.name = name;
				List.price = price;
				List.img = img;
				List.pid = pid;
				List.pingtai = 'suning';
				arrList.push(List);
			}
			return arrList;
		})

		await page2.goto(dangdang_url);
		await autoScroll(page2);
		const result2 = await page2.evaluate(() => {
			const arrList = []
            let itemList = document.querySelectorAll('ul.bigimg>li')
            for (var element of itemList) {
                const List = {}
                const name = element.querySelector('a.pic').title;
                const price = element.querySelector('p.price>span.search_now_price').innerText;
                const img = element.querySelector('a.pic>img').src;
                const pid = element.id;
                List.name = name;
                List.price = price;
                List.img = img;
                List.pid =pid;
				List.pingtai = 'dangdang';
                arrList.push(List);
            }
            return arrList;
		})

		//sql语句
		const sqlStr1 = "insert into products(product_id,name,image_url) values(?,?,?) ON DUPLICATE KEY UPDATE name = ?, image_url = ?"
		const sqlStr2 = "insert into prices(username,password,email) values(?,?,?)"
		const queries = (result1.concat(result2)).map((item) => {
			return new Promise((resolve, reject) => {
				conn.query(
					sqlStr1,
					[item.pid, item.name, item.img, item.name, item.img],
					(err, results) => {
						if (err) {
							reject(err);
						} else {
							resolve(item);
						}
					}
				);
			});
		});
		
		Promise.all(queries)
			.then((processedItems) => {
				arr=processedItems;
				res.type('html');
				res.render("result", { data: arr });
			})
			.catch((err) => {
				console.error(err);
			});
				
		browser.close();

		function autoScroll(page) {
			return page.evaluate(() => {
				return new Promise((resolve) => {
					var totalHeight = 0;
					var distance = 500;
					// 每200毫秒让页面下滑500像素的距离
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
	})();
})

//开启监听
app.listen(3452, () => {
	console.log("3452端口已经启动。。。")
})
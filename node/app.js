// 引入express
const express = require("express")
//这个组件用于接收post数据
const bodyParser = require("body-parser")
var jwt = require("jsonwebtoken")
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

//开启监听
app.listen(8080, () => {
	console.log("8080端口已经启动。。。")
})
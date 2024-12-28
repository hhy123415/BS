// 引入express
const express = require("express")
//这个组件用于接收post数据
const bodyParser = require("body-parser")
var jwt = require("jsonwebtoken")
//用于抓包
const puppeteer = require('puppeteer');
// 创建服务器对象
const app = express()

const cron = require("node-cron");
const nodemailer = require("nodemailer"); // 邮件通知

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

//请求登录
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
			res.type('html');
			res.render("home", { username: userName });
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

//请求注册
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

//进行搜索
app.post("/result", (req, res) => {
	var username = req.body.username;
	var name = req.body.product;
	let suning_url = 'https://search.suning.com/' + name + '/';
	let dangdang_url = 'https://search.dangdang.com/?key=' + name + '&show=list';
	let arr = [];
	(async () => {
		const browser = await (puppeteer.launch({ headless: true }));
		const page1 = await browser.newPage();
		const page2 = await browser.newPage();
		await page1.goto(suning_url);
		await autoScroll(page1);
		const result1 = await page1.evaluate(() => {
			const arrList = []
			let itemList = document.querySelectorAll('div.product-box')
			let i = 0;
			for (var element of itemList) {
				if (i > 29) break;
				const List = {}
				const name = element.querySelector('div.title-selling-point').innerText;
				const price = element.querySelector('span.def-price').innerText;
				const img = element.querySelector('img').src;
				const pid = element.querySelector('a').getAttribute("sa-data").substring(24, 35);
				List.name = name;
				List.price = price.match(/\d+(\.\d+)?/g);
				List.img = img;
				List.pid = pid;
				List.pingtai = 'suning';
				arrList.push(List);
				i++;
			}
			return arrList;
		})

		await page2.goto(dangdang_url);
		await autoScroll(page2);
		const result2 = await page2.evaluate(() => {
			const arrList = []
			let itemList = document.querySelectorAll('ul.bigimg>li')
			let i = 0;
			for (var element of itemList) {
				if (i > 29) break;
				const List = {}
				const name = element.querySelector('a.pic').title;
				const price = element.querySelector('p.price>span.search_now_price').innerText;
				const img = element.querySelector('a.pic>img').src;
				const pid = element.id;
				List.name = name;
				List.price = price.match(/\d+(\.\d+)?/g);
				List.img = img;
				List.pid = pid;
				List.pingtai = 'dangdang';
				arrList.push(List);
				i++;
			}
			return arrList;
		})

		const sqlStr1 = "INSERT INTO products(product_id, name, image_url) VALUES(?,?,?) ON DUPLICATE KEY UPDATE name = ?, image_url = ?";
		const sqlStr2 = "SELECT COUNT(*) AS count FROM prices WHERE product_id = ? AND create_at = CURDATE()";
		const sqlStr3 = "INSERT INTO prices(price, platform, create_at, product_id) VALUES(?,?,CURDATE(),?)";
		const sqlStr4 = "UPDATE prices SET price = ? WHERE product_id = ? AND create_at = CURDATE()";


		const queries = (result1.concat(result2)).map((item) => {
			return new Promise((resolve, reject) => {
				// 插入或更新产品信息
				conn.query(
					sqlStr1,
					[item.pid, item.name, item.img, item.name, item.img],
					(err, results) => {
						if (err) {
							reject(err);
						} else {
							// 查询是否已有相同 product_id 和 create_at 的记录
							conn.query(
								sqlStr2,
								[item.pid],
								(err, results) => {
									if (err) {
										reject(err);
									} else {
										const count = results[0].count;
										if (count === 0) {
											// 如果不存在记录，插入新的价格记录
											conn.query(
												sqlStr3,
												[item.price, item.pingtai, item.pid],
												(err, results) => {
													if (err) {
														reject(err);
													} else {
														resolve(item);
													}
												}
											);
										} else {
											// 如果记录已存在
											conn.query(
												sqlStr4,
												[item.price, item.pid],
												(err, results) => {
													if (err) {
														reject(err);
													} else {
														resolve(item);
													}
												}
											);
										}
									}
								}
							);
						}
					}
				);
			});
		});


		Promise.all(queries)
			.then((processedItems) => {
				arr = processedItems;
				res.type('html');
				res.render("result", { data: arr, username: username });
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

//我的关注
app.post("/userAttach", (req, res) => {
	const username = req.body.username;
	// 数据库查询用户信息
	const sql = `
        SELECT 
			p.product_id AS pid,
            p.name AS product_name,
            p.image_url AS product_image,
            pr.platform AS product_platform,
            pr.price AS latest_price
        FROM 
            user_products up
        JOIN 
            products p ON up.product_id = p.product_id
        JOIN 
            prices pr ON up.product_id = pr.product_id
        WHERE 
            up.username = ?
            AND pr.create_at = (
                SELECT MAX(create_at) 
                FROM prices 
                WHERE prices.product_id = up.product_id
            )
            AND up.valid = 'y';
    `;
	conn.query(sql, [username], (err, results) => {
		if (err) {
			console.error(err);
			return res.status(500).send("数据库查询失败");
		}
		res.type("html");
		res.render("userAttach", { data: results, username: username });
		return results;
	});

});

//价格图
app.post("/pricechart", (req, res) => {
	const productName = req.body.product_name; // 获取商品名称
	const username = req.body.username; // 获取用户名
	const pid = req.body.pid; // 商品 id

	// SQL 查询商品价格的逻辑
	const priceSql = `
    SELECT pr.price, DATE_FORMAT(pr.create_at, '%Y-%m-%d') AS create_at 
    FROM products AS p
    JOIN prices AS pr ON p.product_id = pr.product_id
    WHERE p.name = ?
    ORDER BY pr.create_at DESC
    LIMIT 7`;

	// SQL 查询关注状态的逻辑
	const attachSql = `
    SELECT COUNT(*) AS count 
    FROM user_products 
    WHERE username = ? AND product_id = ? AND valid = 'y'`;

	// 查询商品价格
	conn.query(priceSql, [productName], (err, priceResults) => {
		if (err) {
			console.error(err);
			res.status(500).send("服务器错误");
			return;
		}

		// 对查询结果进行日期和价格的处理
		const data = priceResults.reverse(); // 将数据按日期升序排列
		const dates = data.map(item => item.create_at); // 提取日期
		const prices = data.map(item => item.price); // 提取价格

		// 查询商品是否被关注
		conn.query(attachSql, [username, pid], (err, attachResults) => {
			if (err) {
				console.error(err);
				res.status(500).send("服务器错误");
				return;
			}

			const isAttached = attachResults[0].count > 0; // 判断是否被关注

			// 渲染页面，并将数据传递到前端
			res.type("html");
			res.render("pricechart", {
				username: username,
				product_name: productName,
				dates: dates,
				prices: prices,
				pid: pid,
				isAttached: isAttached // 将关注状态传递给前端
			});
		});
	});
});


//首页
app.post("/home", (req, res) => {
	const username = req.body.username;
	// 渲染用户信息页面
	res.type("html");
	res.render("home", { username: username });
});

//关注商品
app.post("/attach", (req, res) => {
	const username = req.body.username;
	const pid = req.body.pid;

	const sqlSelect = "SELECT * FROM user_products WHERE username = ? AND product_id = ?";
	const sqlUpdate = "UPDATE user_products SET valid = 'y' WHERE username = ? AND product_id = ?";
	const sqlInsert = "INSERT INTO user_products (username, product_id, valid) VALUES (?, ?, 'y')";

	conn.query(sqlSelect, [username, pid], (err, results) => {
		if (err) {
			console.error("Error while checking record:", err);
			return res.status(500).json({ success: false, message: "数据库查询错误" });
		}

		if (results.length > 0) {
			// 如果记录存在，更新为有效
			conn.query(sqlUpdate, [username, pid], (err) => {
				if (err) {
					console.error("Error while updating record:", err);
					return res.status(500).json({ success: false, message: "数据库更新错误" });
				}
				alert("关注成功！")
				res.type("html");
				res.render("home", { username: username });
			});
		} else {
			// 如果记录不存在，插入新记录
			conn.query(sqlInsert, [username, pid], (err) => {
				if (err) {
					console.error("Error while inserting record:", err);
					return res.status(500).json({ success: false, message: "数据库插入错误" });
				}
				alert("关注成功！")
				res.type("html");
				res.render("home", { username: username });
			});
		}
	});
});



//取关商品
app.post("/disattach", (req, res) => {
	const { username, pid } = req.body;
	const sqlUpdate = "UPDATE user_products SET valid = 'n' WHERE username = ? AND product_id = ?";

	conn.query(sqlUpdate, [username, pid], (err) => {
		if (err) return res.status(500).json({ success: false, message: "数据库更新错误" });;
		alert("取消关注成功！")
		res.type("html");
		res.render("home", { username: username });
	});
});

//开启监听
app.listen(3452, () => {
	console.log("3452端口已经启动。。。")
})

cron.schedule("0 12 * * *", () => {//每天12点执行
    console.log("开始执行价格检查任务...");

    // 1. 查询所有关注的商品及用户邮箱
    const sqlFollowedProducts = `
        SELECT up.username, u.email AS user_mail, p.product_id, p.name
        FROM user_products AS up
        JOIN users AS u ON up.username = u.username
        JOIN products AS p ON up.product_id = p.product_id
        WHERE up.valid = 'y';
    `;

    conn.query(sqlFollowedProducts, (err, followedProducts) => {
        if (err) {
            console.error("查询关注商品失败:", err);
            return;
        }

        // 2. 遍历每个商品，检查价格记录
        followedProducts.forEach((product) => {
            const { username, user_mail, product_id, name } = product;

            // 查询当天是否已有价格记录
            const sqlTodayPrice = `
                SELECT price
                FROM prices
                WHERE product_id = ? AND create_at = CURDATE()
                LIMIT 1;
            `;

            conn.query(sqlTodayPrice, [product_id], (err, todayResults) => {
                if (err) {
                    console.error("查询当天价格失败:", err);
                    return;
                }

                if (todayResults.length === 0) {
                    // 没有当天记录，插入今天的价格记录，保持与最近记录一致
                    const sqlLatestPrice = `
                        SELECT price, platform
                        FROM prices
                        WHERE product_id = ?
                        ORDER BY create_at DESC
                        LIMIT 1;
                    `;

                    conn.query(sqlLatestPrice, [product_id], (err, latestResults) => {
                        if (err) {
                            console.error("查询历史价格失败:", err);
                            return;
                        }

                        const latestPrice = latestResults.length > 0 ? latestResults[0].price : null;
                        const platform = latestResults.length > 0 ? latestResults[0].platform : '未知平台';

                        // 模拟获取当前价格，保持与最新价格一致
                        const currentPrice = latestPrice || 0;

                        const sqlInsertPrice = `
                            INSERT INTO prices (price, platform, create_at, product_id)
                            VALUES (?, ?, CURDATE(), ?);
                        `;
                        conn.query(sqlInsertPrice, [currentPrice, platform, product_id], (err) => {
                            if (err) {
                                console.error("插入当天价格记录失败:", err);
                            } else {
                                console.log(`商品 ${name} 的今天价格已插入，价格: ${currentPrice}`);
                            }
                        });
                    });
                } else {
                    // 如果有今天的记录，判断是否降价
                    const todayPrice = todayResults[0].price;

                    const sqlLatestPrice = `
                        SELECT price
                        FROM prices
                        WHERE product_id = ?
                        ORDER BY create_at DESC
                        LIMIT 1;
                    `;

                    conn.query(sqlLatestPrice, [product_id], (err, latestResults) => {
                        if (err) {
                            console.error("查询历史价格失败:", err);
                            return;
                        }

                        const latestPrice = latestResults.length > 0 ? latestResults[0].price : null;

                        if (latestPrice && todayPrice < latestPrice) {
                            // 如果今天价格低于历史最新价格，发送通知
                            console.log(`商品降价: ${name}, 原价: ${latestPrice}, 现价: ${todayPrice}`);

                            notifyUser(user_mail, name, latestPrice, todayPrice);
                        } else {
                            console.log(`商品 ${name} 未降价。`);
                        }
                    });
                }
            });
        });
    });
});

// 通知用户：发送邮件（需要配置邮件服务）
function notifyUser(user_mail, productName, oldPrice, newPrice) {
    const transporter = nodemailer.createTransport({
        host: 'smtp.qq.com',
        secureConnection: true,
        auth: {
            user: "2214317260@qq.com", 
            pass: "sbaxumnpfiybdjbi", // 请确保此处的授权码正确
        },
    });

    const mailOptions = {
        from: "2214317260@qq.com",
        to: user_mail, // 用户的邮箱
        subject: "商品降价通知",
        text: `您关注的商品 "${productName}" 已降价！\n原价: ￥${oldPrice}\n现价: ￥${newPrice}\n快去抢购吧！`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error("邮件发送失败:", err);
        } else {
            console.log("邮件发送成功:", info.response);
        }
    });
}

// cron.schedule("30 * * * * *", () => {//每分钟第30秒执行，test
//     console.log("开始执行价格检查任务...");

//     // 1. 查询所有关注的商品及用户邮箱
//     const sqlFollowedProducts = `
//         SELECT up.username, u.email AS user_mail, p.product_id, p.name
//         FROM user_products AS up
//         JOIN users AS u ON up.username = u.username
//         JOIN products AS p ON up.product_id = p.product_id
//         WHERE up.valid = 'y';
//     `;

//     conn.query(sqlFollowedProducts, (err, followedProducts) => {
//         if (err) {
//             console.error("查询关注商品失败:", err);
//             return;
//         }

//         // 2. 遍历每个商品，检查价格记录
//         followedProducts.forEach((product) => {
//             const { username, user_mail, product_id, name } = product;

//             // 查询当天是否已有价格记录
//             const sqlTodayPrice = `
//                 SELECT price
//                 FROM prices
//                 WHERE product_id = ? AND create_at = CURDATE()
//                 LIMIT 1;
//             `;

//             conn.query(sqlTodayPrice, [product_id], (err, todayResults) => {
//                 if (err) {
//                     console.error("查询当天价格失败:", err);
//                     return;
//                 }

//                 if (todayResults.length === 0) {
//                     // 没有当天记录，插入今天的价格记录，保持与最近记录一致
//                     const sqlLatestPrice = `
//                         SELECT price, platform
//                         FROM prices
//                         WHERE product_id = ?
//                         ORDER BY create_at DESC
//                         LIMIT 1;
//                     `;

//                     conn.query(sqlLatestPrice, [product_id], (err, latestResults) => {
//                         if (err) {
//                             console.error("查询历史价格失败:", err);
//                             return;
//                         }

//                         const latestPrice = latestResults.length > 0 ? latestResults[0].price : null;
//                         const platform = latestResults.length > 0 ? latestResults[0].platform : '未知平台';

//                         // 模拟获取当前价格，保持与最新价格一致
//                         const currentPrice = latestPrice || 0;

//                         const sqlInsertPrice = `
//                             INSERT INTO prices (price, platform, create_at, product_id)
//                             VALUES (?, ?, CURDATE(), ?);
//                         `;
//                         conn.query(sqlInsertPrice, [currentPrice, platform, product_id], (err) => {
//                             if (err) {
//                                 console.error("插入当天价格记录失败:", err);
//                             } else {
//                                 console.log(`商品 ${name} 的今天价格已插入，价格: ${currentPrice}`);
//                             }
//                         });
//                     });
//                 } else {
//                     // 如果有今天的记录，判断是否降价
//                     const todayPrice = todayResults[0].price;

//                     const sqlLatestPrice = `
//                         SELECT price
//                         FROM prices
//                         WHERE product_id = ?
//                         ORDER BY create_at DESC
//                         LIMIT 2;
//                     `;

//                     conn.query(sqlLatestPrice, [product_id], (err, latestResults) => {
//                         if (err) {
//                             console.error("查询历史价格失败:", err);
//                             return;
//                         }

//                         const latestPrice = latestResults.length > 1 ? latestResults[1].price : null;

//                         if (latestPrice && todayPrice < latestPrice) {
//                             // 如果今天价格低于历史最新价格，发送通知
//                             console.log(`商品降价: ${name}, 原价: ${latestPrice}, 现价: ${todayPrice}`);

//                             notifyUser(user_mail, name, latestPrice, todayPrice);
//                         } else {
//                             console.log(`商品 ${name} 未降价。`);
//                         }
//                     });
//                 }
//             });
//         });
//     });
// });
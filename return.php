<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>还书</title>
<link rel="stylesheet" href="library.css">
</head>
 
<body background="picture/library.png">
	<div id="nav">
        <ul class="item">
            <form action="index.php" method="post"><button type="submit">首页</button></form>
            <form action="enter.php" method="post"><button type="submit">入库</button></form>
            <form action="search.php" method="post"><button type="submit">查询</button></form>
			<form action="borrow.php" method="post"><button type="submit">借书</button></form>
			<form action="return.php" method="post"><button type="submit">还书</button></form>
			<form action="card.php" method="post"><button type="submit">借书证管理</button></form>
        </ul>
    </div>
	<div id="library">
		<div class="form"><div class="item">
			<p align="center">请输入借书证卡号<br></p>
			<form action="return_card.php" method="post">
				<p align="center">cno：<input name="cno" type="text" required><br>
				<button type="submit">查询</button></p>
			</form>
			<br>
		</div></div>
	</div>
</body>
</html>
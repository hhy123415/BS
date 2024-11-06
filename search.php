<!--search.php-->
 
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>查询</title>
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
			<p align="center">请输入查询条件（可以不填）<br></p>
			<form action="search_result.php" method="post">
				<p align="center">bno：<input name="bno" type="text"><br>
				category：<input name="category" type="text"><br>
				title：<input name="title" type="text"><br>
				press：<input name="press" type="text"><br>
				year：<input name="min_year" type="text">至<input name="max_year" type="text"><br>
				author：<input name="author" type="text"><br>
				price：<input name="min_price" type="text">至<input name="max_price" type="text"><br>
				total：<input name="total" type="text"><br>
				stock：<input name="stock" type="text"><br>
				<button type="submit">查询</button></p>
			</form>
		</div></div>
	</div>
</body>
</html>
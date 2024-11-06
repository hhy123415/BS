<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>图书入库</title>
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
		<div class="form"><div class="item"><p align="center">请选择入库方式<br>
		单本入库（输入图书信息）<br></p>
		<form action="enter_single.php" method="post">
			<div class="form"><div class="item"><p align="center">bno：<input name="bno" type="text" required><br>
			category：<input name="category" type="text" required><br>
			title：<input name="title" type="text" required><br>
			press：<input name="press" type="text" required><br>
			year：<input name="year" type="text" required><br>
			author：<input name="author" type="text" required><br>
			price：<input name="price" type="text" required><br>
			total：<input name="total" type="text" required><br>
			<button type="submit">入库</button></p>
		</form>
		<br>
		<p align="center">批量入库<br></p>
		<form action="enter_multi.php" method="post" enctype="multipart/form-data">
			<p align="center">选择文件：<input name="f" type="file" required><br></p>
			<p align="center"><button type="submit">入库</button></p>
		</form>
		<br>
		</div></div>
	</div>
</body>
</html>
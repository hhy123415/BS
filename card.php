<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>借书证管理</title>
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
			<p align="center">请选择添加或删除借书证<br>
			请输入要添加的借书证的信息<br></p>
			<form action="card_add.php" method="post">
				<p align="center">cno：<input name="cno" type="text" ><br>
				name：<input name="name" type="text" ><br>
				department：<input name="department" type="text" ><br>
				type：<input name="type" type="text" ><br>
				<button type="submit">添加</button></p>
			</form>
			<br>
			<p align="center">请输入要删除的借书证的卡号<br></p>
			<form action="card_delete.php" method="post">
				<p align="center">cno：<input name="cno" type="text" ><br>
				<button type="submit">删除</button></p>
			</form>
			<br>
		</div></div>
	</div>
</body>
</html>
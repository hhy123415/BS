<!--card_delete.php-->
 

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
		<?php
 
		//连接数据库
		include("connect.php");

		//获取表单数据
		$cno = $_POST['cno'];

		$sql = "delete from card where cno = '$cno'";

		if ($conn->query($sql) === TRUE) {
			echo "<p>"."删除成功"."</p>";
		} else {
			echo "Error: " . $sql . "<br>" . $conn->error;
		}

		//关闭数据库
		mysqli_close($conn);

		?>
		</div></div>
	</div>
</body>
</html>
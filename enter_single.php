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
		<div class="form"><div class="item"><p align="center">
			<?php
 
			include("connect.php");

				$bno = $_POST['bno'];
				$category = $_POST['category'];
				$title = $_POST['title'];
				$press = $_POST['press'];
				$year = $_POST['year'];
				$author = $_POST['author'];
				$price = $_POST['price'];
				$total = $_POST['total'];
				$stock = $_POST['stock'];

				$sql = "INSERT INTO book 
				VALUES ('$bno', '$category', '$title', '$press','$year','$author','$price','$total','$total')";

				if ($conn->query($sql) === TRUE) {
					echo "新书入库成功";
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
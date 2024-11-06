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
			<?php

			//连接数据库
			include("connect.php");
			$cno = $_POST['cno'];
			setcookie('card',$cno);
			$sql = "SELECT * FROM borrow where cno = '$cno'";
			$result = $conn->query($sql);
			$i = 1;

			if ($result->num_rows > 0) {
				// 输出数据
				while($i<=50 && $row = $result->fetch_assoc()) {
					echo "<p align='center'>"."($i)" . "cno: " . $row["cno"]. " - bno: " . $row["bno"]. " - borrow_date: " . $row["borrow_date"]. " - return_date: " . $row["return_date"]. " - admin_id: " . $row["admin_id"]. "<br>"."</p>";
					$i++;
				}
			} else {
				echo "<p align='center'>"."0 结果"."</p>";
			}
			mysqli_close($conn);

			?>
			<p align="center">输入书号<br></p>
			<form action="return_book.php" method="post">
				<p align="center">书号：<input name="bno" type="text" required><br>
				<button type="submit">还书</button></p>
				<br>
			</form>
		</div></div>
	</div>
</body>
</html>
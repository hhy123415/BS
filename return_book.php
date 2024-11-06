<!--return_book.php-->

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
			$bno = $_POST['bno'];
			$cno = $_COOKIE['card'];
			$sql = "SELECT * FROM borrow where bno = '$bno' and cno = '$cno'";
			$result = $conn->query($sql);
			$date=date("Y-m-d H:i:s", time());
			$return_date=date("Y-m-d H:i:s",strtotime("$date +14 day"));

			if ($result->num_rows > 0) {
				mysqli_query($conn,"UPDATE book SET stock= stock+1
				WHERE bno = '$bno'");
				$sql = "SELECT min(borrow_date) as min FROM borrow where bno = '$bno' and cno = '$cno'";
				$result = $conn->query($sql);
				if ($result->num_rows > 0)
				{
					$row = $result->fetch_assoc();
					if($row["min"]!=NULL) $min_date=$row["min"];
				}
				$sql="delete from borrow where bno = '$bno' and cno = '$cno' and borrow_date = '$min_date'";
				$conn->query($sql);
				echo "<p align='center'>"."还书成功"."</p>";
			} else {
				echo "<p align='center'>"."还书失败"."<br>"."</p>";
			}
			mysqli_close($conn);

			?>
		</div></div>
	</div>
</body>
</html>
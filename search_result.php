<!--search_result.php-->

<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>查询结果</title>
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
			$category = $_POST['category'];
			$title = $_POST['title'];
			$press = $_POST['press'];
			$min_year = $_POST['min_year'];
			$max_year = $_POST['max_year'];
			$author = $_POST['author'];
			$min_price = $_POST['min_price'];
			$max_price = $_POST['max_price'];
			$total = $_POST['total'];
			$stock = $_POST['stock'];
			$cnt = ($bno!=NULL)?1:0+($category!=NULL)?1:0+($title!=NULL)?1:0+($press!=NULL)?1:0+($min_year!=NULL)?1:0+($max_year!=NULL)?1:0+($author!=NULL)?1:0+($min_price!=NULL)?1:0+($max_price!=NULL)?1:0+($total!=NULL)?1:0+($stock!=NULL)?1:0;
			$where=($cnt>0)?"where":NULL;
			$a1=($bno!=NULL)?" bno = \"$bno\" and":NULL;
			$a2=($category!=NULL)?" category = \"$category\" and":NULL;
			$a3=($title!=NULL)?" title = \"$title\" and":NULL;
			$a4=($press!=NULL)?" press = \"$press\" and":NULL;
			$a5=($min_year!=NULL)?" year >= \"$min_year\" and":NULL;
			$a6=($author!=NULL)?" author = \"$author\" and":NULL;
			$a7=($min_price!=NULL)?" price >= \"$min_price\" and":NULL;
			$a8=($total!=NULL)?" total = \"$total\" and":NULL;
			$a9=($stock!=NULL)?" stock = \"$stock\" and":NULL;
			$a10=($max_year!=NULL)?" year <= \"$max_year\" and":NULL;
			$a11=($max_price!=NULL)?" price <= \"$max_price\" and":NULL;
			$sql = "SELECT * FROM book ".$where.$a1.$a2.$a3.$a4.$a5.$a6.$a7.$a8.$a9.$a10.$a11;
			$sql = rtrim($sql,'and');
			$result = $conn->query($sql);
			$i = 1;

			if ($result->num_rows > 0) {
				// 输出数据
				while($i<=50 && $row = $result->fetch_assoc()) {
					echo "<p align='center'>" . "($i)" . "bno: " . $row["bno"]. " - category: " . $row["category"]. " - title: " . $row["title"]. " - press: " . $row["press"]. " - year: " . $row["year"]. " - author: " . $row["author"]. " - price: " . $row["price"]. " - total: " . $row["total"]. " - stock: " . $row["stock"].  "<br>" . "</p>";
					$i++;
				}
			} else {
				echo "<p align='center'>"."0 结果"."</p>";
			}
			mysqli_close($conn);

			?>
		</div></div>
	</div>
</body>
</html>
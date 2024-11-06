<!--enter_multi.php-->
 
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
 
			//连接数据库
			include("connect.php");

			$fileInfo = $_FILES["f"];
			$fileName = $fileInfo["name"];
			$filePath = $fileInfo["tmp_name"];
			$sql="";

			if(file_exists($filePath))
			{
				$fp = fopen($filePath,"r");
				while(!feof($fp))
				{
					$str = fgets($fp);
					sscanf($str,"( %[^,], %[^,], %[^,], %[^,], %d, %[^,], %f, %d)",$bno,$category,$title,$press,$year,$author,$price,$sum);
					$sql.="insert into book values('$bno','$category','$title','$press','$year','$author','$price','$sum','$sum');";
				}
				fclose($fp);
			}
			echo $sql."<br>";

			if ($conn->multi_query($sql) === TRUE) {
				echo "新记录插入成功";
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
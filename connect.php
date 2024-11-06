<!--connect.php-->
 
<?php
 
//连接数据库
$conn = mysqli_connect('localhost','root','221431');
 
//如果连接数据库失败就输出错误信息
if(!$conn){
	die("连接数据库错误：".mysqli_error($conn));
}
 
//选择数据库
mysqli_select_db($conn,'library');
 
//选择字符集
mysqli_set_charset($conn,'utf8');
 
?>
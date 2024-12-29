ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY '3452';

CREATE TABLE users (
  user_id int NOT NULL AUTO_INCREMENT,
  username varchar(20) NOT NULL,
  password varchar(20) NOT NULL,
  email varchar(100) NOT NULL,
  created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  UNIQUE KEY username (username),
  UNIQUE KEY email (email)
);

CREATE TABLE products (
  product_id varchar(20) NOT NULL,
  name varchar(100) NOT NULL,
  image_url varchar(255) DEFAULT NULL,
  created_at timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (product_id)
);

CREATE TABLE prices (
  price_id int NOT NULL AUTO_INCREMENT,
  price decimal(10,2) NOT NULL,
  platform varchar(50) NOT NULL,
  create_at date DEFAULT NULL,
  product_id varchar(20) DEFAULT NULL,
  PRIMARY KEY (price_id),
  KEY fk1 (product_id),
  CONSTRAINT prices_ibfk_1 FOREIGN KEY (product_id) REFERENCES products (product_id)
);

CREATE TABLE user_products (
  id int NOT NULL AUTO_INCREMENT,
  product_id varchar(20) DEFAULT NULL,
  username varchar(20) DEFAULT NULL,
  valid enum('y','n') DEFAULT 'y',
  PRIMARY KEY (id)
);
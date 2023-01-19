<?php

// Creating the connection 
include_once '../config/database.php';
$database = new Database();
  $conn = $database->getConnection();
try {
  // set the PDO error mode to exception
  $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  $query = "CREATE TABLE  address(
    `id` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `address` varchar(255) NOT NULL,
    `address2` varchar(255) NULL,
    `city` varchar(20) NOT NULL,
    `prov` varchar(20) NOT NULL,
    `country` varchar(20) NOT NULL,
    `postal` varchar(10) NOT NULL,
    `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
  $conn->exec($query);
    echo "Table is successfully created in database.";
} catch(PDOException $e) {
  echo $e->getMessage();
}

//close the connection
$conn = null;   // mysqli_close($connection);

?>
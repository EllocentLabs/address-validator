<?php
    class Address{

        // Connection
        private $conn;

        // Table
        private $db_table = "address";

        // Columns
        public $id;
        public $address;
        public $address2;
        public $city;
        public $prov;   
        public $postal; 
        public $country;
        public $created; 
        public $modified; 

        // Db connection
        public function __construct($db){
            $this->conn = $db;
        }

        // GET ALL
        public function getAddreses(){
            $sqlQuery = "SELECT id, address, address2, city, prov, postal,country FROM " . $this->db_table . "";
            $stmt = $this->conn->prepare($sqlQuery);
            $stmt->execute();
            return $stmt;
        }

        // CREATE
        public function createAddress(){
            $sqlQuery = "INSERT INTO
                        ". $this->db_table ."
                    SET
                        address = :address, 
                        address2 = :address2, 
                        city = :city, 
                        prov = :prov, 
                        country = :country,
                        postal = :postal";
        
            $stmt = $this->conn->prepare($sqlQuery);
        
            // sanitize
            $this->address = htmlspecialchars(strip_tags($this->address));
            $this->address2 = htmlspecialchars(strip_tags($this->address2));
            $this->city = htmlspecialchars(strip_tags($this->city));
            $this->prov = htmlspecialchars(strip_tags($this->prov));
            $this->postal = htmlspecialchars(strip_tags($this->postal));
            $this->country = htmlspecialchars(strip_tags($this->country));
        
            // bind data
            $stmt->bindParam(":address", $this->address);
            $stmt->bindParam(":address2", $this->address2);
            $stmt->bindParam(":city", $this->city);
            $stmt->bindParam(":prov", $this->prov);
            $stmt->bindParam(":postal", $this->postal);
            $stmt->bindParam(":country", $this->country);
        
            if($stmt->execute()){
               return true;
            }
            return false;
        }

    }
?>


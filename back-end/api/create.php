<?php
    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json; charset=UTF-8");
    header("Access-Control-Allow-Methods: POST");
    header("Access-Control-Max-Age: 3600");
    header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

    include_once '../config/database.php';
    include_once '../class/address.php';
    include_once '../validation/validation.php';

    $database = new Database();
    $db = $database->getConnection();

    $address = new Address($db);

    $data = json_decode(file_get_contents("php://input"));
    $dataValidation = json_decode(file_get_contents("php://input"),true);
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        $fields = [
            'address' => 'required | max:255',
            'city' => 'required | max:20',
            'postal' => 'required|max: 10',
            'country' => 'required | max:20',
            'prov' => 'required | max:20'
        ];
        
        $errors = validate($dataValidation, $fields, [
            'required' => 'The %s field is required',
            ]
        );
        if (!empty($errors)) {
            http_response_code(400);   
            echo json_encode(['error' => $errors, 'status' => false, 'status_code' => 400]);
        } else{
        if(!empty($data->address) && !empty($data->country) &&
        !empty($data->city) && !empty($data->prov) && !empty($data->postal)){   
            $address->address = $data->address;
            $address->address2 = $data->address2;
            $address->country = $data->country;
            $address->city = $data->city;
            $address->prov = $data->prov;	
            $address->postal = $data->postal;
        
            if($address->createAddress()){         
                http_response_code(201);         
                echo json_encode(array("msg" => "Address saved successfully.",'status' => true,'status_code' =>201));
            } else{         
                http_response_code(400);        
                echo json_encode(array("error" => "Unable to save address.",'status' => false));
            }
        }else{    
            http_response_code(400);    
            echo json_encode(array("error" => "Unable to save address. Data is incomplete.",'status' => false));
        }
    }
    }else{    
        http_response_code(400);    
        echo json_encode(array("error" => "Only POST method is allowed.",'status' => false, 'status_code' => 400));
    }
?>
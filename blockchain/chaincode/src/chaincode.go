package main

import (
	"fmt"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

// Chaincode - chaincode struct
type Chaincode struct {
}

func main() {
	err := shim.Start(new(Chaincode))
	if err != nil {
		fmt.Printf("Error starting Simple chaincode: %s", err)
	}
}

// Init - Init method for the chaincode struct
func (t *Chaincode) Init(stub shim.ChaincodeStubInterface) pb.Response {
	return shim.Success(nil)
}

// Invoke - main entry point for chaincode requests
func (t *Chaincode) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	function, args := stub.GetFunctionAndParameters()
	fmt.Printf("Invoke called with function %s arguments %v", function, args)
	switch function {
	case "create":
		fmt.Println("create has been called")
		//return createMarble(stub, args[0], args[1], args[2], args[3])
	default:
		return shim.Error("function not found")
	}
	return shim.Success(nil)
}

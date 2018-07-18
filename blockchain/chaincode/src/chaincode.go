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
	fmt.Printf("Invoke called with function %s arguments %v \n", function, args)

	switch function {
	case "createDevice":
		fmt.Println("createDevice called")
		return createDevice(stub, args[0])
	case "getDeviceByID":
		fmt.Println("getDeviceByID called")
		return getDeviceByID(stub, args[0])
	default:
		return shim.Error("function not found")
	}
	// return shim.Success(nil)
}

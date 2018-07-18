package main

import (
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

func createDevice(stub shim.ChaincodeStubInterface, deviceAsString string) pb.Response {
	deviceAsBytes := []byte(deviceAsString)

	var device Device
	err := json.Unmarshal(deviceAsBytes, &device)
	if err != nil {
		shim.Error("Failed to unmarshal device")
	}
	fmt.Printf("Device to be added to the ledger: %v\n", device)
	deviceCompositeKey, err := stub.CreateCompositeKey("device", []string{device.ID})
	if err != nil {
		return shim.Error("Failed to create composite key for device: " + device.ID)
	}

	err = stub.PutState(deviceCompositeKey, deviceAsBytes)
	if err != nil {
		return shim.Error("Failed to put state for device: " + device.ID)
	}

	return shim.Success(nil)
}

func getDeviceByID(stub shim.ChaincodeStubInterface, deviceID string) pb.Response {
	deviceCompositeKey, err := stub.CreateCompositeKey("device", []string{deviceID})
	deviceAsBytes, err := stub.GetState(deviceCompositeKey)
	if err != nil {
		return shim.Error("Failed to get device with ID: " + deviceID)
	} else if deviceAsBytes == nil {
		return shim.Error("Failed to get device with ID: " + deviceID)
	}
	fmt.Printf("DeviceAsBytes: %v \n", deviceAsBytes)
	return shim.Success(deviceAsBytes)
}

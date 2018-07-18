package main

import (
	"encoding/json"
	"fmt"
	"testing"

	"github.com/hyperledger/fabric/core/chaincode/shim"
)

var stub = shim.NewMockStub("chaincode", new(Chaincode))

func TestCreateDevice(t *testing.T) {
	stub.MockTransactionStart("tx1")
	response := createDevice(stub, "{\"id\":\"100\",\"manufacturer\":\"Hotpoint\",\"status\":1}")
	fmt.Printf("[TestCreateDevice] response: %v \n", response)
	stub.MockTransactionEnd("tx1")
	if response.Status != shim.OK {
		t.Error("[TestCreateDevice] Error creating device")
	}
}

func TestGetDeviceByID(t *testing.T) {
	// create a dummy device for the test
	device := Device{ID: "test100", Manfucaturer: "Hotpoint", Status: 1}
	deviceAsBytes, _ := json.Marshal(device)
	deviceCompositeKey, _ := stub.CreateCompositeKey("device", []string{device.ID})
	stub.MockTransactionStart("tx1")
	stub.PutState(deviceCompositeKey, deviceAsBytes)
	stub.MockTransactionEnd("tx1")

	response := getDeviceByID(stub, "test100")

	if response.Status != shim.OK {
		t.Error("[getDeviceByID] Error retrieving device")
	}
}

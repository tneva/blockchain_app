package main

// Status ...Available Statuses for a Device
type Status int

const (
	OK     Status = 1
	Faulty Status = 2
)

// Fault ...Available Faults for the Device
type Fault int

var (
	Component Fault = 1
	Software  Fault = 2
)

// Device ...Represents an IoT Device
type Device struct {
	// ID
	ID string `json:"id"`
	// Manufacturer
	Manfucaturer string `json:"manufacturer"`
	// Status
	Status Status `json:"status"`
	// Fault Type
	Fault Fault `json:"fault"`
	// Service History
	ServiceHistory []Service `json:"serviceHistory,omitempty"`
}

// FaultToString ...Return the fault as a string
func FaultToString(fault Fault) string {
	switch fault {
	case Component:
		return "Component Fault"
	case Software:
		return "Software Fault"
	default:
		return ""
	}
}

// StatusToString ...Return the fault as a string
func StatusToString(status Status) string {
	switch status {
	case OK:
		return "OK"
	case Faulty:
		return "Faulty"
	default:
		return ""
	}
}

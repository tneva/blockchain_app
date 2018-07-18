package main

import (
	"time"
)

// Service ...Represents the fault, and who fixed it
type Service struct {
	// Date reported faulty
	DateReportedFaulty time.Time `json:"dateReportedFaulty"`
	// Date fixed
	DateFixed time.Time `json:"dateFixed"`
	// UserWhoFixed
	userWhoFixed User `json:"userWhoFixed"`
	// Fault Type
	FaultType Fault `json:"faultType"`
}

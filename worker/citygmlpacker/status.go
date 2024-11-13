package citygmlpacker

const (
	PackStatusAccepted   = "accepted"
	PackStatusProcessing = "processing"
	PackStatusSucceeded  = "succeeded"
	PackStatusFailed     = "failed"
)

func getStatus(metadata map[string]string) string {
	return metadata["status"]
}

func status(s string) map[string]string {
	return map[string]string{
		"status": s,
	}
}

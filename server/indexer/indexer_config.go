package indexer

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
)

type Index struct {
	Kind string `json:"kind"`
}

type Config struct {
	IdProperty string           `json:"idProperty"`
	Indexes    map[string]Index `json:"indexes"`
}

func IndexerConfigFromJson(data io.Reader) (*Config, error) {
	var ic *Config
	if err := json.NewDecoder(data).Decode(&ic); err != nil {
		return nil, fmt.Errorf("decode failed: %v", err)
	}
	return ic, nil
}

func ParseIndexerConfigFile(fileName string) (*Config, error) {
	jsonFile, err := os.Open(fileName)
	if err != nil {
		return nil, fmt.Errorf("open failed: %v", err)
	}
	res, err := IndexerConfigFromJson(jsonFile)
	if err != nil {
		return nil, fmt.Errorf("json conversion failed: %v", err)
	}
	return res, nil
}

package cmsintegrationflow

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"strings"
)

var ErrInvalidID = errors.New("invalid fme id")

const idPrefix = "flow"

type ID struct {
	ItemID      string
	ProjectID   string
	FeatureType string
	Type        ReqType
}

func parseID(id, secret string) (ID, error) {
	payload, err := unsignFMEID(id, secret)
	if err != nil {
		return ID{}, err
	}

	s := strings.SplitN(payload, ";", 5)
	if len(s) != 5 || s[0] != idPrefix {
		return ID{}, ErrInvalidID
	}

	return ID{
		ItemID:      s[1],
		ProjectID:   s[2],
		FeatureType: s[3],
		Type:        ReqType(s[4]),
	}, nil
}

func (i ID) Sign(secret string) string {
	payload := fmt.Sprintf("%s;%s;%s;%s;%s", idPrefix, i.ItemID, i.ProjectID, i.FeatureType, i.Type)
	return signID(payload, secret)
}

func signID(payload, secret string) string {
	mac := hmac.New(sha256.New, []byte(secret))
	_, _ = mac.Write([]byte(payload))
	sig := hex.EncodeToString(mac.Sum(nil))
	return fmt.Sprintf("%s:%s", sig, payload)
}

func unsignFMEID(id, secret string) (string, error) {
	_, payload, found := strings.Cut(id, ":")
	if !found {
		return "", ErrInvalidID
	}

	if id != signID(payload, secret) {
		return "", ErrInvalidID
	}

	return payload, nil
}

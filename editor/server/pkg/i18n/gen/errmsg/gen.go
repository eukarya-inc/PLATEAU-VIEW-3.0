//go:build ignore
// +build ignore

package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"text/template"

	"github.com/reearth/reearth/server/pkg/i18n/message"
	"golang.org/x/text/language"
	"golang.org/x/text/language/display"
)

// Translations represents the structure for the output map.
type Translations map[string]map[language.Tag]message.ErrorMessage

func main() {
	inputDir := "../locales/errmsg"
	outputFile := "./errmsg/errmsg_generated.go"

	files, err := collectJSONFiles(inputDir)
	if err != nil {
		panic(fmt.Errorf("failed to collect JSON files: %w", err))
	}

	translations, keys, err := loadMessages(files)
	if err != nil {
		panic(fmt.Errorf("failed to load messages: %w", err))
	}

	code := generateCode(translations, keys)

	if err := os.WriteFile(outputFile, []byte(code), 0644); err != nil {
		panic(fmt.Errorf("failed to write output file: %w", err))
	}

	fmt.Println("Code generated:", outputFile)
}

// collectJSONFiles collects all JSON files from the given directory.
func collectJSONFiles(dir string) ([]string, error) {
	var files []string
	err := filepath.WalkDir(dir, func(path string, d os.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if !d.IsDir() && filepath.Ext(d.Name()) == ".json" {
			files = append(files, path)
		}
		return nil
	})
	return files, err
}

// loadMessages loads and flattens nested JSON files into the desired structure.
func loadMessages(files []string) (Translations, []string, error) {
	messages := make(Translations)
	var keys []string
	for _, file := range files {
		lang := extractLanguageCode(file)
		tag := language.Make(lang)

		data, err := os.ReadFile(file)
		if err != nil {
			return nil, nil, fmt.Errorf("failed to read file %s: %w", file, err)
		}

		var nested map[string]interface{}
		if err := json.Unmarshal(data, &nested); err != nil {
			return nil, nil, fmt.Errorf("failed to parse file %s: %w", file, err)
		}

		flattenAndGroupMessages(messages, nested, tag, "")
		if lang == "en" {
			for key := range collectMessageKeys(nested, "") {
				keys = append(keys, key)
			}
		}
	}
	sort.Strings(keys)
	return messages, keys, nil
}

// extractLanguageCode extracts the language code from a file name (e.g., en.json -> en).
func extractLanguageCode(fileName string) string {
	base := filepath.Base(fileName)
	return strings.TrimSuffix(base, filepath.Ext(base))
}

// flattenAndGroupMessages flattens nested JSON and groups them by key and language.
func flattenAndGroupMessages(messages Translations, data map[string]interface{}, tag language.Tag, parentKey string) {
	keys := make([]string, 0, len(data))
	for key := range data {
		keys = append(keys, key)
	}
	sort.Strings(keys)

	for _, key := range keys {
		value := data[key]

		fullKey := key
		if parentKey != "" {
			fullKey = parentKey + "." + key
		}

		switch v := value.(type) {
		case map[string]interface{}:
			// Check if this map is a message
			if isMessage(v) {
				if _, exists := messages[fullKey]; !exists {
					messages[fullKey] = make(map[language.Tag]message.ErrorMessage)
				}
				messages[fullKey][tag] = message.ErrorMessage{
					Message:     fmt.Sprintf("%v", v["message"]),
					Description: fmt.Sprintf("%v", v["description"]),
				}
			} else {
				// Recurse into nested maps
				flattenAndGroupMessages(messages, v, tag, fullKey)
			}
		}
	}
}

// collectMessageKeys collects keys for error messages from nested JSON.
func collectMessageKeys(data map[string]interface{}, parentKey string) map[string]struct{} {
	keys := make(map[string]struct{})
	for key, value := range data {
		fullKey := key
		if parentKey != "" {
			fullKey = parentKey + "." + key
		}

		switch v := value.(type) {
		case map[string]interface{}:
			// Check if this map is a message
			if isMessage(v) {
				keys[fullKey] = struct{}{}
			} else {
				// Recurse into nested maps
				for k := range collectMessageKeys(v, fullKey) {
					keys[k] = struct{}{}
				}
			}
		}
	}
	return keys
}

// isMessage checks if the map contains keys required for a Message.
func isMessage(data map[string]interface{}) bool {
	_, hasMessage := data["message"]
	_, hasDescription := data["description"]
	return hasMessage && hasDescription
}

// generateCode generates Go code for the messages and keys.
func generateCode(messages Translations, keys []string) string {
	var buf bytes.Buffer

	funcMap := template.FuncMap{
		"toCamelCase": toCamelCase,
		"tagToString": func(tag language.Tag) string {
			return fmt.Sprintf("language.%s", display.English.Languages().Name(language.Make(tag.String())))
		},
	}

	tmpl := template.Must(template.New("messages").Funcs(funcMap).Parse(`// Code generated by go generate; DO NOT EDIT.
package errmsg

import (
	"golang.org/x/text/language"
	"github.com/reearth/reearth/server/pkg/i18n/message"
)

const (
{{- range $key := .Keys }}
	ErrKey{{ toCamelCase $key }} message.ErrKey = "{{$key}}"
{{- end }}
)

var ErrorMessages = map[message.ErrKey]map[language.Tag]message.ErrorMessage{
{{- range $key, $langs := .Messages }}
	ErrKey{{ toCamelCase $key }}: {
		{{- range $tag, $msg := $langs }}
		{{ tagToString $tag }}: {
			Message:     "{{$msg.Message}}",
			Description: "{{$msg.Description}}",
		},
		{{- end }}
	},
{{- end }}
}
`))

	data := map[string]interface{}{
		"Messages": messages,
		"Keys":     keys,
	}
	if err := tmpl.Execute(&buf, data); err != nil {
		panic(fmt.Errorf("failed to execute template: %w", err))
	}

	return buf.String()
}

// toCamelCase converts dot-separated keys (and handles snake_case) to CamelCase.
func toCamelCase(input string) string {
	parts := strings.Split(input, ".")
	for i, part := range parts {
		subParts := strings.Split(part, "_")
		for j, subPart := range subParts {
			subParts[j] = strings.Title(subPart)
		}
		parts[i] = strings.Join(subParts, "")
	}
	return strings.Join(parts, "")
}

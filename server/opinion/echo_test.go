package opinion

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/go-playground/validator/v10"
	"github.com/jarcoal/httpmock"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

func TestEcho(t *testing.T) {
	httpmock.Activate()
	defer httpmock.Deactivate()
	httpmock.RegisterResponder("POST", "https://api.sendgrid.com/v3/mail/send", httpmock.NewJsonResponderOrPanic(http.StatusOK, `{}`))

	e := echo.New()
	e.Validator = &customValidator{validator: validator.New()}
	g := e.Group("")
	Echo(g, Config{
		SendGridAPIKey: "xxx",
		Email:          "hoge@example.com",
	})

	rb := `{"title":"aaa","email":"from@examle.com","content":"","name":"name"}`
	r := httptest.NewRequest("POST", "/", strings.NewReader(rb))
	r.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	e.ServeHTTP(w, r)
	assert.Equal(t, http.StatusBadRequest, w.Code)
	assert.NotEmpty(t, strings.TrimSpace(w.Body.String()))

	rb = `{"title":"aaa","email":"from@examle.com","content":"aaaa","name":"name"}`
	r = httptest.NewRequest("POST", "/", strings.NewReader(rb))
	r.Header.Set("Content-Type", "application/json")
	w = httptest.NewRecorder()
	e.ServeHTTP(w, r)
	assert.Equal(t, http.StatusOK, w.Code)
	assert.Equal(t, `"ok"`, strings.TrimSpace(w.Body.String()))
}

type customValidator struct {
	validator *validator.Validate
}

func (cv *customValidator) Validate(i any) error {
	if err := cv.validator.Struct(i); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}
	return nil
}

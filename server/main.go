package main

import (
	"errors"
	"fmt"
	"net/http"

	"github.com/eukarya-inc/reearth-plateauview/server/cmsintegration"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/reearth/reearthx/log"
	"github.com/reearth/reearthx/rerror"
	"golang.org/x/net/http2"
)

func main() {
	log.Infof("reearth-plateauview\n")

	conf := must(NewConfig())
	log.Infof("config: %s", conf.Print())

	logger := log.NewEcho()
	e := echo.New()
	e.HideBanner = true
	e.Logger = logger
	e.HTTPErrorHandler = errorHandler(e.DefaultHTTPErrorHandler)
	e.Use(
		middleware.Recover(),
		logger.AccessLogger(),
	)

	e.GET("/ping", func(c echo.Context) error {
		return c.JSON(http.StatusOK, "pong")
	})

	must0(cmsintegration.Echo(e.Group(""), conf.CMSIntegration()))

	addr := fmt.Sprintf("[::]:%d", conf.Port)
	log.Fatalln(e.StartH2CServer(addr, &http2.Server{}))
}

func must[T any](t T, err error) T {
	if err != nil {
		log.Fatalln(err)
	}
	return t
}

func must0(err error) {
	if err != nil {
		log.Fatalln(err)
	}
}

func errorHandler(next func(error, echo.Context)) func(error, echo.Context) {
	return func(err error, c echo.Context) {
		if c.Response().Committed {
			return
		}

		code, msg := errorMessage(err, func(f string, args ...interface{}) {
			c.Echo().Logger.Errorf(f, args...)
		})
		if err := c.JSON(code, map[string]string{
			"error": msg,
		}); err != nil {
			next(err, c)
		}
	}
}

func errorMessage(err error, log func(string, ...interface{})) (int, string) {
	code := http.StatusBadRequest
	msg := err.Error()

	if err2, ok := err.(*echo.HTTPError); ok {
		code = err2.Code
		if msg2, ok := err2.Message.(string); ok {
			msg = msg2
		} else if msg2, ok := err2.Message.(error); ok {
			msg = msg2.Error()
		} else {
			msg = "error"
		}
		if err2.Internal != nil {
			log("echo internal err: %+v", err2)
		}
	} else if errors.Is(err, rerror.ErrNotFound) {
		code = http.StatusNotFound
		msg = "not found"
	} else {
		if ierr := rerror.UnwrapErrInternal(err); ierr != nil {
			code = http.StatusInternalServerError
			msg = "internal server error"
		}
	}

	return code, msg
}

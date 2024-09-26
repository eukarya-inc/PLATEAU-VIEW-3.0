FROM golang:1.23 AS builder
WORKDIR /app
RUN --mount=type=bind,target=. CGO_ENABLED=0 go build -o /bin/citygmlpacker ./citygmlpacker

FROM gcr.io/distroless/static-debian12
COPY --from=builder /bin/citygmlpacker /citygmlpacker
ENTRYPOINT ["/citygmlpacker"]

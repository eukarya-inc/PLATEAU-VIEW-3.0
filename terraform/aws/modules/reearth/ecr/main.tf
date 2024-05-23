resource "aws_ecr_repository" "reearth_server" {
  name                 = "reearth-server"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}
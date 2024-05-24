resource "aws_route53_zone" "public_zone" {
  name = "${var.base_domain}."
}
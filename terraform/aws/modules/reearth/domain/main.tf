resource "aws_route53_record" "reearth_server" {
  zone_id = var.route53_zone_id
  name    = var.reearth_server_domain.domain_name
  type    = "CNAME"
  ttl     = "300"
  records = [var.reearth_server_domain.dns_target]
}

resource "aws_route53_record" "reearth_server_certificate" {
  for_each = {
    for record in var.reearth_server_domain.certificate_validation_records : record.name => {
      name   = record.name
      record = record.value
      type   = record.type
    }
  }

  zone_id = var.route53_zone_id
  name    = each.value.name
  type    = each.value.type
  ttl     = "300"
  records = [each.value.record]
}
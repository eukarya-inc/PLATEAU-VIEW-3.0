resource "aws_route53_record" "reearth_cms_server" {
  zone_id = var.route53_zone_id
  name    = var.reearth_cms_server_domain.domain_name
  type    = "CNAME"
  ttl     = "300"
  records = [var.reearth_cms_server_domain.dns_target]
}

resource "aws_route53_record" "reearth_cms_server_certificate" {
  for_each = {
    for record in var.reearth_cms_server_domain.certificate_validation_records : record.name => {
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

resource "aws_route53_record" "plateauview_api" {
  zone_id = var.route53_zone_id
  name    = var.plateauview_api_domain.domain_name
  type    = "CNAME"
  ttl     = "300"
  records = [var.plateauview_api_domain.dns_target]
}

resource "aws_route53_record" "plateauview_api_certificate" {
  for_each = {
    for record in var.plateauview_api_domain.certificate_validation_records : record.name => {
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

resource "aws_route53_record" "plateauview_geo" {
  zone_id = var.route53_zone_id
  name    = var.plateauview_geo_domain.domain_name
  type    = "CNAME"
  ttl     = "300"
  records = [var.plateauview_geo_domain.dns_target]
}

resource "aws_route53_record" "plateauview_geo_certificate" {
  for_each = {
    for record in var.plateauview_geo_domain.certificate_validation_records : record.name => {
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
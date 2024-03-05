module "reearth" {
  source = "./modules/reearth"

  auth0_domain               = var.auth0_domain
  dns_managed_zone_name      = google_dns_managed_zone.zone.name
  domain                     = var.domain
  gcp_project_id             = var.gcp_project_id
  mongodb_connection_string  = var.mongodb_connection_string
  reearth_marketplace_secret = var.reearth_marketplace_secret
  prefix                     = var.prefix
}

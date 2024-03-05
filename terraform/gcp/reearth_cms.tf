module "reearth_cms" {
  source = "./modules/reearth_cms"

  auth0_domain = var.auth0_domain

  ckan_token                = var.ckan_token
  domain                    = var.domain
  dns_managed_zone_name     = google_dns_managed_zone.zone.name
  fme_token                 = var.fme_token
  gcp_project_id            = data.google_project.project.project_id
  mongodb_connection_string = var.mongodb_connection_string
  plateau_view              = var.plateau_view
  prefix                    = var.prefix
  sendgrid_api_key          = var.sendgrid_api_key
}

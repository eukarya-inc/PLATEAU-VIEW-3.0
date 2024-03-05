output "plateau_view_cms_webhook_url" {
  value = "https://api.${var.domain}/webhook"
}

output "plateau_view_cms_webhook_secret" {
  value     = module.reearth_cms.plateau_view_cms_webhook_secret
  sensitive = true
}

output "plateau_view_sdk_token" {
  value     = module.reearth_cms.plateau_view_sdk_token
  sensitive = true
}

output "plateau_view_sidebar_token" {
  value     = module.reearth_cms.plateau_view_sidebar_token
  sensitive = true
}

output "plateau_view_cms_url" {
  value = module.reearth_cms.plateau_view_cms_url
}

output "plateau_view_reearth_url" {
  value = module.reearth.plateau_view_reearth_url
}

output "plateau_view_sidecar_url" {
  value = module.reearth_cms.plateau_view_url
}

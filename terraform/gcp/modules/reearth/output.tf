output "auth0_action_signup" {
  value = module.auth0.action_signup
}

output "plateau_view_reearth_url" {
  value = local.reearth_domain
}

output "plateau_view_reearth_api_url" {
  value = local.api_reearth_domain
}

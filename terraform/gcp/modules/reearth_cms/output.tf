output "auth0_action_signup" {
  value = module.auth0.action_signup
}

output "plateau_view_cms_url" {
  value = local.cms_domain
}

output "plateau_view_cms_webhook_secret" {
  value = random_password.plateau_view_env["REEARTH_PLATEUVIEW_CMS_WEBHOOK_SECRET"].result
}

output "plateau_view_sdk_token" {
  value = random_password.plateau_view_env["REEARTH_PLATEUVIEW_SDK_TOKEN"].result
}

output "plateau_view_sidebar_token" {
  value = random_password.plateau_view_env["REEARTH_PLATEUVIEW_SIDEBAR_TOKEN"].result
}

output "plateau_view_url" {
  value = local.api_domain
}

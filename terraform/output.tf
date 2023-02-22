output "plateauview_cms_webhook_url" {
  value = "https://api.${var.base_domain}/webhook"
}

output "plateauview_cms_webhook_secret" {
  value = module.reearth-cms.plateauview_cms_webhook_secret
}

output "plateauview_sdk_token" {
  value = module.reearth-cms.plateauview_sdk_token
}

output "plateauview_sidebar_token" {
  value = module.reearth-cms.plateauview_sidebar_token
}
output "plateauview_cms_webhook_secret" {
  value = random_string.plateauview_api_env["REEARTH_PLATEAUVIEW_CMS_WEBHOOK_SECRET"].result
}

output "plateauview_sdk_token" {
  value = random_string.plateauview_api_env["REEARTH_PLATEAUVIEW_SDK_TOKEN"].result
}

output "plateauview_sidebar_token" {
  value = random_string.plateauview_api_env["REEARTH_PLATEAUVIEW_SIDEBAR_TOKEN"].result
}

output "auth0_action_singup" {
  value = module.auth0.action_singup
}
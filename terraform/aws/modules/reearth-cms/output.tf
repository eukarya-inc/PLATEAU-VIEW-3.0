output "cms_app_runner_service_arn" {
  value = aws_apprunner_service.reearth_cms_server.arn
}

output "plateauview_api_app_runner_arn" {
  value = aws_apprunner_service.plateauview_api.arn
}

output "plateauview_geo_app_runner_arn" {
  value = aws_apprunner_service.plateauview_geo.arn
}

output "plateauview_cms_webhook_secret" {
  value     = random_password.plateauview_env["REEARTH_PLATEUVIEW_CMS_WEBHOOK_SECRET"].result
  sensitive = true
}

output "plateauview_sdk_token" {
  value     = random_password.plateauview_env["REEARTH_PLATEUVIEW_SDK_TOKEN"].result
  sensitive = true
}

output "plateauview_sidebar_token" {
  value     = random_password.plateauview_env["REEARTH_PLATEUVIEW_SIDEBAR_TOKEN"].result
  sensitive = true
}
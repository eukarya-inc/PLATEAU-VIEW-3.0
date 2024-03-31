module "reearth_ecr" {
  source = "./modules/reearth/ecr"
  prefix = var.prefix
}

module "reearth" {
  source = "./modules/reearth"

  prefix = var.prefix
  region = var.region

  reearth_domain          = local.reearth_domain
  cesium_ion_access_token = var.cesium_ion_access_token
  reearth_web_config      = var.reearth_web_config

  plateauview_api_domain      = ""
  reearth_image_identifier    = module.reearth_ecr.image_identifier
  cognito_auth_domain         = module.cognito.auth_domain
  cognito_user_pool_id        = module.cognito.user_pool_client_id
  cognito_user_pool_client_id = module.cognito.user_pool_id
  mongodb_connection_string   = var.mongodb_connection_string
}

module "reearth_domain" {
  source = "./modules/reearth/domain"

  reearth_domain         = local.reearth_domain
  app_runner_service_arn = module.reearth.app_runner_service_arn
  route53_zone_id        = aws_route53_zone.reearth.zone_id

}
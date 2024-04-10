module "reearth_cms_ecr" {
  source = "./modules/reearth-cms/ecr"
}

module "reearth_cms" {
  source = "./modules/reearth-cms"

  prefix = var.prefix
  region = var.region

  cms_domain                = local.cms_domain
  cesium_ion_access_token   = var.cesium_ion_access_token
  editor_url                = var.editor_url
  mongodb_connection_string = var.mongodb_connection_string
  reearth_cms_web_config    = var.reearth_cms_web_config


  cms_image_identifier        = "${module.reearth_cms_ecr.cms_image_identifier}:latest"
  cognito_auth_domain         = module.cognito.auth_domain
  cognito_user_pool_id        = module.cognito.user_pool_client_id
  cognito_user_pool_endpoint  = module.cognito.user_pool_endpoint
  cognito_user_pool_client_id = module.cognito.user_pool_id

  cms_worker_image_identifier    = "${module.reearth_cms_ecr.cms_worker_image_identifier}:latest"
  plateauview_api_domain         = local.plateauview_api_domain
  plateauview_cms_plateauproject = var.plateauview_cms_plateauproject
  plateauview_ckan_baseurl       = var.plateauview_ckan_baseurl
  reearth_domain                 = local.reearth_domain
  plateauview_ckan_org           = var.plateauview_ckan_org
  plateauview_cms_systemproject  = var.plateauview_cms_systemproject
  plateauview_fme_baseurl        = var.plateauview_fme_baseurl
  plateauview_api_image_identifier = "${module.reearth_cms_ecr.plateauview_api_image_identifier}:latest"

  plateauview_geo_domain           = local.plateauview_geo_domain
  plateauview_geo_image_identifier = "${module.reearth_cms_ecr.plateauview_geo_image_identifier}:latest"

}

module "reearth_cms_domain" {
  source = "./modules/reearth-cms/domain"

  route53_zone_id = aws_route53_zone.public_zone.zone_id

  reearth_cms_server_domain = module.reearth_cms.reearth_cms_server_custom_domain_association
  plateauview_api_domain    = module.reearth_cms.plateauview_api_custom_domain_association
  plateauview_geo_domain    = module.reearth_cms.plateauview_geo_custom_domain_association

}
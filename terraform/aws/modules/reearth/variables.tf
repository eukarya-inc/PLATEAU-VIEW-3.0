variable "prefix" {
  type        = string
  description = "service name prefix"
}

variable "region" {
  type        = string
  description = "aws region"
}

variable "cognito_user_pool_client_id" {
  type        = string
  description = "cognito user pool client id"
}

variable "cognito_user_pool_id" {
  type        = string
  description = "cognito user pool id"
}

variable "cognito_auth_domain" {
  type        = string
  description = "cognito auth domain"
}

variable "cesium_ion_access_token" {
  type        = string
  description = "cesium ion access token"
}

variable "reearth_domain" {
  type        = string
  description = "cms domain"
}

variable "plateauview_api_domain" {
  type        = string
  description = "plateauview api domain"
}

variable "reearth_image_identifier" {
  type        = string
  description = "image identifier"
}

variable "reearth_web_config" {
  type = object({
    brand = object({
      background = string
      logoUrl    = string
    })
  })
  description = "Re:Earthの設定"
}

variable "mongodb_connection_string" {
  type        = string
  description = "MongoDB Altasのデータベース接続文字列"
  sensitive   = true
}
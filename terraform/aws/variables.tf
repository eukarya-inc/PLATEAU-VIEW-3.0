variable "prefix" {
  type        = string
  default     = "reearth"
  description = "作成されるリソース名のプレフィックス"
}

variable "region" {
  type        = string
  default     = "us-west-1"
  description = "AWSリージョン"
}

variable "base_domain" {
  type        = string
  description = "ベースドメイン"
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

variable "reearth_cms_web_config" {
  type = object({
    coverImageUrl = string
    logoUrl       = string
  })
  description = "Re:Earth CMSの設定"
}

variable "editor_url" {
  type        = string
  description = "エディタのURL"
}

variable "cesium_ion_access_token" {
  type        = string
  description = "cesium ion access token"
}

variable "mongodb_connection_string" {
  type        = string
  description = "MongoDB Altasのデータベース接続文字列"
  sensitive   = true
}

#-----------------------
# cms
#-----------------------
variable "plateauview_cms_plateauproject" {
  type = string
}
variable "plateauview_ckan_baseurl" {
  type = string
}

variable "plateauview_ckan_org" {
  type = string
}

variable "plateauview_cms_systemproject" {
  type = string
}

variable "plateauview_fme_baseurl" {
  type = string
}

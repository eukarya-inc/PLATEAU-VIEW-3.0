resource "aws_apprunner_service" "plateauview_api" {
  service_name = "${var.prefix}-plateauview-api"
  health_check_configuration {
    healthy_threshold   = 1
    interval            = 10
    path                = "/"
    protocol            = "TCP"
    timeout             = 5
    unhealthy_threshold = 5
  }
  instance_configuration {
    cpu               = "512"
    instance_role_arn = aws_iam_role.plateauview_api_instance.arn
    memory            = "1024"
  }
  network_configuration {
    ip_address_type = "IPV4"
    egress_configuration {
      egress_type = "DEFAULT"
    }
    ingress_configuration {
      is_publicly_accessible = true
    }
  }
  observability_configuration {
    observability_enabled = false
  }
  source_configuration {
    auto_deployments_enabled = true
    authentication_configuration {
      access_role_arn = aws_iam_role.plateauview_api_access.arn
    }
    image_repository {
      image_identifier      = var.plateauview_api_image_identifier
      image_repository_type = "ECR"
      image_configuration {
        port = "8080"
        runtime_environment_secrets = merge({
          for secret in toset(local.plateauview_randoms) : secret => aws_ssm_parameter.plateauview_env_secret_random[secret].arn
          },
          {
            for secret in toset(setsubtract(local.plateauview_randoms, local.plateauview_secrets)) : secret => aws_ssm_parameter.plateauview_env_secret_empty[secret].arn

        })
        runtime_environment_variables = {
          REEARTH_PLATEAUVIEW_FME_BASEURL        = var.plateauview_fme_baseurl
          REEARTH_PLATEAUVIEW_CMS_BASEURL        = "https://${var.cms_domain}"
          REEARTH_PLATEAUVIEW_CKAN_BASEURL       = var.plateauview_ckan_baseurl
          REEARTH_PLATEAUVIEW_CKAN_ORG           = var.plateauview_ckan_org
          REEARTH_PLATEAUVIEW_CMS_SYSTEMPROJECT  = var.plateauview_cms_systemproject
          REEARTH_PLATEAUVIEW_OPINION_TO         = var.plateauview_opinion_to
          REEARTH_PLATEAUVIEW_OPINION_FROM       = var.plateauview_opinion_from
          REEARTH_PLATEAUVIEW_CMS_PLATEAUPROJECT = var.plateauview_cms_plateauproject
          # REEARTH_PLATEUVIEW_SDK_TOKEN           = var.plateauview_sdk_token
          # REEARTH_PLATEUVIEW_SIDEBAR_TOKEN       = var.plateauview_sidebar_token
          # REEARTH_PLATEUVIEW_CMS_WEBHOOK_SECRET  = var.plateauview_cms_webhook_secret
        }
      }
    }
  }
}


resource "aws_iam_role" "plateauview_api_access" {
  name = "${title(var.prefix)}PlateauviewAPIECRAccessRole"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Principal = {
          Service = "build.apprunner.amazonaws.com"
        },
        Action = "sts:AssumeRole"
      },
      {
        Effect = "Allow",
        Principal = {
          Service = "tasks.apprunner.amazonaws.com"
        },
        Action = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_iam_role" "plateauview_api_instance" {
  name = "${title(var.prefix)}PlateauviewAPIInstanceRole"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Principal = {
          Service = "build.apprunner.amazonaws.com"
        },
        Action = "sts:AssumeRole"
      },
      {
        Effect = "Allow",
        Principal = {
          Service = "tasks.apprunner.amazonaws.com"
        },
        Action = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_iam_role_policy" "plateauview_api_access" {
  name = "${title(var.prefix)}PlateauviewAPIECRAccessPolicy"
  role = aws_iam_role.plateauview_api_access.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchCheckLayerAvailability",
          "ecr:BatchGetImage",
          "ecr:DescribeImages",
          "ecr:GetAuthorizationToken"
        ]
        Resource = "*"
      },
    ]
  })
}

resource "aws_iam_role_policy" "plateauview_api_instance" {
  name = "${title(var.prefix)}PlateauviewAPIInstancePolicy"
  role = aws_iam_role.plateauview_api_instance.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "sns:Publish",
          "ssm:GetParameters"
        ]
        Resource = "*"
      },
    ]
  })
}


locals {
  plateauview_randoms = [
    "REEARTH_PLATEUVIEW_CMS_WEBHOOK_SECRET",
    "REEARTH_PLATEUVIEW_SECRET",
    "REEARTH_PLATEUVIEW_SDK_TOKEN",
    "REEARTH_PLATEUVIEW_SIDEBAR_TOKEN",
  ]
  plateauview_secrets = [
    "REEARTH_PLATEUVIEW_CKAN_TOKEN",
    "REEARTH_PLATEUVIEW_CMS_TOKEN",
    "REEARTH_PLATEUVIEW_CMS_WEBHOOK_SECRET",
    "REEARTH_PLATEUVIEW_FME_TOKEN",
    "REEARTH_PLATEUVIEW_SECRET",
    "REEARTH_PLATEUVIEW_SENDGRID_API_KEY",
  ]
}

resource "random_password" "plateauview_env" {
  for_each = toset(local.plateauview_randoms)
  length   = 32
  special  = false
}

resource "aws_ssm_parameter" "plateauview_env_secret_random" {
  for_each  = toset(local.plateauview_randoms)
  name      = "/${var.prefix}/plateauview/${each.value}"
  type      = "SecureString"
  value     = random_password.plateauview_env[each.value].result
  overwrite = true
}

resource "aws_ssm_parameter" "plateauview_env_secret_empty" {
  for_each  = toset(setsubtract(local.plateauview_randoms, local.plateauview_secrets))
  name      = "/${var.prefix}/plateauview/${each.value}"
  type      = "SecureString"
  value     = "DUMMY"
  overwrite = true
}

resource "aws_apprunner_custom_domain_association" "plateauview_api" {
  service_arn          = aws_apprunner_service.plateauview_api.arn
  domain_name          = var.plateauview_api_domain
  enable_www_subdomain = false
}
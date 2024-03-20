terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.21"
    }

    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }

    auth0 = {
      source  = "auth0/auth0"
      version = "~> 1.2"
    }
  }

  required_version = ">= 1.7.5"
}

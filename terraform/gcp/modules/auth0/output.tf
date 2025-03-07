output "client_spa" {
  value = auth0_client.spa
}

output "client_m2m" {
  value = auth0_client_credentials.m2m
}

output "action_secret" {
  value = random_password.action_secret
}

output "action_signup" {
  value = auth0_action.signup
}

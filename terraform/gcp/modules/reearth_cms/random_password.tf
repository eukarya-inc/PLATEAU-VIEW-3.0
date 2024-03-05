resource "random_password" "plateau_view_env" {
  for_each = toset(local.plateau_view_randoms)
  length   = 32
  special  = false
}

resource "google_compute_health_check" "plateauview_tiles" {
  project             = data.google_project.project.project_id
  check_interval_sec  = 5
  healthy_threshold   = 2
  name                = "plateauview-tiles"
  timeout_sec         = 5
  unhealthy_threshold = 10

  http_health_check {
    request_path = "/" # TODO: Change to /tiles
    port         = 8888
  }
}

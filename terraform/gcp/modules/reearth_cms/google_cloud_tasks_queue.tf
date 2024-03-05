resource "google_cloud_tasks_queue" "cms_decompress" {
  project  = data.google_project.project.project_id
  name     = "decompress"
  location = var.gcp_region

  rate_limits {
    max_concurrent_dispatches = 1000
    max_dispatches_per_second = 500
  }

  retry_config {
    max_attempts  = 50
    max_backoff   = "3600s"
    max_doublings = 16
    min_backoff   = "10s"
  }

  stackdriver_logging_config {
    sampling_ratio = 1.0
  }
}

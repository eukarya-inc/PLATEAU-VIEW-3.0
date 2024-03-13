resource "google_storage_bucket_iam_binding" "static_public_read" {
  bucket = google_storage_bucket.static.name
  role   = "roles/storage.objectViewer"
  members = [
    "allUsers",
    "serviceAccount:service-${data.google_project.project.number}@compute-system.iam.gserviceaccount.com",
  ]
}

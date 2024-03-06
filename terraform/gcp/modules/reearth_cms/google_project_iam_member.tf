resource "google_project_iam_member" "cms_worker_m2m" {
  project = data.google_project.project.project_id
  role    = google_project_iam_custom_role.cms_worker_m2m.id
  member  = "serviceAccount:${google_service_account.cms_worker_m2m.email}"
}

resource "google_project_iam_member" "reearth_cms" {
  project = data.google_project.project.project_id
  member  = "serviceAccount:${google_service_account.reearth_cms.email}"
  role    = google_project_iam_custom_role.reearth_cms.id
}

resource "google_project_iam_member" "reearth_cms_worker" {
  project = data.google_project.project.project_id
  member  = "serviceAccount:${google_service_account.reearth_cms_worker.email}"
  role    = google_project_iam_custom_role.reearth_cms_worker.id
}

resource "google_project_iam_member" "plateauview_api" {
  role    = google_project_iam_custom_role.plateauview_api.id
  member  = "serviceAccount:${google_service_account.plateauview_api.email}"
  project = data.google_project.project.project_id
}

resource "google_project_iam_member" "plateauview_geo" {
  role    = google_project_iam_custom_role.plateauview_geo.id
  member  = "serviceAccount:${google_service_account.plateauview_geo.email}"
  project = data.google_project.project.project_id
}

output "bucket_name" {
  description = "S3 bucket used by the CSV processor."
  value       = module.csv_upload_bucket.s3_bucket_id
}

output "bucket_arn" {
  description = "S3 bucket ARN."
  value       = module.csv_upload_bucket.s3_bucket_arn
}

output "upload_prefix" {
  description = "S3 prefix used by the application."
  value       = var.upload_prefix
}


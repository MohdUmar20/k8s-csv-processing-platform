module "csv_upload_bucket" {
  source  = "terraform-aws-modules/s3-bucket/aws"
  version = "5.14.1"

  bucket = var.bucket_name

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true

  control_object_ownership = true
  object_ownership         = "BucketOwnerEnforced"

  versioning = {
    enabled = true
  }

  server_side_encryption_configuration = {
    rule = {
      apply_server_side_encryption_by_default = {
        sse_algorithm = "AES256"
      }
    }
  }

  lifecycle_rule = [
    {
      id      = "transition-processed-csv-to-glacier"
      enabled = true

      filter = {
        prefix = "${var.upload_prefix}/"
      }

      transition = [
        {
          days          = var.glacier_transition_days
          storage_class = "GLACIER"
        }
      ]

      noncurrent_version_transition = [
        {
          noncurrent_days = var.glacier_transition_days
          storage_class   = "GLACIER"
        }
      ]
    }
  ]

  tags = var.tags
}


variable "aws_region" {
  description = "AWS region for S3 resources."
  type        = string
  default     = "eu-west-1"
}

variable "aws_profile" {
  description = "Local AWS CLI profile used for Terraform operations."
  type        = string
  default     = "aws-personal"
}

variable "bucket_name" {
  description = "Globally unique S3 bucket name for processed CSV uploads."
  type        = string
}

variable "glacier_transition_days" {
  description = "Number of days before uploaded CSV objects transition to Glacier Flexible Retrieval."
  type        = number
  default     = 30
}

variable "upload_prefix" {
  description = "S3 prefix used by the application for processed CSV uploads."
  type        = string
  default     = "processed-csv"
}

variable "tags" {
  description = "Common tags for created resources."
  type        = map(string)
  default = {
    Project     = "k8s-csv-processing-platform"
    Environment = "case-study"
    ManagedBy   = "terraform"
  }
}


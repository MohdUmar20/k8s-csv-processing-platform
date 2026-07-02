# k8s-csv-processing-platform

A DevOps case study implementation for a CSV processing web application with local Docker/Minikube validation, Amazon S3 storage, Helm-based Kubernetes manifests, Ansible configuration management, Terraform-managed S3 lifecycle rules, and kOps reference cluster configuration.

## What This Implements

- Python FastAPI web app to upload and parse CSV files in the attached `soh.csv` format.
- CSV rows are rendered back in the browser after processing.
- Processed source files are uploaded to Amazon S3.
- Previously processed files are listed from S3.
- Docker image for local/container execution.
- Helm chart for Kubernetes reuse across environments.
- Kubernetes pod with Nginx and the app in the same pod.
- Shared public/static files through an `emptyDir` shared volume, not NFS.
- Service and HorizontalPodAutoscaler.
- Ansible-managed app/Helm configuration.
- Terraform S3 bucket with Glacier lifecycle transition.
- kOps cluster config examples with multiple instance groups, spot/on-demand capacity, and cluster autoscaler.

## Repository Layout

```text
app/                    FastAPI app, templates, static assets, tests dependencies
nginx/                  Nginx sidecar config
helm/csv-processor/     Helm chart for Minikube/Kubernetes
terraform/              S3 bucket and lifecycle configuration
ansible/                Localhost config management and Helm deployment playbook
kops/                   Reference kOps cluster and autoscaler configs
docs/                   Architecture and operational documentation
sample-data/            Sample CSV copied from the assignment attachment
tests/                  Unit tests for CSV parsing and app behavior
```

## Prerequisites

- Docker
- Minikube
- kubectl
- Helm
- Terraform
- Ansible
- AWS CLI configured with profile `aws-personal`
- Python 3.11+

## AWS S3 Setup

The application uses real Amazon S3 in both local and Kubernetes modes. Create the bucket with Terraform:

```bash
cd terraform
terraform init
terraform plan -var='bucket_name=k8s-csv-processing-platform-<unique-suffix>'
terraform apply -var='bucket_name=k8s-csv-processing-platform-<unique-suffix>'
```

Terraform defaults:

- AWS profile: `aws-personal`
- AWS region: `eu-west-1`
- Glacier transition: after 30 days
- Object expiration: disabled by default

Export the bucket name:

```bash
export AWS_PROFILE=aws-personal
export AWS_REGION=eu-west-1
export S3_BUCKET_NAME=<terraform-output-bucket-name>
export S3_UPLOAD_PREFIX=processed-csv
```

## Run Locally

```bash
python3 -m venv .venv
source .venv/bin/activate
make install
make test
make run
```

Open:

```text
http://localhost:8000
```

Upload:

```text
sample-data/soh.csv
```

## Run With Docker

```bash
docker build -t k8s-csv-processing-platform:local .
docker run --rm -p 8000:8000 \
  -e AWS_PROFILE=aws-personal \
  -e AWS_REGION=eu-west-1 \
  -e S3_BUCKET_NAME="$S3_BUCKET_NAME" \
  -e S3_UPLOAD_PREFIX=processed-csv \
  -v "$HOME/.aws:/home/appuser/.aws:ro" \
  k8s-csv-processing-platform:local
```

If Docker Desktop hangs while pulling public images because of its credential store, use a temporary Docker config for public pulls/builds:

```bash
mkdir -p /tmp/docker-no-creds
printf '{}' > /tmp/docker-no-creds/config.json
DOCKER_CONFIG=/tmp/docker-no-creds docker build -t k8s-csv-processing-platform:local .
```

## Deploy To Minikube

Build the image directly inside Minikube:

```bash
minikube start
minikube addons enable metrics-server
eval "$(minikube docker-env)"
docker build -t k8s-csv-processing-platform:local .
```

Create AWS credentials secret for local Minikube testing:

```bash
kubectl create namespace csv-processor --dry-run=client -o yaml | kubectl apply -f -
kubectl -n csv-processor create secret generic aws-credentials \
  --from-file=credentials="$HOME/.aws/credentials" \
  --from-file=config="$HOME/.aws/config" \
  --dry-run=client -o yaml | kubectl apply -f -
```

Deploy with Helm:

```bash
helm upgrade --install csv-processor helm/csv-processor \
  --namespace csv-processor \
  --set image.repository=k8s-csv-processing-platform \
  --set image.tag=local \
  --set image.pullPolicy=Never \
  --set app.awsProfile=aws-personal \
  --set app.awsRegion=eu-west-1 \
  --set app.s3BucketName="$S3_BUCKET_NAME"
```

Access the service:

```bash
minikube service csv-processor -n csv-processor
```

## Deploy With Ansible

Ansible stores environment-specific application settings and runs Helm deployment commands against localhost:

```bash
ansible-playbook -i ansible/inventory.ini ansible/playbook.yml \
  -e s3_bucket_name="$S3_BUCKET_NAME"
```

## kOps Reference

The assignment asks for kOps cluster creation config but does not require a running cluster. The `kops/` directory contains reviewable configuration examples for:

- Cluster config
- On-demand instance group
- Spot instance group
- Cluster autoscaler deployment

These files are not applied during the first local validation phase.

## Documentation

See [docs/architecture.md](docs/architecture.md) for architecture diagrams, data flow, and design notes.

## Cleanup

Remove local Kubernetes deployment:

```bash
helm uninstall csv-processor -n csv-processor
kubectl delete namespace csv-processor
```

Destroy S3 resources when no longer needed:

```bash
cd terraform
terraform destroy -var='bucket_name=<your-bucket-name>'
```

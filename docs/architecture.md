# Architecture

## Local Development Flow

```mermaid
flowchart LR
  User["User browser"] --> App["FastAPI app on localhost or Docker"]
  User --> CSV["CSV upload"]
  App --> Parse["Parse and render rows"]
  App --> S3["Amazon S3 bucket"]
  S3 --> Glacier["Lifecycle transition to Glacier"]
```

## Kubernetes Pod Design

```mermaid
flowchart LR
  User["Browser"] --> Svc["Kubernetes Service"]
  Svc --> Nginx["Nginx container :8080"]
  Nginx --> App["FastAPI container :8000"]
  App --> Shared["emptyDir shared public files"]
  Nginx --> Shared
  App --> S3["Amazon S3"]
```

The app and Nginx run in the same pod. Public/static files are copied by the app into `/shared/public`, mounted by both containers through an `emptyDir` volume. This satisfies the shared storage requirement without using NFS.

## AWS Storage

```mermaid
flowchart TB
  App["CSV processor"] --> Bucket["Private S3 bucket"]
  Bucket --> Versioning["Versioning enabled"]
  Bucket --> Encryption["SSE-S3 encryption"]
  Bucket --> Lifecycle["Lifecycle rule"]
  Lifecycle --> Glacier["Glacier transition after 30 days"]
```

Terraform creates the S3 storage layer for processed CSV files. The bucket is private, encrypted, versioned, and configured with lifecycle transition for processed CSV objects.

## kOps Reference Architecture

```mermaid
flowchart TB
  Kops["kOps cluster config"] --> Master["Master instance group"]
  Kops --> OnDemand["On-demand node instance group"]
  Kops --> Spot["Mixed spot node instance group"]
  Autoscaler["Cluster autoscaler"] --> OnDemand
  Autoscaler --> Spot
  OnDemand --> Pods["Application pods"]
  Spot --> Pods
```

The kOps files are provided as reviewable infrastructure configuration. They are not applied in the local validation phase.

## Operational Notes

- Local mode and Minikube mode both use real Amazon S3.
- Minikube mounts AWS CLI credentials as a Kubernetes secret for local testing.
- Production AWS deployment should replace local AWS credential secrets with IAM roles for service accounts or node instance roles.
- The default Helm values use the published Docker Hub image so the same image reference can be reused across local Minikube and other Kubernetes environments.

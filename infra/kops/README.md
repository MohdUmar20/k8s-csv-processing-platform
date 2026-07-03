# kOps Reference Manifests

This directory contains reviewable kOps configuration for the case study. The assignment does not require a running cluster, so these files are intentionally written as portable examples rather than account-specific production manifests.

## Files

- `cluster.yaml` defines the AWS kOps cluster, networking, topology, IAM, RBAC, and etcd placement.
- `instancegroups/master-eu-west-1a.yaml` defines the control-plane instance group.
- `instancegroups/nodes-on-demand.yaml` defines baseline on-demand worker capacity.
- `instancegroups/nodes-spot-mixed.yaml` defines spot worker capacity with a mixed instance policy.
- `cluster-autoscaler-rbac.yaml` defines the service account and RBAC required by Cluster Autoscaler.
- `cluster-autoscaler.yaml` defines Cluster Autoscaler with AWS auto-discovery tags for all worker instance groups.
- `example.env` lists the values that should be replaced for a real AWS account.

## Portability Checklist

Before applying these manifests to a real account, replace the example values with environment-specific values:

- Cluster name: `csv-processor.example.com`
- kOps state store: `s3://replace-with-kops-state-store`
- VPC ID: `vpc-xxxxxxxx`
- AWS region and availability zones
- Private and utility subnet CIDR ranges
- Kubernetes version, if the target kOps version requires a different supported version

The worker instance groups include Cluster Autoscaler discovery tags:

- `k8s.io/cluster-autoscaler/enabled: "true"`
- `k8s.io/cluster-autoscaler/csv-processor.example.com: "owned"`

If the cluster name changes, update the cluster-specific autoscaler tag in both worker instance groups and the matching `--node-group-auto-discovery` argument in `cluster-autoscaler.yaml`.

## Example Apply Order

These commands are illustrative only. They are not part of the local Minikube validation path.

```bash
export KOPS_STATE_STORE=s3://replace-with-kops-state-store

kops replace -f infra/kops/cluster.yaml --state "$KOPS_STATE_STORE"
kops replace -f infra/kops/instancegroups/master-eu-west-1a.yaml --state "$KOPS_STATE_STORE"
kops replace -f infra/kops/instancegroups/nodes-on-demand.yaml --state "$KOPS_STATE_STORE"
kops replace -f infra/kops/instancegroups/nodes-spot-mixed.yaml --state "$KOPS_STATE_STORE"
kops update cluster csv-processor.example.com --state "$KOPS_STATE_STORE" --yes

kubectl apply -f infra/kops/cluster-autoscaler-rbac.yaml
kubectl apply -f infra/kops/cluster-autoscaler.yaml
```

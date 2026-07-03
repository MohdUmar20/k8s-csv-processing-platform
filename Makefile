.PHONY: install test run docker-build docker-push minikube-deploy terraform-init terraform-validate helm-lint helm-template ansible-check

PYTHON ?= python3
IMAGE ?= umar20/k8s-csv-processing-platform:0.1.0
HELM_RELEASE ?= csv-processor
HELM_NAMESPACE ?= csv-processor

install:
	$(PYTHON) -m pip install -r app/requirements.txt -r app/requirements-dev.txt

test:
	PYTHONPATH=. pytest -q

run:
	cd app && uvicorn main:app --host 0.0.0.0 --port 8000 --reload

docker-build:
	docker build -t $(IMAGE) .

docker-push:
	docker push $(IMAGE)

minikube-deploy:
	kubectl create namespace $(HELM_NAMESPACE) --dry-run=client -o yaml | kubectl apply -f -
	helm upgrade --install $(HELM_RELEASE) infra/helm/csv-processor \
		--namespace $(HELM_NAMESPACE) \
		--set image.repository=umar20/k8s-csv-processing-platform \
		--set image.tag=0.1.0 \
		--set image.pullPolicy=Always \
		--set app.awsProfile=$${AWS_PROFILE:-aws-personal} \
		--set app.awsRegion=$${AWS_REGION:-eu-west-1} \
		--set app.s3BucketName="$${S3_BUCKET_NAME}" \
		--set app.s3UploadPrefix=$${S3_UPLOAD_PREFIX:-processed-csv}
	kubectl -n $(HELM_NAMESPACE) rollout restart deployment/$(HELM_RELEASE)
	kubectl -n $(HELM_NAMESPACE) rollout status deployment/$(HELM_RELEASE)

terraform-init:
	cd infra/terraform && terraform init

terraform-validate:
	cd infra/terraform && terraform fmt -check && terraform validate

helm-lint:
	helm lint infra/helm/csv-processor

helm-template:
	helm template $(HELM_RELEASE) infra/helm/csv-processor --namespace $(HELM_NAMESPACE)

ansible-check:
	ansible-playbook -i infra/ansible/inventory.ini infra/ansible/playbook.yml --syntax-check

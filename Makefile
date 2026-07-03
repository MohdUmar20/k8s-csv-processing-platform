.PHONY: install test run docker-build terraform-init terraform-validate helm-lint helm-template ansible-check

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

terraform-init:
	cd terraform && terraform init

terraform-validate:
	cd terraform && terraform fmt -check && terraform validate

helm-lint:
	helm lint helm/csv-processor

helm-template:
	helm template $(HELM_RELEASE) helm/csv-processor --namespace $(HELM_NAMESPACE)

ansible-check:
	ansible-playbook -i ansible/inventory.ini ansible/playbook.yml --syntax-check

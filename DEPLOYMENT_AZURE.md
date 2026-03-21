# Azure Deployment Guide (SE4010 Assignment)

This repository is prepared for deployment using **GitHub Actions + Azure Container Apps**.

## Why Azure for This Project

For this specific assignment and current codebase, Azure Container Apps is a strong fit because:
- It is a managed container platform (meets orchestration requirement without full Kubernetes overhead).
- GitHub Actions integration is straightforward.
- It supports independent deployment per microservice.
- It provides built-in ingress, revisions, autoscaling, and managed identity support.

AWS ECS Fargate is also valid, but Azure is generally faster to set up for this project because your CI/CD now includes an Azure deploy workflow.

## CI/CD Workflows (Root)

All workflows are now in the repository root under `.github/workflows`.

- `reusable-java-service-ci.yml` - shared backend pipeline logic
- `gateway.yml`
- `user-service.yml`
- `store-service.yml`
- `product-service.yml`
- `order-service.yml`
- `notification-service.yml`
- `frontend.yml`
- `deploy-azure-container-app.yml` - manual deployment to existing Azure Container Apps

## Required GitHub Settings

### Repository Secrets

- `AZURE_CREDENTIALS`: Service principal JSON from `az ad sp create-for-rbac --sdk-auth`
- `SNYK_TOKEN` (optional): enable Snyk scans

### Repository Variables

- `AZURE_RESOURCE_GROUP`: resource group hosting your Container Apps

## Container Registry

Images are pushed to **GHCR** on push to `main`:

- `ghcr.io/<owner>/gocart-gateway`
- `ghcr.io/<owner>/gocart-user-service`
- `ghcr.io/<owner>/gocart-store-service`
- `ghcr.io/<owner>/gocart-product-service`
- `ghcr.io/<owner>/gocart-order-service`
- `ghcr.io/<owner>/gocart-notification-service`
- `ghcr.io/<owner>/gocart-frontend`

Tags:
- `latest` on default branch
- commit SHA tags

## Recommended Azure Setup

1. Create one **Container Apps Environment**.
2. Create 7 Container Apps (or minimum subset for demo):
   - gateway, user, store, product, order, notification, frontend
3. Set internal service-to-service URLs using internal ingress or FQDNs.
4. Set secrets via Container App secret store (never hardcode).
5. Restrict ingress:
   - Public: gateway + frontend
   - Internal: backend services where possible

## Deploy from GitHub Actions

1. Go to Actions.
2. Run `Deploy To Azure Container Apps` workflow.
3. Provide:
   - `image_name` (for example `gocart-user-service`)
   - `image_tag` (`latest` or SHA)
   - `container_app_name` (existing Azure Container App name)
4. Workflow updates image and prints the app FQDN.

## Assignment Evidence Checklist

Use this in your report and viva:

- CI pipeline run (build + tests + security scan)
- Docker image in GHCR
- Azure deployment run (workflow_dispatch)
- Inter-service communication proof (order calling user/store/product)
- Security controls:
  - JWT auth in user service
  - private/internal backend endpoints
  - least-privilege service principal for deployment
  - Trivy/Snyk scan results in CI

## Notes

- Keep costs in free tier by minimizing always-on replicas.
- Start with backend services + gateway; add frontend if time permits.
- For the 10-minute demo, deploy one service end-to-end first, then show one inter-service call chain.

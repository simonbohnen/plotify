#!/bin/bash

echo "AWS_REGION: $AWS_REGION"
echo "AWS_ACCOUNT_ID: $AWS_ACCOUNT_ID"
echo "REGISTRY_NAME: $REGISTRY_NAME"
echo "TAG: $TAG"

echo "Logging in to ECR"
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

echo "Building image"
docker build --no-cache --platform=linux/amd64 -t $REGISTRY_NAME --build-arg REPLICATE_API_TOKEN=$REPLICATE_API_TOKEN --build-arg VECTORIZER_AI_API_ID=$VECTORIZER_AI_API_ID --build-arg VECTORIZER_AI_API_SECRET=$VECTORIZER_AI_API_SECRET .

echo "Tagging image"
docker tag $REGISTRY_NAME:$TAG $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$REGISTRY_NAME:$TAG

echo "Pushing image to ECR"
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$REGISTRY_NAME:$TAG
#!/bin/bash
set -e

TARGET="$1" # eg for all stacks do --all

echo "Running Synth"
cdk synth --profile "profile nodeify" --region us-east-2
echo "Synth Complete"

echo "Deploying...."

cdk deploy --profile "profile nodeify" --region us-east-2 $TARGET --e

echo "Deployment Complete"
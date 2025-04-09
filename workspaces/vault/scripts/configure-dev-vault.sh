#!/bin/bash

export VAULT_ADDR='http://127.0.0.1:8200'
export VAULT_TOKEN='root'

# Create a kv v1 under secrets-v1/
vault secrets enable -path=secrets-v1 -version=1 kv

# Create a kv v2 under secrets-v2/
vault secrets enable -path=secrets-v2 -version=2 kv

# Create secrets for v1
vault kv put secrets-v1/website-v1/prod/database username="user" password="it's a secret"
vault kv put secrets-v1/website-v1/preprod/database username="user" password="it's a secret"

# Create secrets for v2
vault kv put secrets-v2/website-v2/prod/database username="user" password="it's a secret"
vault kv put secrets-v2/website-v2/preprod/database username="user" password="it's a secret"

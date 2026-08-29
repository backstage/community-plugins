# Kafka

This workspace contains plugins for integrating [Apache Kafka](https://kafka.apache.org/) with Backstage, allowing you to view cluster, topic, and consumer group information for a service directly on its entity page.

## Plugins

This workspace is composed of two packages:

- [kafka](./plugins/kafka/README.md) - The frontend plugin that adds a Kafka tab to entity pages, showing topic offsets and consumer group status per cluster.
- [kafka-backend](./plugins/kafka-backend/README.md) - The backend plugin that connects to your Kafka brokers and serves the data the frontend displays.

## Quick start

You will find detailed installation and configuration instructions in each plugin's README file.

```sh
# From your Backstage root directory
# install frontend
yarn --cwd packages/app add @backstage-community/plugin-kafka

# install backend
yarn --cwd packages/backend add @backstage-community/plugin-kafka-backend

# see the READMEs in the frontend and backend plugin for more details,
# including how to add the EntityKafkaContent tab and configure clusters/brokers
```

## About this workspace

Use these plugins to give service owners visibility into the Kafka topics and consumer groups their service depends on, without leaving Backstage. Clusters and brokers are configured per-entity through the `kafka` section of `app-config.yaml`, with optional TLS and SASL authentication.

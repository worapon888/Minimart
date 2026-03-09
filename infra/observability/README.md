# Observability Assets

This folder contains ready-to-use observability assets for MinimalMart API bottlenecks.

## Files

- `prometheus/prometheus.yml`
  - Scrape config for API metrics at `api:4000/metrics`.
- `prometheus/alerts.yml`
  - Alert rules for checkout latency/error ratio and DB contention.
- `grafana/dashboards/minimart-api-performance.json`
  - Grafana dashboard for checkout pay and DB bottleneck metrics.

## Metrics Required

The dashboard and alerts rely on:

- `checkout_pay_duration_ms`
- `checkout_pay_total`
- `db_query_duration_ms`
- `db_lock_contention_total`

## Recommended Next Step

Wire these files into your monitoring stack:

1. Mount `prometheus/prometheus.yml` and `prometheus/alerts.yml` into Prometheus.
2. Add Prometheus datasource in Grafana with UID `prometheus`.
3. Import `grafana/dashboards/minimart-api-performance.json`.

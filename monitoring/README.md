# Monitoring Stack

Local-dev observability for the Forum backend. See full design in
`Docs/superpowers/specs/2026-05-26-monitoring-stack-design.md`.

## Quick start

```bash
# from repo root
docker compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d
```

## URLs

| Service       | URL                            | Credentials   |
|---------------|--------------------------------|---------------|
| Grafana       | http://localhost:3001          | admin/admin   |
| Prometheus    | http://localhost:9090          | none          |
| Alertmanager  | http://localhost:9093          | none          |
| Loki API      | http://localhost:3100          | none          |
| Alloy UI      | http://localhost:12345         | none          |
| Backend /metrics | http://localhost:3000/metrics | none        |

## Dashboards

Auto-provisioned on first Grafana boot:
- **Forum Backend Overview** — request rate, latency percentiles, error rate, Node runtime.
- **Forum Alerts** — currently firing alerts + recent error logs.

## Alert rules

- `BackendDown` — backend scrape failing for 1m.
- `HighErrorRate` — 5xx ratio > 5% over 5m.
- `HighLatency` — p95 latency > 1s over 5m.
- `LogErrorSpike` — error log rate > 6/min for 2m.

All alerts log to Alertmanager stderr only. No external notification channels.

## Stopping

```bash
docker compose -f docker-compose.yml -f docker-compose.monitoring.yml down
```

Add `-v` to also delete TSDB/Loki/Grafana volumes.

## Troubleshooting

- **Prometheus target DOWN**: `docker logs forum_prometheus` — most often `forum_backend` not on `forum_net`.
- **No logs in Loki**: `docker logs forum_alloy` — check docker socket permissions and that backend has label `logging=alloy`.
- **Grafana datasource error**: `docker logs forum_grafana` — usually a typo in `datasources.yml`.

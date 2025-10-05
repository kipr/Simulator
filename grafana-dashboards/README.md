git st# Grafana Dashboards for KIPR Simulator

This directory contains pre-built Grafana dashboards for monitoring the KIPR Simulator.

## Dashboards

### 1. System Overview (`system-overview.json`)

**Focus:** Infrastructure and HTTP metrics

**Panels:**
- Simulator Pods Up
- CPU Usage
- Memory Usage
- HTTP Request Rate by endpoint
- HTTP Response Status (2xx, 4xx, 5xx)
- HTTP Response Time (p50, p95, p99)
- Memory Usage by Pod

**Use Cases:**
- Monitor overall system health
- Track HTTP performance
- Identify resource bottlenecks
- Debug connectivity issues

---

### 2. Application Metrics (`application-metrics.json`)

**Focus:** Business logic and user interactions

**Panels:**

**Compilation:**
- Compilation Rate by Status (success/error)
- Compilation Success Rate (gauge)
- Compilation Duration (p50, p95, p99)

**AI Assistant:**
- AI Request Rate by Status
- AI Token Usage (hourly)
- AI Response Time (p50, p95, p99)

**User Engagement:**
- Feedback Submissions by Sentiment
- Rate Limit Hits by Endpoint

**Use Cases:**
- Track feature usage
- Monitor AI costs (tokens)
- Identify compilation patterns
- Measure user satisfaction
- Debug rate limiting

---

### 3. Log Analysis (`log-analysis.json`)

**Focus:** Structured logs from Loki

**Panels:**
- Log Events by Type (ai_request, compilation, feedback, etc.)
- Log Events by Level (info, warn, error)
- AI Requests Log Table
- Top 10 AI Questions (24h)
- Failed Compilations (with error details)
- Compilation Errors by Type (hourly)
- Application Errors

**Use Cases:**
- Investigate user questions
- Analyze compilation errors
- Debug application issues
- Understand user behavior
- Track error trends

---

### 4. Combined Metrics + Logs (`combined-metrics-logs.json`)

**Focus:** Unified view correlating metrics and logs

**Panels:**

**Compilation Section:**
- Compilation Rate (from Prometheus)
- Compilation Errors by Type (from Loki)
- Recent Compilation Errors (log table)

**AI Assistant Section:**
- AI Request Rate (from Prometheus)
- AI Token Usage (from Prometheus)
- AI Response Time (from Prometheus)
- Top 20 AI Questions (from Loki)
- Recent AI Requests (log table)

**System Health Section:**
- Error Rate (from Prometheus)
- Error Log Rate (from Loki)
- Recent Errors (log table)

**Use Cases:**
- See the big picture
- Correlate metrics spikes with log events
- Investigate issues with full context
- Monitor both quantitative and qualitative data

---

## Import Instructions

### Method 1: Grafana UI (Recommended)

1. **Access Grafana:**
   ```bash
   kubectl port-forward -n observability svc/prometheus-stack-grafana 3001:80
   ```
   Open http://localhost:3001 (admin / see password below)

2. **Get admin password:**
   ```bash
   kubectl get secret -n observability prometheus-stack-grafana \
     -o jsonpath="{.data.admin-password}" | base64 --decode ; echo
   ```

3. **Import dashboard:**
   - Click **☰** menu → **Dashboards**
   - Click **New** → **Import**
   - Click **Upload JSON file**
   - Select a dashboard file
   - Select datasources when prompted:
     - **Prometheus:** `Prometheus`
     - **Loki:** `Loki`
   - Click **Import**

4. **Repeat for all dashboards**

### Method 2: ConfigMap (Automated)

Create a ConfigMap with the dashboard JSON:

```bash
kubectl create configmap grafana-dashboards \
  --from-file=system-overview.json \
  --from-file=application-metrics.json \
  --from-file=log-analysis.json \
  --from-file=combined-metrics-logs.json \
  -n observability
```

Then configure Grafana to load dashboards from the ConfigMap (requires Grafana Helm values update).

---

## Datasource Configuration

Before importing dashboards, ensure both datasources are configured:

### Prometheus (Auto-configured)

Already configured by `kube-prometheus-stack`. Verify:
- Go to **Configuration** → **Data sources**
- Find **Prometheus**
- Click **Test** → should show ✅

### Loki (Manual setup required)

1. In Grafana, go to **Configuration** → **Data sources**
2. Click **Add data source**
3. Select **Loki**
4. Configure:
   - **Name:** `Loki`
   - **URL:** `http://loki:3100`
5. Click **Save & Test** → should show ✅

---

## Dashboard Variables

Some dashboards have template variables:

### `$namespace`
- **Dashboard:** Log Analysis, Combined
- **Options:** `default`, `prerelease`
- **Purpose:** Filter logs by environment

### `$DS_PROMETHEUS` and `$DS_LOKI`
- **All dashboards**
- **Purpose:** Select datasources (auto-configured on import)

---

## Customization

After importing, you can:

1. **Edit panels:**
   - Click panel title → **Edit**
   - Modify queries, visualizations, thresholds

2. **Add panels:**
   - Click **Add panel** in top right
   - Choose visualization type
   - Write PromQL (Prometheus) or LogQL (Loki) query

3. **Create folders:**
   - Organize dashboards: e.g., "KIPR Production", "KIPR Prerelease"

4. **Set default home:**
   - Star a dashboard
   - Go to **Configuration** → **Preferences**
   - Set **Home Dashboard**

5. **Configure alerts:**
   - Edit panel → **Alert** tab
   - Define alert conditions
   - Configure notifications

---

## Useful Queries

### Prometheus (PromQL)

```promql
# Compilation success rate
sum(rate(compilation_requests_total{status="success"}[5m])) 
/ 
sum(rate(compilation_requests_total[5m]))

# AI token cost estimate (assuming $0.003/1K tokens for sonnet)
sum(rate(ai_tokens_total[1h])) / 1000 * 0.003

# P99 response time by endpoint
histogram_quantile(0.99, 
  sum(rate(http_request_duration_seconds_bucket[5m])) by (le, path)
)

# Requests per second
sum(rate(http_request_duration_seconds_count[5m]))

# Error rate
sum(rate(http_request_duration_seconds_count{status_code=~"5.."}[5m]))
/
sum(rate(http_request_duration_seconds_count[5m]))
```

### Loki (LogQL)

```logql
# All simulator logs
{namespace="default", app="simulator"}

# AI requests only
{namespace="default", type="ai_request"} | json

# Failed compilations
{namespace="default", type="compilation"} | json | status="error"

# Questions containing "motor"
{namespace="default", type="ai_request"} | json | question=~"(?i)motor"

# Long AI requests (>5s)
{namespace="default", type="ai_request"} | json | duration_ms > 5000

# Errors in last hour
{namespace="default", app="simulator"} | json | level="error"

# Rate of AI requests
sum(rate({namespace="default", type="ai_request"}[5m]))

# Top 10 questions
topk(10, sum by (question) (
  count_over_time({namespace="default", type="ai_request"} | json [24h])
))
```

---

## Refresh Rates

All dashboards are set to:
- **Auto-refresh:** 30 seconds
- **Time range:** Last 1 hour (adjustable in top right)

To change:
- Click **🕐** icon in top right
- Set refresh interval
- Set time range

---

## Troubleshooting

### Dashboard shows "No data"

**For Prometheus metrics:**
```bash
# Check metrics are being scraped
kubectl port-forward -n observability svc/prometheus-stack-kube-prom-prometheus 9090:9090

# Open Prometheus UI: http://localhost:9090
# Go to Status → Targets
# Find "simulator" targets - should be "UP"
```

**For Loki logs:**
```bash
# Check Promtail is running
kubectl get pods -n observability | grep promtail

# Check simulator has loki=true label
kubectl get pods -n <namespace> -l loki=true

# Check Loki logs
kubectl logs -n observability loki-0
```

### Panels show errors

**"Datasource not found":**
- Re-import dashboard and select correct datasources

**"Parse error":**
- Query syntax may be invalid for your Grafana/Loki/Prometheus version
- Try simplifying the query

**"Too many samples":**
- Reduce time range
- Increase query interval
- Add more specific label filters

### Slow dashboard performance

- Reduce time range (e.g., 1h instead of 24h)
- Increase refresh interval (1m instead of 30s)
- Simplify queries (remove complex aggregations)
- Use recording rules for expensive queries

---

## Best Practices

1. **Start with Combined Dashboard**
   - Gives you the full picture
   - Then drill into specific dashboards

2. **Use Time Range Wisely**
   - Last 1h for real-time monitoring
   - Last 24h for trends
   - Last 7d for weekly reviews

3. **Leverage Variables**
   - Switch between `default` (prod) and `prerelease` quickly

4. **Save Custom Views**
   - Create copies of dashboards for specific use cases
   - Example: "AI Debugging", "Compilation Analysis"

5. **Set Up Alerts**
   - Don't just visualize - get notified!
   - Use Prometheus AlertManager integration

6. **Regular Review**
   - Check dashboards daily
   - Look for anomalies
   - Validate after deployments

---

## Dashboard Links

Once imported, dashboards are linked:
- From Application Metrics → click "View Logs" → opens Log Analysis
- From System Overview → click "Dig Deeper" → opens Application Metrics
- From any dashboard → access others via **Dashboards** menu

---

## Exporting Dashboards

To save your customized dashboards:

1. Open dashboard
2. Click **Share** icon (top right)
3. Go to **Export** tab
4. Click **Save to file**
5. Commit to Git for version control

---

## Support

For issues or questions:
- Check [Grafana Documentation](https://grafana.com/docs/)
- Check [Prometheus Documentation](https://prometheus.io/docs/)
- Check [Loki Documentation](https://grafana.com/docs/loki/)
- Review `IMPLEMENTATION_ROADMAP.md` in parent directory

---

## Credits

These dashboards were created as part of the KIPR Simulator observability implementation (Phases 2-4).

**Metrics instrumented:**
- HTTP requests (via `prom-client`)
- Compilation events
- AI assistant requests
- User feedback
- Rate limiting

**Logs captured:**
- AI questions and responses
- Compilation attempts and errors
- User feedback
- Rate limit hits
- Application errors

**Stack:**
- Prometheus (metrics)
- Loki (logs)
- Grafana (visualization)
- Promtail (log shipping)
- Kubernetes (orchestration)


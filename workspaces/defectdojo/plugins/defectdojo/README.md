# DefectDojo Plugin

Frontend plugin for Backstage that provides UI components to display security findings from DefectDojo.

## Installation

### New Frontend System (Recommended)

If you're using the new Backstage frontend system, install the plugin as follows:

1. Install the plugin in your Backstage application:

```bash
# From the root of your Backstage application
yarn add --cwd packages/app @backstage-community/plugin-defectdojo
```

### Legacy Frontend System

If you're using the legacy frontend system:

1. Install the plugin in your Backstage application:

```bash
# From the root of your Backstage application
yarn add --cwd packages/app @backstage-community/plugin-defectdojo
```

2. Add the plugin to your frontend application in `packages/app/src/App.tsx`:

```typescript
import { defectdojoPlugin } from '@backstage-community/plugin-defectdojo';

// In the API configuration
const apis: AnyApiFactory[] = [
  // ... other APIs
  defectdojoPlugin.provide(defectdojoApiFactory),
];
```

3. Add the component to entity pages in `packages/app/src/components/catalog/EntityPage.tsx`:

```typescript
import { DefectDojoOverview } from '@backstage-community/plugin-defectdojo';

// In the component page
const overviewContent = (
  <Grid container spacing={3} alignItems="stretch">
    {/* ... other cards */}
    <Grid item md={6} xs={12}>
      <DefectDojoOverview />
    </Grid>
  </Grid>
);
```

## Configuration

### Entity Annotations

For an entity to display DefectDojo information, it must have the following annotation in its `catalog-info.yaml`:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: my-service
  annotations:
    defectdojo.org/product-id: '123' # Product ID in DefectDojo
    # OR
    defectdojo.org/product-name: 'My Product' # Product name in DefectDojo
spec:
  type: service
```

## Components

### DefectDojoOverview

Card that displays DefectDojo security findings for a specific entity.

**Features:**

- 📊 Vulnerability summary by severity
- 🔍 Expandable detailed view for each finding
- 🎨 Icons and colors differentiated by severity
- 🔄 Manual refresh button
- 📱 Responsive design
- 🔗 Direct links to DefectDojo

**States:**

- **No configuration**: Shows informative message about how to configure
- **Loading**: Shows progress indicator
- **Error**: Shows detailed error message
- **No vulnerabilities**: Shows success message
- **With vulnerabilities**: Shows summary and detailed list

## Development

### Run in development mode

```bash
yarn start
```

### Run tests

```bash
yarn test
```

### Linting

```bash
yarn lint
```

## API

The plugin uses the following interface to communicate with the backend:

```typescript
interface DefectDojoApi {
  getFindings(
    productId: number,
    engagementId?: number,
  ): Promise<{
    total: number;
    findings: DefectDojoVulnerability[];
  }>;
  getProduct(identifier: string | number): Promise<DefectDojoProduct>;
  getEngagements(productId: number): Promise<DefectDojoEngagement[]>;
}

interface DefectDojoVulnerability {
  id: number;
  title: string;
  severity: string;
  description: string;
  cwe: number;
  product: string;
  engagement: string;
  url: string;
  created: string;
}
```

## Customization

### Severity Colors

Colors are automatically assigned based on severity:

- **Critical/High**: Red (error)
- **Medium**: Orange (secondary)
- **Low**: Blue (primary)
- **Unknown**: Gray (default)

### Icons

Icons are assigned by severity:

- **Critical/High**: ⚠️ Warning
- **Medium**: 🛡️ Security
- **Low**: 🐛 Bug Report

## Risk and Trend Calculations

### Risk Score Calculation

The plugin calculates a weighted risk score based on vulnerability severity:

- **Critical**: 10 points
- **High**: 7 points
- **Medium**: 4 points
- **Low**: 1 point

The risk score is calculated as: `(weighted_sum / max_possible_score) * 100`

Where `max_possible_score = total_vulnerabilities * 10`

**Risk Levels:**

- **Minimal** (0-19%): Green (#4caf50)
- **Low** (20-39%): Blue (#2196f3)
- **Medium** (40-59%): Orange (#ff9800)
- **High** (60-79%): Red (#ff5722)
- **Critical** (80-100%): Dark Red (#f44336)

### Trend Calculation

When trends are enabled (`showTrends: true`), the plugin compares vulnerability counts between time periods:

- **Recent period**: Last 7 days
- **Previous period**: 7-14 days ago

Trend percentage is calculated as: `((recent_count - previous_count) / previous_count) * 100`

- **Positive trend** (+X%): Red arrow up - indicates increasing vulnerabilities
- **Negative trend** (-X%): Green arrow down - indicates decreasing vulnerabilities
- **No trend** (0%): No indicator shown

## Usage Examples

### Basic Configuration

```yaml
# catalog-info.yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: payment-service
  annotations:
    defectdojo.org/product-id: '42'
spec:
  type: service
  lifecycle: production
```

### EntityPage Integration

```typescript
// EntityPage.tsx
const serviceEntityPage = (
  <EntityLayout>
    <EntityLayout.Route path="/" title="Overview">
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <EntityAboutCard variant="gridItem" />
        </Grid>
        <Grid item xs={12} md={6}>
          <DefectDojoOverview />
        </Grid>
      </Grid>
    </EntityLayout.Route>
  </EntityLayout>
);
```

## Troubleshooting

### The card doesn't appear

Verify that:

1. The plugin is correctly installed and configured
2. The entity has the `defectdojo.org/product-id` or `defectdojo.org/product-name` annotation
3. The DefectDojo backend is working

### Loading errors

Common errors include:

- **Product not found**: The product ID doesn't exist in DefectDojo
- **Connection error**: The backend cannot connect to DefectDojo
- **Timeout**: The query took too long

### Performance

To improve performance:

- Configure `requestTimeoutMs` and `maxPages` in the backend
- Consider using pagination or filters in DefectDojo

/*
 * Copyright 2025 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { useState, useMemo } from 'react';
import {
  Typography,
  Box,
  Grid,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Badge,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
} from '@material-ui/core';
import SecurityIcon from '@material-ui/icons/Security';
import RefreshIcon from '@material-ui/icons/Refresh';
import AssessmentIcon from '@material-ui/icons/Assessment';
import Alert from '@material-ui/lab/Alert';
import { InfoCard, Progress } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import useAsync from 'react-use/lib/useAsync';
import { useApi, configApiRef } from '@backstage/core-plugin-api';
import { defectdojoApiRef, DefectDojoEngagement } from '../client';

// Import sub-components
import { MetricCard } from './MetricCard';
import { SecurityDashboard } from './SecurityDashboard';
import { FindingsList } from './FindingsList';
import { CweAnalysis } from './CweAnalysis';

// Import utilities
import {
  calculateAdvancedMetrics,
  calculateSeverityMetrics,
  calculateTrends,
  SeverityMetrics,
  FindingAnalytics,
} from './utils/defectDojoUtils';
import { useDefectDojoStyles } from './shared/styles';

/**
 * Props for DefectDojoOverview component
 * @public
 */
export interface DefectDojoOverviewProps {
  /**
   * Whether to show the findings list
   * @defaultValue true
   */
  showFindingsList?: boolean;
  /**
   * Whether to show trend indicators comparing last 7 days vs previous 7 days
   * @defaultValue true
   */
  showTrends?: boolean;
}

/**
 * DefectDojo Overview component for displaying security findings
 * @public
 */
export const DefectDojoOverview = ({
  showFindingsList = true,
  showTrends = true,
}: DefectDojoOverviewProps) => {
  const classes = useDefectDojoStyles();
  const { entity } = useEntity();
  const defectdojoApi = useApi(defectdojoApiRef);
  const config = useApi(configApiRef);

  const [showDetails, setShowDetails] = useState(false);
  const [expandedFindings, setExpandedFindings] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [selectedEngagement, setSelectedEngagement] = useState<string>('');
  const [engagements, setEngagements] = useState<DefectDojoEngagement[]>([]);
  const [loadingEngagements, setLoadingEngagements] = useState(false);

  // Get the product identifier (can be ID or name)
  const productIdentifier =
    entity?.metadata.annotations?.['defectdojo.org/product-id'] ||
    entity?.metadata.annotations?.['defectdojo.org/product-name'];

  let defectdojoBaseUrl: string | undefined;
  let defaultEngagement: string | undefined;
  try {
    defectdojoBaseUrl = config.getOptionalString('defectdojo.baseUrl');
    defaultEngagement = config.getOptionalString(
      'defectdojo.defaultEngagement',
    );
  } catch (error) {
    defectdojoBaseUrl = undefined;
    defaultEngagement = undefined;
  }

  // Show loading immediately when we have a product identifier
  const shouldShowInitialLoading = !!productIdentifier;

  // Load product and engagements
  const {
    value: product,
    loading: productLoading,
    error: productError,
  } = useAsync(async () => {
    if (!productIdentifier) {
      return undefined;
    }
    return await defectdojoApi.getProduct(
      !isNaN(Number(productIdentifier))
        ? Number(productIdentifier)
        : productIdentifier,
    );
  }, [productIdentifier, refreshKey]);

  // Load engagements when we have the product
  useAsync(async () => {
    if (!product?.id) return;

    setLoadingEngagements(true);
    try {
      const engagementList = await defectdojoApi.getEngagements(product.id);
      setEngagements(engagementList);

      // Set default engagement
      if (!selectedEngagement && defaultEngagement) {
        const defaultEng = engagementList.find(
          e => e.name === defaultEngagement,
        );
        if (defaultEng) {
          setSelectedEngagement(defaultEng.name);
        }
      }
    } catch (err) {
      // Error loading engagements - handled silently
    } finally {
      setLoadingEngagements(false);
    }
  }, [product?.id, defaultEngagement, refreshKey]);

  // Load findings
  const {
    value,
    loading: findingsLoading,
    error,
  } = useAsync(async () => {
    if (!product?.id) {
      return undefined;
    }

    // Get the selected engagement ID
    const selectedEngagementData = selectedEngagement
      ? engagements.find(eng => eng.name === selectedEngagement)
      : undefined;

    const data = await defectdojoApi.getFindings(
      product.id,
      selectedEngagementData?.id,
    );
    return data;
  }, [product?.id, defectdojoApi, refreshKey, selectedEngagement, engagements]);

  // Combined loading state
  const loading =
    productLoading ||
    findingsLoading ||
    (shouldShowInitialLoading && !product && !productError);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const openDefectDojo = () => {
    if (product?.id && defectdojoBaseUrl) {
      window.open(
        `${defectdojoBaseUrl}/product/${product.id}`,
        '_blank',
        'noopener,noreferrer',
      );
    }
  };

  // Get filtered vulnerabilities from API response
  const filteredVulnerabilities = useMemo(
    () => value?.findings || [],
    [value?.findings],
  );

  // Calculate metrics and analytics
  const metrics: SeverityMetrics = useMemo(
    () => calculateSeverityMetrics(filteredVulnerabilities),
    [filteredVulnerabilities],
  );
  const analytics: FindingAnalytics = useMemo(
    () => calculateAdvancedMetrics(filteredVulnerabilities),
    [filteredVulnerabilities],
  );

  // Calculate trends if enabled
  const trendsData = useMemo(
    () => calculateTrends(filteredVulnerabilities, showTrends),
    [filteredVulnerabilities, showTrends],
  );

  if (!productIdentifier) {
    return (
      <InfoCard
        title={
          <Box display="flex" alignItems="center">
            <AssessmentIcon className={classes.headerIcon} />
            DefectDojo Security Overview
          </Box>
        }
      >
        <Alert severity="info">
          <Typography variant="body2">
            To view DefectDojo security overview, configure the{' '}
            <code>defectdojo.org/product-id</code> or{' '}
            <code>defectdojo.org/product-name</code> annotation in your catalog
            entity.
          </Typography>
        </Alert>
      </InfoCard>
    );
  }

  return (
    <InfoCard
      title={
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <AssessmentIcon className={classes.headerIcon} />
            DefectDojo Overview
            <Badge
              badgeContent={metrics.total}
              color="primary"
              overlap="rectangular"
              style={{ marginLeft: 16 }}
            >
              <SecurityIcon />
            </Badge>
            {product && (
              <Typography
                variant="subtitle1"
                style={{
                  marginLeft: 16,
                  marginRight: 16,
                  color: 'text.secondary',
                }}
              >
                {product.name}
              </Typography>
            )}
          </Box>
          <Box
            display="flex"
            alignItems="center"
            flexWrap="wrap-reverse"
            style={{ gap: 8 }}
          >
            {/* Engagement Selector */}
            {engagements.length > 0 && (
              <FormControl size="small" style={{ minWidth: 150 }}>
                <InputLabel shrink>Engagement</InputLabel>
                <Select
                  value={selectedEngagement}
                  onChange={e =>
                    setSelectedEngagement(e.target.value as string)
                  }
                  disabled={loadingEngagements}
                  displayEmpty
                  renderValue={(selectedValue: unknown) => {
                    const stringValue = selectedValue as string;
                    if (stringValue === '') return 'All';
                    return stringValue;
                  }}
                >
                  <MenuItem value="">All</MenuItem>
                  {engagements.map(eng => (
                    <MenuItem key={eng.id} value={eng.name}>
                      {eng.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            {loadingEngagements && <CircularProgress size={20} />}
            <FormControlLabel
              control={
                <Switch
                  checked={showDetails}
                  onChange={e => setShowDetails(e.target.checked)}
                  size="small"
                />
              }
              label="Details"
              style={{ margin: 0 }}
            />
            <Tooltip title="Refresh data">
              <IconButton
                onClick={handleRefresh}
                disabled={loading}
                size="small"
                style={{ marginLeft: 'auto' }}
                aria-label="Refresh data"
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      }
    >
      {loading && <Progress />}

      {productError && (
        <Alert severity="error">
          Error loading product: {productError.message}
        </Alert>
      )}

      {error && (
        <Alert severity="error">
          Error loading security analysis: {error.message}
        </Alert>
      )}

      {!loading && !error && (
        <>
          <Grid container spacing={3}>
            {/* Main Dashboard */}
            <Grid item xs={12} md={6}>
              <SecurityDashboard
                metrics={metrics}
                analytics={analytics}
                loading={loading}
                hasData={value !== undefined}
                defectdojoBaseUrl={defectdojoBaseUrl}
                onOpenDefectDojo={openDefectDojo}
              />
            </Grid>

            {/* Severity Metrics */}
            <Grid item xs={12} md={6}>
              {!loading && (metrics.total > 0 || value !== undefined) && (
                <Grid container spacing={3} style={{ marginTop: 5 }}>
                  <Grid item xs={6}>
                    <MetricCard
                      title="Critical"
                      count={metrics.critical}
                      total={metrics.total}
                      severity="critical"
                      trend={showTrends ? trendsData.critical : undefined}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <MetricCard
                      title="High"
                      count={metrics.high}
                      total={metrics.total}
                      severity="high"
                      trend={showTrends ? trendsData.high : undefined}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <MetricCard
                      title="Medium"
                      count={metrics.medium}
                      total={metrics.total}
                      severity="medium"
                      trend={showTrends ? trendsData.medium : undefined}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <MetricCard
                      title="Low"
                      count={metrics.low}
                      total={metrics.total}
                      severity="low"
                      trend={showTrends ? trendsData.low : undefined}
                    />
                  </Grid>
                </Grid>
              )}
            </Grid>

            {/* CWE Analysis */}
            {metrics.total > 0 && showDetails && (
              <Grid item xs={12}>
                <CweAnalysis analytics={analytics} />
              </Grid>
            )}

            {/* Findings List */}
            {showFindingsList &&
              showDetails &&
              filteredVulnerabilities.length > 0 && (
                <Grid item xs={12}>
                  <FindingsList
                    findings={filteredVulnerabilities}
                    expanded={expandedFindings}
                    onToggleExpanded={() =>
                      setExpandedFindings(!expandedFindings)
                    }
                  />
                </Grid>
              )}
          </Grid>
        </>
      )}
    </InfoCard>
  );
};

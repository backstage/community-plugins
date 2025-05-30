/*
 * Copyright 2024 The Backstage Authors
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
import { PromLabel } from '@backstage-community/plugin-kiali-common/types';
import {
  Divider,
  FormControlLabel,
  FormLabel,
  Radio,
  Tooltip,
} from '@material-ui/core';
import Checkbox from '@material-ui/core/Checkbox';
import {
  Dropdown,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
} from '@patternfly/react-core';
import isEqual from 'lodash/isEqual';
import { default as React } from 'react';
import { classes } from 'typestyle';
import { history, URLParam } from '../../app/History';
import { KialiIcon } from '../../config/KialiIcon';
import { titleStyle } from '../../styles/DropdownStyles';
import { kialiStyle } from '../../styles/StyleUtils';
import {
  combineLabelsSettings,
  mergeLabelFilter,
  retrieveMetricsSettings,
} from '../Metrics/Helper';
import {
  allQuantiles,
  LabelsSettings,
  MetricsSettings,
  Quantiles,
} from './MetricsSettings';

interface Props {
  direction: string;
  hasHistograms: boolean;
  hasHistogramsAverage: boolean;
  hasHistogramsPercentiles: boolean;
  labelsSettings: LabelsSettings;
  onChanged: (state: MetricsSettings) => void;
  onLabelsFiltersChanged: (labelsFilters: LabelsSettings) => void;
}

type State = MetricsSettings & {
  allSelected: boolean;
  isOpen: boolean;
};

const checkboxSelectAllStyle = kialiStyle({ marginLeft: '0.5rem' });
const secondLevelStyle = kialiStyle({ marginLeft: '1rem' });
const spacerStyle = kialiStyle({ height: '0.5rem' });
const titleLabelStyle = kialiStyle({
  marginBottom: '0.5rem',
  fontSize: 'small',
});
const labelStyle = kialiStyle({ display: 'inline-block' });
const checkboxStyle = kialiStyle({ marginLeft: '1rem' });

export class MetricsSettingsDropdown extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const settings = retrieveMetricsSettings();
    settings.labelsSettings = combineLabelsSettings(
      props.labelsSettings,
      settings.labelsSettings,
    );
    this.state = { ...settings, isOpen: false, allSelected: false };
  }

  componentDidUpdate(prevProps: Props) {
    // TODO Move the sync of URL and state to a global place
    const changeDirection = prevProps.direction !== this.props.direction;
    const settings = retrieveMetricsSettings();
    const initLabelSettings = changeDirection
      ? settings.labelsSettings
      : new Map();
    const stateLabelsSettings = changeDirection
      ? initLabelSettings
      : this.state.labelsSettings;
    const labelsSettings = combineLabelsSettings(
      this.props.labelsSettings,
      stateLabelsSettings,
    );

    if (!isEqual(stateLabelsSettings, labelsSettings) || changeDirection) {
      this.setState(prevState => {
        return {
          labelsSettings: labelsSettings,
          showQuantiles: changeDirection
            ? settings.showQuantiles
            : prevState.showQuantiles,
          showAverage: changeDirection
            ? settings.showAverage
            : prevState.showAverage,
          showSpans: changeDirection ? settings.showSpans : prevState.showSpans,
        };
      }, this.checkSelected);
    }
  }

  private onToggle = (isOpen: boolean) => {
    this.setState({ isOpen: isOpen });
  };

  onGroupingChanged = (label: PromLabel, checked: boolean) => {
    const objLbl = this.state.labelsSettings.get(label);

    if (objLbl) {
      objLbl.checked = checked;
    }

    this.updateLabelsSettingsURL(this.state.labelsSettings);

    this.setState(
      prevState => ({
        labelsSettings: new Map(prevState.labelsSettings),
      }),
      () => {
        this.props.onChanged(this.state);
        this.checkSelected();
      },
    );
  };

  onLabelsFiltersChanged = (
    label: PromLabel,
    value: string,
    checked: boolean,
    singleSelection: boolean,
  ) => {
    const newValues = mergeLabelFilter(
      this.state.labelsSettings,
      label,
      value,
      checked,
      singleSelection,
    );
    this.updateLabelsSettingsURL(newValues);
    this.setState(
      prevState => ({
        labelsSettings: mergeLabelFilter(
          prevState.labelsSettings,
          label,
          value,
          checked,
          singleSelection,
        ),
      }),
      () => {
        this.props.onLabelsFiltersChanged(newValues);
        this.checkSelected();
      },
    );
  };

  onHistogramAverageChanged = (checked: boolean) => {
    const urlParams = new URLSearchParams(history.location.search);
    urlParams.set(URLParam.SHOW_AVERAGE, String(checked));
    history.replace(`${history.location.pathname}?${urlParams.toString()}`);

    this.setState({ showAverage: checked }, () =>
      this.props.onChanged(this.state),
    );
  };

  onHistogramOptionsChanged = (quantile: Quantiles, checked: boolean) => {
    const newQuantiles = checked
      ? [quantile].concat(this.state.showQuantiles)
      : this.state.showQuantiles.filter(q => quantile !== q);

    const urlParams = new URLSearchParams(history.location.search);
    urlParams.set(URLParam.QUANTILES, newQuantiles.join(' '));
    history.replace(`${history.location.pathname}?${urlParams.toString()}`);

    this.setState(
      prevState => ({
        showQuantiles: checked
          ? [quantile].concat(prevState.showQuantiles)
          : prevState.showQuantiles.filter(q => quantile !== q),
      }),
      () => this.props.onChanged(this.state),
    );
  };

  onBulkAll = () => {
    this.bulkUpdate(true);
    this.setState({ allSelected: true });
  };

  onBulkNone = () => {
    this.bulkUpdate(false);
    this.setState({ allSelected: false });
  };

  bulkUpdate = (selected: boolean): void => {
    this.state.labelsSettings.forEach(lblSetting => {
      lblSetting.checked = selected;

      Object.keys(lblSetting.values).forEach(value => {
        lblSetting.values[value] = selected;
      });
    });

    this.updateLabelsSettingsURL(this.state.labelsSettings);

    this.setState(
      prevState => ({
        labelsSettings: new Map(prevState.labelsSettings),
      }),
      () => {
        this.props.onChanged(this.state);
      },
    );
  };

  updateLabelsSettingsURL = (labelsSettings: LabelsSettings) => {
    // E.g.: bylbl=version=v1,v2,v4
    const urlParams = new URLSearchParams(history.location.search);
    urlParams.delete(URLParam.BY_LABELS);

    labelsSettings.forEach((lbl, name) => {
      if (lbl.checked) {
        const filters = Object.keys(lbl.values)
          .filter(k => lbl.values[k])
          .join(',');
        if (filters) {
          urlParams.append(URLParam.BY_LABELS, `${name}=${filters}`);
        } else {
          urlParams.append(URLParam.BY_LABELS, name);
        }
      }
    });

    history.replace(`${history.location.pathname}?${urlParams.toString()}`);
  };

  checkSelected = () => {
    let allSelected = true;
    this.state.labelsSettings.forEach(lblSetting => {
      if (lblSetting.checked === false) {
        allSelected = false;
      } else {
        Object.keys(lblSetting.values).forEach(value => {
          if (lblSetting.values[value] === false) {
            allSelected = false;
          }
        });
      }
    });

    this.setState({ allSelected: allSelected });
  };

  renderBulkSelector(): JSX.Element {
    return (
      <div>
        <div style={{ marginLeft: '-10px' }}>
          <Checkbox
            id="bulk-select-id"
            key="bulk-select-key"
            aria-label="Select all metric/label filters"
            checked={this.state.allSelected}
            onChange={() => {
              if (this.state.allSelected) {
                this.onBulkNone();
              } else {
                this.onBulkAll();
              }
            }}
          />
          <span className={checkboxSelectAllStyle}>
            Select all metric/label filters
          </span>
        </div>
        <Divider />
      </div>
    );
  }

  renderLabelOptions(): React.ReactElement {
    const displayGroupingLabels: any[] = [];

    this.state.labelsSettings.forEach((lblObj, promName) => {
      const labelsHTML =
        lblObj.checked && lblObj.values
          ? Object.keys(lblObj.values).map(val => (
              <div
                key={`groupings_${promName}_${val}`}
                className={secondLevelStyle}
              >
                {lblObj.singleSelection ? (
                  <Radio
                    checked={lblObj.values[val]}
                    id={val}
                    className={checkboxStyle}
                    onChange={(_event, _) => {
                      this.onLabelsFiltersChanged(promName, val, true, true);
                    }}
                    name={val}
                    value={val}
                  />
                ) : (
                  <FormControlLabel
                    control={
                      <Checkbox
                        id={val}
                        className={checkboxStyle}
                        checked={lblObj.values[val]}
                        onChange={(_event, checked) => {
                          this.onLabelsFiltersChanged(
                            promName,
                            val,
                            checked,
                            false,
                          );
                        }}
                      />
                    }
                    label={val}
                  />
                )}
              </div>
            ))
          : null;

      displayGroupingLabels.push(
        <div key={`groupings_${promName}`}>
          <FormControlLabel
            control={
              <Checkbox
                id={lblObj.displayName}
                className={checkboxStyle}
                checked={lblObj.checked}
                onChange={(_event, checked) =>
                  this.onGroupingChanged(promName, checked)
                }
              />
            }
            label={promName}
          />
          {labelsHTML}
        </div>,
      );
    });

    return (
      <>
        <FormLabel className={classes(titleLabelStyle, titleStyle, labelStyle)}>
          Show metrics by:
        </FormLabel>
        {displayGroupingLabels}
        <div className={spacerStyle} />
      </>
    );
  }

  renderHistogramOptions(): JSX.Element {
    const displayHistogramOptions = [
      <div key="histo_avg">
        <FormControlLabel
          control={
            <Checkbox
              id="histo_avg"
              className={checkboxStyle}
              checked={
                this.state.showAverage && this.props.hasHistogramsAverage
              }
              disabled={!this.props.hasHistogramsAverage}
              onChange={(_event, checked) =>
                this.onHistogramAverageChanged(checked)
              }
              name="Average"
            />
          }
          label="Average"
        />
      </div>,
    ].concat(
      allQuantiles.map((o, idx) => {
        const checked = this.state.showQuantiles.includes(o);
        return (
          <div key={`histo_${idx}`}>
            <FormControlLabel
              control={
                <Checkbox
                  id={o}
                  className={checkboxStyle}
                  checked={checked && this.props.hasHistogramsPercentiles}
                  disabled={!this.props.hasHistogramsPercentiles}
                  onChange={(_event, checkedE) =>
                    this.onHistogramOptionsChanged(o, checkedE)
                  }
                  name={`Quantile ${o}`}
                />
              }
              label={`Quantile ${o}`}
            />
          </div>
        );
      }),
    );

    return (
      <>
        <FormLabel
          className={classes(titleLabelStyle, titleStyle, labelStyle)}
          style={{ paddingRight: '0.5rem' }}
        >
          <Tooltip
            key="tooltip_histograms"
            title={
              <div style={{ textAlign: 'left' }}>
                <div>
                  "No data available" is displayed for a histogram that does not
                  have telemetry supporting the selected option. If no
                  histograms support the necessary telemetry, the option will be
                  disabled.
                </div>
              </div>
            }
          >
            <div>
              <span>Histograms: </span>
              <KialiIcon.Info />
            </div>
          </Tooltip>
        </FormLabel>
        {displayHistogramOptions}
        <div className={spacerStyle} />
      </>
    );
  }

  render() {
    const hasHistograms = this.props.hasHistograms;
    const hasLabels = this.state.labelsSettings.size > 0;

    if (!hasHistograms && !hasLabels) {
      return null;
    }

    return (
      <Dropdown
        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
          <MenuToggle
            ref={toggleRef}
            onClick={() => this.onToggle(!this.state.isOpen)}
            isExpanded={this.state.isOpen}
          >
            Metrics Settings
          </MenuToggle>
        )}
        isOpen={this.state.isOpen}
        onOpenChange={(isOpen: boolean) => this.onToggle(isOpen)}
      >
        <DropdownList style={{ padding: '20px' }}>
          {hasLabels && this.renderBulkSelector()}
          {hasLabels && this.renderLabelOptions()}
          {hasHistograms && this.renderHistogramOptions()}
        </DropdownList>
      </Dropdown>
    );
  }
}

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
import { useGaugeState, Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@mui/material/styles';
import { FONT_FAMILY } from '../../theme/fonts';
import { getGaugeColors } from '../../theme/themeUtils';
import CustomTooltip from '../common/CustomTooltip';
import Typography from '@mui/material/Typography';

const getArcColor = (
  value: number,
  tickValue: number,
  gaugeColors: ReturnType<typeof getGaugeColors>,
) => {
  if (tickValue === 0) {
    return gaugeColors.background;
  }
  return value > tickValue ? gaugeColors.warning : gaugeColors.success;
};

function GaugeCenterLabel({
  value,
  width,
  height,
  unit = 'Hours',
}: {
  value: number;
  width: number;
  height: number;
  unit?: string;
}) {
  const theme = useTheme();
  return (
    <g>
      <text
        x={width / 2}
        y={height / 2 / 2 + 20}
        fontSize="24px"
        fontWeight="bold"
        fontFamily={FONT_FAMILY}
        fill={theme.palette.text.primary}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {value ? Math.round(value) : '-'}
      </text>
      <text
        x={width / 2}
        y={height / 2 / 2 + 40}
        fontSize="12px"
        fontWeight="100"
        fontFamily={FONT_FAMILY}
        fill={theme.palette.text.secondary}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {value ? unit : null}
      </text>
    </g>
  );
}

function GaugeBottomLabels({
  minValue,
  maxValue,
  categoryLabel,
  width = '135px',
}: {
  minValue: number;
  maxValue: number;
  categoryLabel: string;
  width?: string;
}) {
  const theme = useTheme();
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width,
        marginTop: 7,
      }}
    >
      <Typography
        style={{ fontSize: '14px', color: theme.palette.text.secondary }}
      >
        {minValue}
      </Typography>
      <Typography
        style={{
          fontSize: '14px',
          fontWeight: 500,
          fontFamily: FONT_FAMILY,
          color: theme.palette.text.primary,
        }}
      >
        {categoryLabel}
      </Typography>
      <Typography
        style={{ fontSize: '14px', color: theme.palette.text.secondary }}
      >
        {maxValue}
      </Typography>
    </div>
  );
}

function GaugePointer({
  markerValue,
  min = 0,
  max = 100,
  displayMarkerValue,
}: {
  markerValue: number | null | undefined;
  min?: number;
  max?: number;
  displayMarkerValue?: number;
}) {
  const theme = useTheme();
  const gaugeColors = getGaugeColors(theme);
  const { startAngle, endAngle, innerRadius, outerRadius, cx, cy } =
    useGaugeState();

  // Handle null or undefined values - show tick in middle with "_" label
  if (markerValue === null || markerValue === undefined) {
    return null;
  }

  // Clamp markerValue between min and max
  const clampedValue = Math.min(Math.max(markerValue, min), max);

  // Map markerValue to angle (radians)
  const valueRatio = (clampedValue - min) / (max - min);
  const valueAngle = startAngle + valueRatio * (endAngle - startAngle);

  // Pointer line endpoints
  const x1 = cx + innerRadius * Math.sin(valueAngle);
  const y1 = cy - innerRadius * Math.cos(valueAngle);

  const x2 = cx + outerRadius * Math.sin(valueAngle);
  const y2 = cy - outerRadius * Math.cos(valueAngle);

  // Label position outside outer radius
  const labelOffset = 10; // pixels outside outerRadius
  const labelRadius = outerRadius + labelOffset;

  const labelX = cx + labelRadius * Math.sin(valueAngle);
  const labelY = cy - labelRadius * Math.cos(valueAngle);

  return (
    <g>
      {/* Pointer line */}
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={gaugeColors.pointer}
        strokeWidth={2}
        strokeLinecap="round"
      />

      {/* Marker value label positioned outside outerRadius */}
      <text
        x={labelX}
        y={labelY}
        fontSize="12px"
        textAnchor="middle"
        dominantBaseline="middle"
        fill={theme.palette.text.primary}
        style={{
          fontFamily: FONT_FAMILY,
        }}
      >
        {displayMarkerValue || markerValue}*
      </text>
    </g>
  );
}

export { GaugeBottomLabels };

export default function GaugeChart({
  width,
  height,
  value,
  tickValue,
  minValue,
  maxValue,
  tooltip,
  unit = 'Hours',
  displayValue,
  displayTickValue,
}: {
  width: number;
  height: number;
  value: number;
  tickValue: number;
  minValue: number;
  maxValue: number;
  tooltip?: string;
  unit?: string;
  displayValue?: number;
  displayTickValue?: number;
}) {
  const theme = useTheme();
  const gaugeColors = getGaugeColors(theme);
  const [animatedValue, setAnimatedValue] = useState(0);
  const animationRef = useRef<number>();
  const currentValueRef = useRef(0);

  // Custom animation function
  const animateValue = (
    start: number,
    end: number,
    duration: number = 1000,
  ) => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = start + (end - start) * easeOut;

      setAnimatedValue(currentValue);
      currentValueRef.current = currentValue;

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animate();
  };

  // Animate when value changes
  useEffect(() => {
    animateValue(currentValueRef.current, value);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value]);

  // Define margins (adjust as needed)
  const margin = { top: 20, right: 20, bottom: 20, left: 20 };

  const innerWidth = width - margin.left - margin.right; // 220 - 20 - 20 = 180
  const innerHeight = height - margin.top - margin.bottom; // 200 - 20 - 20 = 160   // fixed centerY (you can adjust this)

  const outerRadius = Math.min(innerWidth, innerHeight) / 2.2;
  // Math.min(180, 160) / 2.2 ≈ 72.73

  const innerRadius = outerRadius * 0.72;

  const arcColor = getArcColor(value, tickValue, gaugeColors);

  // 72.73 * 0.67 ≈ 48.72

  const gaugeElement = (
    <Gauge
      width={width}
      height={height / 2}
      startAngle={-90}
      endAngle={90}
      innerRadius={innerRadius}
      outerRadius={outerRadius}
      value={animatedValue}
      valueMin={minValue}
      valueMax={maxValue}
      text={() => null}
      sx={() => ({
        [`& .${gaugeClasses.valueArc}`]: {
          fill: arcColor,
          transition: 'none', // Disable default transitions to let react-spring handle it
        },
        [`& .${gaugeClasses.referenceArc}`]: {
          fill: gaugeColors.background,
        },
      })}
    >
      <GaugePointer
        markerValue={tickValue}
        min={minValue}
        max={maxValue}
        displayMarkerValue={displayTickValue}
      />
      <GaugeCenterLabel
        value={displayValue || animatedValue}
        width={width}
        height={height}
        unit={unit}
      />
    </Gauge>
  );

  // If tooltip is provided, wrap with CustomTooltip, otherwise return gauge directly
  return tooltip ? (
    <div style={{ display: 'inline-block', cursor: 'pointer' }}>
      <CustomTooltip title={tooltip} placement="top">
        <div style={{ width: '100%', height: '100%' }}>{gaugeElement}</div>
      </CustomTooltip>
    </div>
  ) : (
    gaugeElement
  );
}

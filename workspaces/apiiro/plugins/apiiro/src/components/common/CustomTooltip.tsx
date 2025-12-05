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
import { useState, ReactNode, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '@mui/material/styles';

interface CustomTooltipProps {
  title: string | ReactNode;
  children: ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  enterDelay?: number;
  leaveDelay?: number;
  disableInteractive?: boolean;
  centered?: boolean;
}

export const CustomTooltip = ({
  title,
  children,
  placement = 'top',
  enterDelay = 0,
  leaveDelay = 0,
  disableInteractive = true,
  centered = false,
}: CustomTooltipProps) => {
  const theme = useTheme();
  const [showTooltip, setShowTooltip] = useState(false);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [arrowOffset, setArrowOffset] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const enterTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const calculateTooltipPosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft =
      window.pageXOffset || document.documentElement.scrollLeft;

    let idealTop = 0;
    let idealLeft = 0;

    // Calculate ideal position
    switch (placement) {
      case 'top':
        idealTop = triggerRect.top + scrollTop - tooltipRect.height - 8;
        idealLeft =
          triggerRect.left +
          scrollLeft +
          triggerRect.width / 2 -
          tooltipRect.width / 2;
        break;
      case 'bottom':
        idealTop = triggerRect.bottom + scrollTop + 8;
        idealLeft =
          triggerRect.left +
          scrollLeft +
          triggerRect.width / 2 -
          tooltipRect.width / 2;
        break;
      case 'left':
        idealTop =
          triggerRect.top +
          scrollTop +
          triggerRect.height / 2 -
          tooltipRect.height / 2;
        idealLeft = triggerRect.left + scrollLeft - tooltipRect.width - 8;
        break;
      case 'right':
        idealTop =
          triggerRect.top +
          scrollTop +
          triggerRect.height / 2 -
          tooltipRect.height / 2;
        idealLeft = triggerRect.right + scrollLeft + 8;
        break;
      default:
        idealTop = triggerRect.top + scrollTop - tooltipRect.height - 8;
        idealLeft =
          triggerRect.left +
          scrollLeft +
          triggerRect.width / 2 -
          tooltipRect.width / 2;
    }

    let finalLeft = idealLeft;
    let finalTop = idealTop;

    // Adjust for viewport boundaries
    const margin = 8;
    if (finalLeft < scrollLeft + margin) {
      finalLeft = scrollLeft + margin;
    }
    if (
      finalLeft + tooltipRect.width >
      scrollLeft + window.innerWidth - margin
    ) {
      finalLeft = scrollLeft + window.innerWidth - tooltipRect.width - margin;
    }
    if (finalTop < scrollTop + margin) {
      finalTop = scrollTop + margin;
    }
    if (
      finalTop + tooltipRect.height >
      scrollTop + window.innerHeight - margin
    ) {
      finalTop = scrollTop + window.innerHeight - tooltipRect.height - margin;
    }

    setArrowOffset({ top: idealTop - finalTop, left: idealLeft - finalLeft });
    setTooltipPosition({ top: finalTop, left: finalLeft });
    setIsTooltipVisible(true); // Make it visible after position is set
  }, [placement]);

  const handleMouseEnter = () => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }

    if (enterDelay > 0) {
      enterTimeoutRef.current = setTimeout(() => {
        setShowTooltip(true);
      }, enterDelay);
    } else {
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    if (enterTimeoutRef.current) {
      clearTimeout(enterTimeoutRef.current);
      enterTimeoutRef.current = null;
    }

    if (leaveDelay > 0) {
      leaveTimeoutRef.current = setTimeout(() => {
        setShowTooltip(false);
        setIsTooltipVisible(false);
        setArrowOffset({ top: 0, left: 0 });
      }, leaveDelay);
    } else {
      setShowTooltip(false);
      setIsTooltipVisible(false);
      setArrowOffset({ top: 0, left: 0 });
    }
  };

  const handleTooltipMouseEnter = () => {
    if (!disableInteractive && leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
  };

  const handleTooltipMouseLeave = () => {
    if (!disableInteractive) {
      handleMouseLeave();
    }
  };

  useEffect(() => {
    if (showTooltip) {
      // Position is calculated after the tooltip is rendered but before it's visible
      calculateTooltipPosition();
    }
  }, [showTooltip, calculateTooltipPosition]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (enterTimeoutRef.current) {
        clearTimeout(enterTimeoutRef.current);
      }
      if (leaveTimeoutRef.current) {
        clearTimeout(leaveTimeoutRef.current);
      }
    };
  }, []);

  const getArrowStyle = () => {
    // Get theme-aware arrow color
    const arrowColor =
      theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ffffff';

    const baseArrow = {
      position: 'absolute' as const,
      width: 0,
      height: 0,
    };

    switch (placement) {
      case 'top':
        return {
          ...baseArrow,
          top: '100%',
          left: `calc(50% + ${arrowOffset.left}px)`,
          transform: 'translateX(-50%)',
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: `6px solid ${arrowColor}`,
          filter:
            theme.palette.mode === 'dark'
              ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
              : 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
        };
      case 'bottom':
        return {
          ...baseArrow,
          bottom: '100%',
          left: `calc(50% + ${arrowOffset.left}px)`,
          transform: 'translateX(-50%)',
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderBottom: `6px solid ${arrowColor}`,
          filter:
            theme.palette.mode === 'dark'
              ? 'drop-shadow(0 -2px 4px rgba(0,0,0,0.3))'
              : 'drop-shadow(0 -2px 4px rgba(0,0,0,0.1))',
        };
      case 'left':
        return {
          ...baseArrow,
          left: '100%',
          top: `calc(50% - ${arrowOffset.top}px)`,
          transform: 'translateY(-50%)',
          borderTop: '6px solid transparent',
          borderBottom: '6px solid transparent',
          borderLeft: `6px solid ${arrowColor}`,
          filter:
            theme.palette.mode === 'dark'
              ? 'drop-shadow(2px 0 4px rgba(0,0,0,0.3))'
              : 'drop-shadow(2px 0 4px rgba(0,0,0,0.1))',
        };
      case 'right':
        return {
          ...baseArrow,
          right: '100%',
          top: `calc(50% - ${arrowOffset.top}px)`,
          transform: 'translateY(-50%)',
          borderTop: '6px solid transparent',
          borderBottom: '6px solid transparent',
          borderRight: `6px solid ${arrowColor}`,
          filter:
            theme.palette.mode === 'dark'
              ? 'drop-shadow(-2px 0 4px rgba(0,0,0,0.3))'
              : 'drop-shadow(-2px 0 4px rgba(0,0,0,0.1))',
        };
      default:
        return {
          ...baseArrow,
          top: '100%',
          left: `calc(50% - ${arrowOffset.left}px)`,
          transform: 'translateX(-50%)',
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: `6px solid ${arrowColor}`,
          filter:
            theme.palette.mode === 'dark'
              ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
              : 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
        };
    }
  };

  const renderTooltip = () => {
    if (!showTooltip) return null;

    return createPortal(
      <div
        ref={tooltipRef}
        style={{
          position: 'absolute',
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
          visibility: isTooltipVisible ? 'visible' : 'hidden',
          backgroundColor:
            theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#ffffff',
          color:
            theme.palette.mode === 'dark'
              ? theme.palette.common.white
              : theme.palette.text.primary,
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '400',
          lineHeight: '1.4',
          maxWidth: '300px',
          minWidth: 'max-content',
          zIndex: 9999,
          boxShadow:
            theme.palette.mode === 'dark'
              ? '0 4px 12px rgba(0, 0, 0, 0.5), 0 2px 4px rgba(0, 0, 0, 0.3)'
              : '0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)',
          border:
            theme.palette.mode === 'dark'
              ? `1px solid ${theme.palette.grey[800]}`
              : '1px solid rgba(0, 0, 0, 0.08)',
          whiteSpace: 'normal',
          wordWrap: 'break-word',
          pointerEvents: disableInteractive ? 'none' : 'auto',
        }}
        onMouseEnter={handleTooltipMouseEnter}
        onMouseLeave={handleTooltipMouseLeave}
      >
        {title}
        <div style={getArrowStyle()} />
      </div>,
      document.body,
    );
  };

  return (
    <>
      <div
        ref={triggerRef}
        style={{
          position: 'relative',
          display: centered ? 'flex' : 'inline-block',
          alignItems: centered ? 'center' : undefined,
          justifyContent: centered ? 'center' : undefined,
          height: centered ? '100%' : undefined,
          width: centered ? '100%' : undefined,
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
      {renderTooltip()}
    </>
  );
};

export default CustomTooltip;

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
import * as VendorIcons from '../assets/vendors';

// Create a mapping object for easier lookup (React components)
const vendorIconMap: Record<string, any> = {
  // Direct mappings
  ...VendorIcons,
};

export interface VendorIconProps {
  /**
   * The vendor name to display icon for
   */
  vendor: string;

  /**
   * Size of the icon
   */
  size?: number | string;

  /**
   * Additional CSS class name
   */
  className?: string;

  /**
   * Additional inline styles
   */
  style?: { [key: string]: any };

  /**
   * Alt text for accessibility
   */
  alt?: string;

  /**
   * Fallback component to render if vendor icon is not found
   */
  fallback?: any;
}

/**
 * VendorIcon component that displays SVG icons for various vendors/technologies
 *
 * @example
 * // Basic usage
 * <VendorIcon vendor="github" size={24} />
 *
 * @example
 * // With fallback
 * <VendorIcon
 *   vendor="unknown-vendor"
 *   size={32}
 *   fallback={<DefaultIcon />}
 * />
 *
 * @example
 * // With custom styling
 * <VendorIcon
 *   vendor="aws"
 *   size="2rem"
 *   className="vendor-icon"
 *   style={{ marginRight: '8px' }}
 * />
 */
export const VendorIcon = ({
  vendor,
  size = 24,
  className,
  style,
  alt,
  fallback = null,
}: VendorIconProps) => {
  // Normalize vendor name for lookup with multiple strategies
  const normalizeVendorName = (name: string) => {
    // Strategy 1: PascalCase (remove spaces, capitalize each word)
    const pascalCase = name
      .split(/[\s-_]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');

    // Strategy 2: Remove all special characters and capitalize first letter
    const cleanName = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .replace(/^(.)/, match => match.toUpperCase());

    return { pascalCase, cleanName };
  };

  const { pascalCase, cleanName } = normalizeVendorName(vendor);

  // Try multiple lookup strategies in order of preference
  const iconSource =
    vendorIconMap[vendor] || // Exact match
    vendorIconMap[pascalCase] || // PascalCase match (e.g., "Prisma Cloud" -> "PrismaCloud")
    vendorIconMap[cleanName] || // Clean normalized match
    vendorIconMap[vendor.toLowerCase()] || // Lowercase match
    vendorIconMap[vendor.toUpperCase()] || // Uppercase match
    vendorIconMap[vendor.replace(/\s+/g, '')] || // Remove spaces only
    null;

  if (!iconSource) {
    return fallback || null;
  }

  const iconStyle = {
    width: size,
    height: size,
    display: 'inline-block',
    ...style,
  };

  // Check if iconSource is a string (URL) or a React component
  if (typeof iconSource === 'string') {
    // SVG imported as URL - use img tag
    return (
      <img
        src={iconSource}
        className={className}
        style={iconStyle}
        alt={alt || `${vendor} icon`}
        title={alt || vendor}
      />
    );
  }

  // SVG imported as React component - render directly
  const IconComponent = iconSource;
  return (
    <IconComponent
      className={className}
      style={iconStyle}
      alt={alt || `${vendor} icon`}
      title={alt || vendor}
    />
  );
};

/**
 * Get all available vendor names
 */
export const getAvailableVendors = (): string[] => {
  return Object.keys(vendorIconMap).sort();
};

/**
 * Check if a vendor icon exists
 */
export const hasVendorIcon = (vendor: string): boolean => {
  // Use same normalization logic as VendorIcon component
  const normalizeVendorName = (name: string) => {
    const pascalCase = name
      .split(/[\s-_]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');

    const cleanName = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .replace(/^(.)/, match => match.toUpperCase());

    return { pascalCase, cleanName };
  };

  const { pascalCase, cleanName } = normalizeVendorName(vendor);

  return !!(
    vendorIconMap[vendor] ||
    vendorIconMap[pascalCase] ||
    vendorIconMap[cleanName] ||
    vendorIconMap[vendor.toLowerCase()] ||
    vendorIconMap[vendor.toUpperCase()] ||
    vendorIconMap[vendor.replace(/\s+/g, '')]
  );
};

/**
 * Get vendor icon component directly
 */
export const getVendorIcon = (vendor: string): any | null => {
  // Use same normalization logic as VendorIcon component
  const normalizeVendorName = (name: string) => {
    const pascalCase = name
      .split(/[\s-_]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');

    const cleanName = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .replace(/^(.)/, match => match.toUpperCase());

    return { pascalCase, cleanName };
  };

  const { pascalCase, cleanName } = normalizeVendorName(vendor);

  return (
    vendorIconMap[vendor] ||
    vendorIconMap[pascalCase] ||
    vendorIconMap[cleanName] ||
    vendorIconMap[vendor.toLowerCase()] ||
    vendorIconMap[vendor.toUpperCase()] ||
    vendorIconMap[vendor.replace(/\s+/g, '')] ||
    null
  );
};

export default VendorIcon;

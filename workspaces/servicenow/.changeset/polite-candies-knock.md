---
'@backstage-community/plugin-servicenow': minor
'@backstage-community/plugin-servicenow-backend': minor
'@backstage-community/plugin-servicenow-common': patch
---

**feat(servicenow): Add CMDB business application and infrastructure details integration**

This release introduces comprehensive CMDB (Configuration Management Database) integration to the ServiceNow plugin, enabling users to view business application details and infrastructure information directly within Backstage.

### ✨ New Features

- **🏢 Business Application Details**: New ServiceDetailsCard component that displays CMDB business application information with service owner, business criticality, and operational status
- **🖥️ Infrastructure Details Page**: Dedicated view for infrastructure details with comprehensive ServiceNow CMDB data including hardware specifications, network information, and system configurations
- **🔄 Enhanced API Integration**: New CMDB API endpoints for fetching business application and infrastructure data from ServiceNow
- **📱 Modern UI Components**: Responsive card-based interface with skeleton loading states and Material-UI integration
- **🔗 Deep Linking**: Direct links to ServiceNow forms for seamless workflow integration

### 🛠️ Technical Improvements

**Frontend (@backstage-community/plugin-servicenow)**:

- New `ServiceDetailsCard` component with modular architecture
- `InfraDetailsPage` component for detailed infrastructure views
- Custom React hooks: `useServiceDetails`, `useInfraDetails`, `useServiceUser`
- Utility functions for URL generation and entity processing
- Comprehensive test coverage with mock data and fixtures

**Backend (@backstage-community/plugin-servicenow-backend)**:

- New CMDB API routes: `/cmdb/business-applications` and `/cmdb/infrastructure`
- Enhanced ServiceNow REST client with CMDB endpoint support
- Updated configuration schema for CMDB integration
- OAuth configuration improvements for CMDB access

**Common (@backstage-community/plugin-servicenow-common)**:

- New TypeScript interfaces for CMDB data structures
- Shared utilities for CMDB entity processing

### 📸 Visual Updates

- Added screenshots showcasing CMDB integration in README
- Service details card displaying configuration information
- Infrastructure details view with comprehensive system data

### 🔧 Configuration

Enhanced app configuration supports new CMDB endpoints while maintaining backward compatibility with existing ServiceNow incident functionality. Users can optionally enable CMDB features by configuring appropriate ServiceNow permissions.

### 📋 Migration Notes

This is a purely additive feature with no breaking changes. Existing ServiceNow plugin functionality remains unchanged. The new CMDB features are automatically available when proper ServiceNow CMDB permissions are configured.

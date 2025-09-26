# Translation Guide for Topology Plugin

This guide explains how to use and extend the translation system in the Topology plugin.

## Overview

The Topology plugin supports internationalization (i18n) with translations for:

- **German (de)** - Deutsch
- **French (fr)** - Français
- **Italian (it)** - Italiano
- **Spanish (es)** - Español
- **English (en)** - Default/fallback language

## File Structure

```
src/
├── translations/
│   ├── ref.ts          # English messages (nested objects)
│   ├── de.ts           # German (flat keys)
│   ├── fr.ts           # French (flat keys)
│   ├── it.ts           # Italian (flat keys)
│   ├── es.ts           # Spanish (flat keys)
│   └── index.ts        # Translation resource
├── hooks/
│   ├── useTranslation.ts
│   └── useLanguage.ts
├── components/
│   └── Trans.tsx
└── test-utils/
    └── mockTranslations.ts
```

## Usage Examples

### Simple Translation

```typescript
import { useTranslation } from '../hooks/useTranslation';

const MyComponent = () => {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('page.title')}</h1>
      <p>{t('emptyState.noResourcesFound')}</p>
    </div>
  );
};
```

### Translation with Interpolation

```typescript
const { t } = useTranslation();

// Simple interpolation
const message = t('permissions.missingPermissionDescription', {
  permissions: 'read',
  permissionText: 'permission',
});

// Complex interpolation
const count = 5;
const itemText = t('table.pagination.topN', { count: count.toString() });
```

### Using Trans Component for JSX

```typescript
import { Trans } from '../components/Trans';

const MyComponent = () => {
  return (
    <div>
      <Trans
        message="permissions.missingPermissionDescription"
        params={{
          permissions: permissionNames,
          permissionText: 'permissions',
        }}
      />
    </div>
  );
};
```

### Language Detection

```typescript
import { useLanguage } from '../hooks/useLanguage';

const MyComponent = () => {
  const language = useLanguage(); // Returns 'en', 'de', 'fr', etc.

  // Use for locale-specific formatting
  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat(language, {
      month: 'short',
      day: 'numeric',
    }).format(date);
};
```

## Testing

### Test Setup Pattern

```typescript
// CRITICAL: Import mocks BEFORE components
import {
  MockTrans,
  mockUseTranslation,
} from '../../test-utils/mockTranslations';

jest.mock('../../hooks/useTranslation', () => ({
  useTranslation: mockUseTranslation,
}));

jest.mock('../Trans', () => ({ Trans: MockTrans }));

// Component imports AFTER mocks
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders translated content', () => {
    render(<MyComponent />);
    expect(screen.getByText('No resources found')).toBeInTheDocument();
  });
});
```

## Adding New Languages

### 1. Create Language File

Create `src/translations/pt.ts` for Portuguese:

```typescript
import { createTranslationMessages } from '@backstage/core-plugin-api/alpha';
import { topologyTranslationRef } from './ref';

const topologyTranslationPt = createTranslationMessages({
  ref: topologyTranslationRef,
  messages: {
    'page.title': 'Topologia',
    'page.subtitle':
      'Visualização da topologia de cargas de trabalho do Kubernetes',
    'toolbar.cluster': 'Cluster',
    'toolbar.selectCluster': 'Selecionar cluster',
    // ... add all translations
  },
});

export default topologyTranslationPt;
```

### 2. Update Translation Resource

Add to `src/translations/index.ts`:

```typescript
export const topologyTranslations = createTranslationResource({
  ref: topologyTranslationRef,
  translations: {
    de: () => import('./de'),
    fr: () => import('./fr'),
    it: () => import('./it'),
    es: () => import('./es'),
    pt: () => import('./pt'), // Add new language
  },
});
```

### 3. Update Dev App

Add to `dev/index.tsx`:

```typescript
.setAvailableLanguages(['en', 'de', 'fr', 'it', 'es', 'pt'])
```

## Translation Keys Structure

### Naming Convention

- Use camelCase for key names
- Group by semantic hierarchy: `${page}.${section}.${element}`
- Common patterns:
  - `${page}.title` - Page titles
  - `${page}.subtitle` - Page subtitles
  - `${section}.${element}` - UI elements

### Key Categories

```typescript
{
  page: {
    title: 'Page titles',
    subtitle: 'Page descriptions'
  },
  toolbar: {
    cluster: 'Toolbar elements',
    selectCluster: 'Action labels'
  },
  emptyState: {
    noResourcesFound: 'Empty state messages'
  },
  permissions: {
    missingPermission: 'Permission-related messages'
  },
  sideBar: {
    details: 'Sidebar navigation'
  },
  workload: {
    deployment: 'Kubernetes resource types'
  },
  status: {
    running: 'Resource status values'
  },
  details: {
    name: 'Detail field labels'
  },
  logs: {
    download: 'Log-related actions'
  },
  events: {
    type: 'Event table headers'
  },
  filters: {
    showLabels: 'Filter options'
  },
  common: {
    loading: 'Common UI elements',
    error: 'Common states',
    save: 'Common actions'
  }
}
```

## Language-Specific Guidelines

### German (de)

- ✅ Use compound words: `Anzeige-Optionen` not `Anzeige Optionen`
- ✅ Proper capitalization: `Benutzer-Dashboard`
- ✅ Formal address: Use "Sie" form

### French (fr)

- ✅ Proper apostrophes: `Aujourd'hui`
- ✅ Space separation: `Top recherches` not `Top-Recherches`
- ✅ Gender agreement: `Les utilisateurs actifs`

### Italian (it)

- ✅ Article agreement: `Gli utenti attivi`
- ✅ Adjective agreement: `utenti attivi`, `nuovi utenti`
- ✅ Formal address: Use "Lei" form

### Spanish (es)

- ✅ Gender agreement: `Usuarios activos` (masculine)
- ✅ Accent marks: `último`, `período`, `búsquedas`
- ✅ Formal address: Use "usted" form

## Quality Checklist

- [ ] **No untranslated strings** - All keys fully translated
- [ ] **Consistent terminology** - Same terms across related keys
- [ ] **Interpolation preservation** - All `{{parameter}}` patterns match
- [ ] **Cultural adaptation** - Concepts adapted, not literal translations
- [ ] **Localized filenames** - CSV exports use translated names
- [ ] **Proper formatting** - Numbers, dates, currencies localized
- [ ] **Context awareness** - Technical terms vs. user-facing terms
- [ ] **Length considerations** - UI layout accommodates longer translations

## App Integration

### Dev App Setup

```typescript
// dev/index.tsx
import { topologyTranslations } from '../src/translations';

createDevApp()
  .registerPlugin(topologyPlugin)
  .addTranslationResource(topologyTranslations)
  .setAvailableLanguages(['en', 'de', 'fr', 'it', 'es'])
  .setDefaultLanguage('en');
```

### Production App Setup

```typescript
// packages/app/src/App.tsx
import { topologyTranslations } from '@backstage-community/plugin-topology';

const app = createApp({
  apis,
  __experimentalTranslations: {
    availableLanguages: ['en', 'de', 'fr', 'it', 'es'],
    resources: [topologyTranslations],
  },
});
```

## Troubleshooting

### Common Issues

1. **Missing translations show as keys**

   - Check that the key exists in `ref.ts`
   - Verify the key is properly translated in language files

2. **Interpolation not working**

   - Ensure parameter names match exactly: `{{paramName}}`
   - Pass parameters as strings: `{ count: '5' }`

3. **Tests failing**

   - Import mocks before components
   - Use `MockTrans` for `Trans` component tests

4. **TypeScript errors**
   - Reference file uses nested objects
   - Translation files use flat dot notation
   - Don't mix the two patterns

### Debug Tips

```typescript
// Check current language
const language = useLanguage();
console.log('Current language:', language);

// Check translation key
const { t } = useTranslation();
console.log('Translation:', t('page.title'));

// Test interpolation
console.log('With params:', t('key', { param: 'value' }));
```

## Performance Considerations

- **Lazy loading**: Translation files are loaded on demand
- **Caching**: Translations are cached after first load
- **Bundle size**: Only active language is loaded
- **Fallback**: English messages used when translation missing

## Contributing

When adding new translatable strings:

1. Add to `ref.ts` with English text
2. Add to all language files with proper translations
3. Update tests with mock translations
4. Test in dev app with different languages
5. Verify UI layout works with longer translations

For translation improvements:

1. Follow language-specific guidelines
2. Consider cultural context
3. Test with native speakers when possible
4. Maintain consistency across the plugin

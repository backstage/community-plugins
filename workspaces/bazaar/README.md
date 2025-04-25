## Bazaar Isolated Development

To start the Bazaar plugin's isolated development environment, follow these steps:

### 1. Install Dependencies

At the root of the workspace, run:

```bash
yarn install
```

### 2. Run Both Frontend and Backend Together

```bash
yarn start
```

### 3. Run Frontend and Backend Separately

- **Frontend**:
  ```bash
  cd plugins/bazaar
  yarn start
  ```
- **Backend**:
  ```bash
  cd plugins/bazaar-backend
  yarn start
  ```

### Customizing Entities

Entities such as components and users are defined in `local_dev.yaml`. You can modify this file to add new components or change existing ones.

### Pre-loaded Bazaar Components

The following components come pre-loaded for easy development:

- **Home Page**
- **Bazaar Overview Widget**

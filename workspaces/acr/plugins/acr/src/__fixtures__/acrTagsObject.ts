export const mockAcrTagsData = {
  registry: 'testbsregistry.azurecr.io',
  imageName: 'samples/nodetest1',
  tags: [
    {
      name: '1.0.0',
      digest:
        'sha256:d859263f0d93318dca6444a4c372d699839f4fbe8945e1c0c51ef47fd5e4d72f',
      createdTime: '2023-06-30T05:03:17.8253401Z',
      lastUpdateTime: '2023-06-30T05:03:17.8253401Z',
      signed: false,
      changeableAttributes: {
        deleteEnabled: true,
        writeEnabled: true,
        readEnabled: true,
        listEnabled: true,
      },
    },
    {
      name: 'latest',
      digest:
        'sha256:ad859263f0d93318dca6444a4c372d699839f4fbe8945e1c0c51ef47fd5e4d72f',
      createdTime: '2023-06-27T16:00:34.7412037Z',
      lastUpdateTime: '2023-06-27T16:00:34.7412037Z',
      signed: false,
      changeableAttributes: {
        deleteEnabled: true,
        writeEnabled: true,
        readEnabled: true,
        listEnabled: true,
      },
    },
  ],
};

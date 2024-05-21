export interface Config {
  linkerd: {
    /** If the Linkerd Backend is deployed in the same cluster as the control plane, it will not use the k8s plugin proxy */
    deployedWithControlPlane?: boolean;
  };
}

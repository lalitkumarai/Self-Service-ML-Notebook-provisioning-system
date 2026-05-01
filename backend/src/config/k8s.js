const k8s = require('@kubernetes/client-node');

// SECURITY ARCHITECTURE: SECURE BROKER PATTERN
// -------------------------------------------
// 1. User Identity Isolation:
//    - Users authenticate with the Backend via JWT (see authMiddleware.js).
//    - Users NEVER have direct access to the Kubernetes API.
//    - No user-specific Kubeconfig or ServiceAccount is ever issued to the client.
//
// 2. Trusted Broker (Backend):
//    - This application acts as a "Trusted Broker".
//    - It authenticates the user, validates permissions (RBAC), and enforces quotas.
//    - Only AFTER validation does it make calls to the K8s API.
//
// 3. Least Privilege Principle:
//    - The Backend uses its own ServiceAccount (ml-backend-sa) to talk to K8s.
//    - This ServiceAccount has limited RBAC permissions (defined in k8s/backend-rbac.yaml).
//    - It can only manage resources in the target namespace (e.g., 'default') and read node status.

const kc = new k8s.KubeConfig();

let k8sApi, k8sAppsApi, k8sNetworkingApi;

if (process.env.MOCK_K8S === 'true') {
  console.log('Using MOCK Kubernetes API');
  
  const mockResource = (name, namespace) => ({
      body: {
          metadata: { name, namespace },
          spec: { ports: [{ nodePort: 30000 + Math.floor(Math.random() * 2000) }] }
      }
  });

  k8sApi = {
      readNamespacedPersistentVolumeClaim: async (name, ns) => { throw { response: { statusCode: 404 } }; },
      createNamespacedPersistentVolumeClaim: async (ns, body) => ({ body }),
      deleteNamespacedPersistentVolumeClaim: async (name, ns) => ({}),
      readNamespacedService: async (name, ns) => { throw { response: { statusCode: 404 } }; },
      createNamespacedService: async (ns, body) => mockResource(body.metadata.name, ns),
      deleteNamespacedService: async (name, ns) => ({}),
      // For system-status admin endpoint
      listNode: async () => ({ body: { items: [{ status: { nodeInfo: { kubeletVersion: 'v1.28.0-mock' } } }] } }),
  };

  k8sAppsApi = {
      readNamespacedDeployment:   async (name, ns) => { throw { response: { statusCode: 404 } }; },
      createNamespacedDeployment: async (ns, body) => ({ body }),
      deleteNamespacedDeployment: async (name, ns) => ({}),
      // Required by stopNotebook — scale deployment to 0 replicas
      patchNamespacedDeployment:  async (name, ns, patch, ...rest) => ({ body: { metadata: { name, namespace: ns } } }),
  };

  k8sNetworkingApi = {
      readNamespacedIngress:  async (name, ns) => { throw { response: { statusCode: 404 } }; },
      createNamespacedIngress: async (ns, body) => ({ body }),
      deleteNamespacedIngress: async (name, ns) => ({}),
  };


} else {
  // Load from default (works for both in-cluster ServiceAccount and local kubeconfig)
  // When running in K8s, this automatically uses the mounted ServiceAccount token.
  try {
    kc.loadFromDefault();
    k8sApi = kc.makeApiClient(k8s.CoreV1Api);
    k8sAppsApi = kc.makeApiClient(k8s.AppsV1Api);
    k8sNetworkingApi = kc.makeApiClient(k8s.NetworkingV1Api);
  } catch (err) {
      console.warn('Failed to load kubeconfig. K8s calls will fail unless MOCK_K8S=true is set.');
      // Create dummies to prevent crash on import, but calls will fail
      k8sApi = {};
      k8sAppsApi = {};
      k8sNetworkingApi = {};
  }
}

module.exports = { k8sApi, k8sAppsApi, k8sNetworkingApi };

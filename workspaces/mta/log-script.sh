# Define the namespace
namespace="local-backstage"

# Define the label selector to find the right pod
label_selector="app=backstage-developer-hub"

# Wait for the pod to be ready
echo "Waiting for pod to be ready..."
while true; do
    # Check if the pod is ready by looking at the READY column
    pod_info=$(oc get pods -n $namespace -l $label_selector --no-headers | awk '{print $1, $2}')
    pod_name=$(echo "$pod_info" | awk '{print $1}')
    pod_ready_status=$(echo "$pod_info" | awk '{print $2}')

    # Check if any pod is reporting Ready (e.g., 1/1)
    if [[ "$pod_ready_status" == "1/1" ]]; then
        echo "Found ready pod: $pod_name"
        break
    else
        echo "No ready pods found yet. Waiting..."
        sleep 5
    fi
done

# Define the container name if you are interested in a specific container
container_name="install-dynamic-plugins"

# Tail the logs from the container in the found pod
if [ ! -z "$pod_name" ] && [ ! -z "$container_name" ]; then
    echo "Tailing logs for container $container_name in pod $pod_name"
    oc logs -n $namespace -f $pod_name -c $container_name
else
    echo "Pod or container name not found. Check your label selector and namespace."
fi

Waiting for pod to be ready...
No resources found in local-backstage namespace.
No ready pods found yet. Waiting...
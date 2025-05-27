# [Backstage](https://backstage.io)

This is your newly scaffolded Backstage App, Good Luck!

### Steps to Setup a Testing Instance of JFrog :

1.  **You can Sign up for JFrog free trial**  
    Go to [https://jfrog.com/start-free/](https://jfrog.com/start-free/) and sign up for a free trial.
2.  **Create Your First Repository**  
    Follow the instructions in the official JFrog documentation to create your first repository.
3.  **Log in via Terminal**  
    Run the following command (replace with your JFrog credentials if needed):

    ```
    docker login -u <email> trialjgwb0x.jfrog.io
    ```

4.  **Enter Access Token as Password**  
    Use the access token generated from your JFrog account as the password (as mentioned in the guideline).
5.  **Pull an Image from JFrog**  
    Run the following command:

    ```
    docker pull trialjgwb0x.jfrog.io/xyz-docker/hello-world:latest
    ```

6.  **Tag the Image**  
    Use this command to tag the image:

    ```
    docker tag trialjgwb0x.jfrog.io/xyz-docker/hello-world \
    trialjgwb0x.jfrog.io/xyz-docker/hello-world:1.0.0
    ```

7.  **Push the Tagged Image**  
    Push the image to your JFrog repository:

    ```
    docker push trialjgwb0x.jfrog.io/xyz-docker/hello-world:1.0.0
    ```

### Steps to run App ( [See Detailed Steps ](plugins/jfrog-artifactory/README.md) )

1.  **Add Annotation in `catalog-info.yaml`**

    ````
    metadata:
      annotations:
        jfrog-artifactory/image-name: <repo-name> # e.g., hello-world```

    ````

2.  **Configure Proxy in `app-config.yaml`**

    ```
    proxy:
      endpoints:
        '/jfrog-artifactory/api':
          target: <jfrog-instance-url> # e.g., https://trialjgwb0x.jfrog.io/
          headers:
            Authorization: Bearer <access_token_generated_on_jfrog_instance>
          # Change to "false" in case of using self hosted artifactory instance with a self-signed certificate
          secure: true

    ```

3.  **Install Dependencies**
    ```
    yarn
    ```
4.  **Start Development Server**
    ```
    yarn start
    ```

## To generate knip reports for this app, run:

```sh
yarn backstage-repo-tools knip-reports
```

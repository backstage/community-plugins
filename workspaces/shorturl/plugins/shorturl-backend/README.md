# shorturl-backend

Welcome to the shorturl-backend backend plugin!

_This plugin was created through the Backstage CLI_

## Getting started

Your plugin has been added to the example app in this repository, meaning you'll be able to access it by running `yarn
start` in the root directory, and then navigating to [/shorturl-backend/health](http://localhost:7007/api/shorturl-backend/health).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](./dev) directory.

## Configuration

This plugin has optional configuration options that can be set in the `app-config.yaml` file.

```yaml
shorturl:
  lenght: 6 # default: 8
  alphabet: 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ # default: A-Za-z0-9_-
```

## Testing

For testing purposes, we have enabled we have set `backend.auth.dangerouslyDisableDefaultAuthPolicy=true` in app-config.yaml.

### Health

```
$ curl http://localhost:7007/api/shorturl-backend/health
{"status":"ok"}
```

### Create a short URL

```
$ curl -X PUT -H "Content-Type: application/json" -d '{
  "fullUrl": "http://backstage.corporate.com/my/very/long/url/path/",
  "usageCount": 0
}' "http://localhost:7007/api/shorturl-backend/create"
{"status":"ok","id":"mfSL557M4idDPAJv1yToq"}
```

### Retrieve a long URL

```
$ curl http://localhost:7007/api/shorturl-backend/go/1ORTgIzdpskQ-0QVM-WBM
Found. Redirecting to backstage.corporate.com/my/very/long/url/path/
```

For failure

```
$ curl http://localhost:7007/api/shorturl-backend/go/AAAA
{"error":{"name":"NotFoundError","message":"Unable to find the record","stack":"NotFoundError: [...]/service/router.ts:67:25)"},"request":{"method":"GET","url":"/go/AAAA"},"response":{"statusCode":404}}
```

### Read all existing short URLs

```json
$ curl http://localhost:7007/api/shorturl-backend/getAll | jq
{
  "status": "ok",
  "data": [
    {
      "short_id": "mfSL557M4idDPAJv1yToq",
      "full_url": "https://amazon.com",
      "usage_count": 3
    },
    {
      "short_id": "1ORTgIzdpskQ-0QVM-WBM",
      "full_url": "https://backstage.corporate.com/my/very/long/url/path/",
      "usage_count": 4
    }
  ]
}
```

# Deploy on Dokku

## Before Deploy

``` bash
# "development" or "production"
MEMBO_BUILD_ENV
DOKKU_HOST
STRIPE_PRIVATE_API_KEY
STRIPE_WEBHOOK_SECRET
AUTH0_DOMAIN
AUTH0_CUSTOM_DOMAIN
AUTH0_CLIENT_ID
AUTH0_CLIENT_SECRET
CENTRIFUGO_API_KEY
CENTRIFUGO_SECRET
EMAIL
```

### 1. do settings on browser

### 2. create swap

``` bash
dd if=/dev/zero of=/swap bs=1M count=1024
mkswap /swap
chmod 0600 /swap
swapon /swap
```

### 3. create directory for minio

``` bash
sudo mkdir -p /var/lib/dokku/data/storage/minio
sudo chown 32769:32769 /var/lib/dokku/data/storage/minio
```

### 4. create directory for centrifugo

``` bash
sudo mkdir -p /var/lib/dokku/data/storage/cent
```

### 5. create config.json for centrifugo in the directory above

### 6. dokku configs

``` bash
sudo dokku plugin:install https://github.com/dokku/dokku-letsencrypt.git
sudo dokku plugin:install https://github.com/dokku/dokku-mongo.git

dokku apps:create api
dokku apps:create app
dokku apps:create landing
dokku apps:create minio
dokku apps:create cent
dokku mongo:create mongo

dokku domains:set landing ${DOKKU_HOST} # deploy landing page on root domain

dokku storage:mount minio /var/lib/dokku/data/storage/minio:/home/dokku/data
sudo dokku storage:mount cent /var/lib/dokku/data/storage/cent:/centrifugo

echo 'client_max_body_size 50m;' > /home/dokku/api/nginx.conf.d/upload.conf
echo 'client_max_body_size 50m;' > /home/dokku/minio/nginx.conf.d/upload.conf
chown dokku:dokku /home/dokku/api/nginx.conf.d/upload.conf
chown dokku:dokku /home/dokku/minio/nginx.conf.d/upload.conf

MINIO_ACCESS_KEY=$(echo `openssl rand -base64 45` | tr -d \=+ | cut -c 1-20)
MINIO_SECRET_KEY=$(echo `openssl rand -base64 45` | tr -d \=+ | cut -c 1-32)

echo "MINIO_ACCESS_KEY: ${MINIO_ACCESS_KEY}"
echo "MINIO_SECRET_KEY: ${MINIO_SECRET_KEY}"

dokku config:set api FLASK_APP="src/app"
dokku config:set api STRIPE_PRIVATE_API_KEY=${STRIPE_PRIVATE_API_KEY}
dokku config:set api STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}
dokku config:set api AUTH0_DOMAIN=${AUTH0_DOMAIN}
dokku config:set api AUTH0_CUSTOM_DOMAIN=${AUTH0_CUSTOM_DOMAIN}
dokku config:set api AUTH0_CLIENT_ID=${AUTH0_CLIENT_ID}
dokku config:set api AUTH0_CLIENT_SECRET=${AUTH0_CLIENT_SECRET}
dokku config:set api AUTH0_API_AUDIENCE=${AUTH0_API_AUDIENCE}
dokku config:set api CENTRIFUGO_URL="https://cent.${DOKKU_HOST}"
dokku config:set api CENTRIFUGO_API_KEY=${CENTRIFUGO_API_KEY}
dokku config:set api CENTRIFUGO_SECRET=${CENTRIFUGO_SECRET}
dokku config:set api AWS_S3_ENDPOINT_URL="https://minio.${DOKKU_HOST}"
dokku config:set api AWS_S3_PUBLIC_URL="https://minio.${DOKKU_HOST}"
dokku config:set api AWS_ACCESS_KEY_ID=$MINIO_ACCESS_KEY
dokku config:set api AWS_SECRET_ACCESS_KEY=$MINIO_SECRET_KEY
dokku config:set api FRONTEND_URL="https://${DOKKU_HOST}"
dokku config:set minio MINIO_ACCESS_KEY=$MINIO_ACCESS_KEY
dokku config:set minio MINIO_SECRET_KEY=$MINIO_SECRET_KEY

dokku config:set app MEMBO_BUILD_ENV="${MEMBO_BUILD_ENV}"

dokku config:set api DOKKU_LETSENCRYPT_EMAIL=${EMAIL}
dokku config:set app DOKKU_LETSENCRYPT_EMAIL=${EMAIL}
dokku config:set landing DOKKU_LETSENCRYPT_EMAIL=${EMAIL}
dokku config:set minio DOKKU_LETSENCRYPT_EMAIL=${EMAIL}
dokku config:set cent DOKKU_LETSENCRYPT_EMAIL=${EMAIL}

dokku mongo:link mongo api
dokku buildpacks:add api https://github.com/heroku/heroku-buildpack-python.git
dokku buildpacks:add app https://github.com/mars/create-react-app-buildpack.git
```

## Deploy

### [ON DOKKU_HOST] deploy centrifugo from image on dockerhub

``` bash
docker pull centrifugo/centrifugo
docker tag centrifugo/centrifugo dokku/cent
dokku tags:deploy cent
```

### [ON LOCAL, IN EACH REPOS]

``` bash
git remote add dokku dokku@${DOKKU_HOST}:api
git remote add dokku dokku@${DOKKU_HOST}:app
git remote add dokku dokku@${DOKKU_HOST}:landing
git remote add dokku dokku@${DOKKU_HOST}:minio
# for each...
git push dokku master
```

## After Deploy

### 1. create "articles" bucket and make it public to read

### 2. enable HTTPS

``` bash
dokku letsencrypt api
dokku letsencrypt app
dokku letsencrypt landing
dokku letsencrypt minio
dokku letsencrypt cent
```

### 3. set automatic renewal job of certs

``` bash
dokku letsencrypt:cron-job --add
```

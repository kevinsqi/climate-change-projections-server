# Climate Change Projections - Server

## Setup

### Geocoding API

Go here and create an API key: https://developers.google.com/maps/documentation/geocoding/start#get-a-key

Create a .env file that contains the following:

```
GOOGLE_MAPS_PLATFORM_KEY=<your api key>
```

### Database

```
brew install postgresql
brew install postgis
```

Create user and DB:

```
createuser climate_change_projections_user --createdb
createdb climate_change_projections -U climate_change_projections_user
```

Creating extension in psql (requires superuser):

```
psql climate_change_projections
CREATE EXTENSION postgis;
```

DB setup:

```
node_modules/.bin/knex --knexfile ./db/knexfile.js migrate:latest
node_modules/.bin/knex --knexfile ./db/knexfile.js seed:run
```

## Running the app

```
yarn install
yarn start
```


## Database actions

Console:

```
psql climate_change_projections -U climate_change_projections_user
```

New migration:

```
node_modules/.bin/knex --knexfile ./db/knexfile.js migrate:make [MIGRATION_NAME]
```

Rollback migration:Down migrate:

```
node_modules/.bin/knex --knexfile ./db/knexfile.js migrate:rollback
```

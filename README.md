# Climate Change Projections - Server

## Database setup

```
brew install postgresql
brew install postgis
```

Create user and DB:

```
createuser climate_change_projections_user --createdb
createdb climate_change_projections -U climate_change_projections_user
```

Connecting:

```
psql climate_change_projections -U climate_change_projections_user
```

Creating extension in psql (requires superuser):

```
psql climate_change_projections
CREATE EXTENSION postgis;
```

New migration:

```
node_modules/.bin/knex --knexfile ./db/knexfile.js migrate:make [MIGRATION_NAME]
```

DB setup:

```
node_modules/.bin/knex --knexfile ./db/knexfile.js migrate:latest
```


## Datasets

```
brew install gdal  # For ogr2ogr
```

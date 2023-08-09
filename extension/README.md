# PLATEAU VIEW 3.0 extension for Re:Earth

## Development

```sh
yarn && yarn dev
```

Then, set the `localhost` to env file in `reearth` repository.

1. Move to `reearth` repository.
2. Open `/server/.env`, and set `REEARTH_EXT_PLUGIN=http://localhost:5001`.
3. Open `/web/.env`, and set `REEARTH_WEB_UNSAFE_PLUGIN_URLS='["http://localhost:5001/PLATEAUVIEW3.js"]'`
4. Run server and web.

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

## Architecture

- toolbar ... Main logic for toolbar widget
- search ... Main logic for search widget
- inspector ... Main logic for inspector widget
- streetView ... Main logic for street view widget
- prototypes ... Modules which are ported from [takram-design-engineering/plateau-view](https://github.com/takram-design-engineering/plateau-view).
- shared ... Shared logic between widgets
    - sharedAtoms ... Wrapped Jotai's atoms for abstracting side-effects
    - states ... Global state definitions

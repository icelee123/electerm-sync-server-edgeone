# Electerm Sync Server (EdgeOne KV)

[English](README.md) | [中文](README_CN.md)

## Environment Variables

please set them via  EdgeOne Project Settings for production environment

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | Yes | Secret key for JWT signing |
| `JWT_USERS` | Yes | Comma-separated list of allowed users |
| `KV_BIND_VAR` | Yes | EdgeOne KV binding variable name |

## Install
`npm install`
## Build
`npm run build`

## Sync Servers in Other Languages

[Custom sync server documentation](https://github.com/electerm/electerm/wiki/Custom-sync-server)

## License

MIT

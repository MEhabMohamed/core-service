## installed packages

npm i express dotenv zod
npm i knex pg
npm i uuid
npm i -D typescript tsx @types/node @types/express eslint prettier
npx tsc --init
npm i helmet cors
npm i -D @types/cors
npm i bcrypt jsonwebtoken
npm i -D @types/bcrypt @types/jsonwebtoken
npm i nodemailer @types/nodemailer
npm i tsyringe -D @types/tsyringe
npm i ioredis -D @types/ioredis
npm i cookie-parser class-transformer class-validator reflect-metadata @types/cookie-parser

## knex script
"knex": "tsx node_modules/knex/bin/cli.js --knexfile src/lib/knex/knexfile.ts"
npm run knex -- migrate:make migration_name
npm run knex -- migrate:latest
npm run knex -- migrate:rollback
npm run knex -- seed:make seed_name
npm run knex -- seed:run
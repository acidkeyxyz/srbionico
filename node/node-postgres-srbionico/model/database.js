const pg = require('pg');
const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/srbionico';

const client = new pg.Client(connectionString);
client.connect();
const query = client.query(
  'CREATE TABLE products (    productId SERIAL PRIMARY KEY,    productName TEXT NOT NULL,    productSize TEXT NOT NULL,    productPrice NUMERIC NOT NULL CHECK(productPrice > 0),	productOwner TEXT NOT NULL);');
query.on('end', () => { client.end(); });

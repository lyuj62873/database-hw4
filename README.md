# Sakila ETL Project

---

## Setup Instructions

1. **Install dependencies**

```bash
npm init -y
npm i typeorm reflect-metadata mysql2 better-sqlite3 yargs
npm i -D typescript ts-node @types/node jest ts-jest @types/jest
npm install dotenv
```
---

2. **Rewrite `.env` file** in the project root:

## Environment Variables

| Variable       | Description                             |
| -------------- | --------------------------------------- |
| MYSQL_HOST     | MySQL host (default: localhost)         |
| MYSQL_PORT     | MySQL port (default: 3306)              |
| MYSQL_USER     | MySQL username                          |
| MYSQL_PASSWORD | MySQL password                          |
| SQLITE_DB      | SQLite database file path for analytics |

---

3. **CLI Commands**:

## CLI Commands(assume you are at root file)

| Command                    | Description                                                                                               |
| -------------------------- | --------------------------------------------------------------------------------------------------------- |
| `npx ts-node .\src\commands\cli.ts init`        | Performs the initialization of databases.                                            |
| `npx ts-node .\src\commands\cli.ts full-load`        | Performs a full ETL of all tables from MySQL to SQLite.                         |
| `npx ts-node .\src\commands\cli.ts incremental ` | Performs incremental ETL based on last sync timestamps.                             |
| `npx ts-node .\src\commands\cli.ts validate`         | Creates indexes on SQLite analytics tables and validates FactRental and FactPayment tables against MySQL. |



---

## Database Schema Overview

### Dimension Tables

* `dim_date`
* `dim_actor`
* `dim_film`
* `dim_category`
* `dim_store`
* `dim_customer`

### Bridge Tables

* `bridge_film_actor` — links films and actors
* `bridge_film_category` — links films and categories

### Fact Tables

* `fact_rental` — rental transactions
* `fact_payment` — payments

**Relationships:**

```
dim_actor <---- bridge_film_actor ----> dim_film
dim_category <---- bridge_film_category ----> dim_film
dim_store
dim_customer
dim_date
fact_rental
fact_payment
```

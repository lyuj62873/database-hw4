import {DataSource, MoreThan} from "typeorm";
import {SQLiteTarget} from "../../data-sources/SQLiteTarget";
import {FactRental} from "../../entities/target/FactRental";
import {FactPayment} from "../../entities/target/FactPayment";
import {MySQLSource} from "../../data-sources/MySQLSource";
import {Rental} from "../../entities/source/Rental";
import {Payment} from "../../entities/source/Payment";

async function safeDestroy() {
    try {
        if (MySQLSource.isInitialized) await MySQLSource.destroy();
    } catch (err) {
        console.warn("MySQL destroy failed:", err);
    }
    try {
        if (SQLiteTarget.isInitialized) await SQLiteTarget.destroy();
    } catch (err) {
        console.warn("SQLite destroy failed:", err);
    }
}

async function createIndexes(dataSource: DataSource) {
    const queries = [
        // Dim tables
        `CREATE INDEX IF NOT EXISTS idx_dim_date_date_key ON dim_date(date_key);`,
        `CREATE INDEX IF NOT EXISTS idx_dim_film_film_key ON dim_film(film_key);`,
        `CREATE INDEX IF NOT EXISTS idx_dim_actor_actor_key ON dim_actor(actor_key);`,
        `CREATE INDEX IF NOT EXISTS idx_dim_category_category_key ON dim_category(category_key);`,
        `CREATE INDEX IF NOT EXISTS idx_dim_store_store_key ON dim_store(store_key);`,
        `CREATE INDEX IF NOT EXISTS idx_dim_customer_customer_key ON dim_customer(customer_key);`,

        // Bridge tables
        `CREATE INDEX IF NOT EXISTS idx_bridge_film_actor_film ON bridge_film_actor(film_key);`,
        `CREATE INDEX IF NOT EXISTS idx_bridge_film_actor_actor ON bridge_film_actor(actor_key);`,
        `CREATE INDEX IF NOT EXISTS idx_bridge_film_category_film ON bridge_film_category(film_key);`,
        `CREATE INDEX IF NOT EXISTS idx_bridge_film_category_category ON bridge_film_category(category_key);`,

        // Fact tables
        `CREATE INDEX IF NOT EXISTS idx_fact_rental_date ON fact_rental(date_key_rented);`,
        `CREATE INDEX IF NOT EXISTS idx_fact_rental_customer ON fact_rental(customer_key);`,
        `CREATE INDEX IF NOT EXISTS idx_fact_rental_film ON fact_rental(film_key);`,
        `CREATE INDEX IF NOT EXISTS idx_fact_payment_date ON fact_payment(date_key_paid);`,
        `CREATE INDEX IF NOT EXISTS idx_fact_payment_customer ON fact_payment(customer_key);`,
        `CREATE INDEX IF NOT EXISTS idx_fact_payment_store ON fact_payment(store_key);`,
    ];

    for (const q of queries) {
        await dataSource.query(q);
    }
    console.log("All indexes created.");
}


function formatDateKey(date: Date) {
    return parseInt(`${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`);
}

async function validateFactRental() {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const targetRows = await SQLiteTarget.getRepository(FactRental)
        .find({where: {date_key_rented: MoreThan(formatDateKey(last30Days))}});
    const sourceRows = await MySQLSource.getRepository(Rental)
        .find({
            where: {rental_date: MoreThan(last30Days)},
            relations: ["inventory", "inventory.film", "customer", "staff"]
        });

    const targetMap = new Map<number, FactRental>();
    targetRows.forEach(r => targetMap.set(r.rental_id, r));

    const discrepancies: string[] = [];

    for (const src of sourceRows) {
        const tgt = targetMap.get(src.rental_id);
        if (!tgt) {
            discrepancies.push(`Missing in target: rental_id=${src.rental_id}`);
            continue;
        }

        const expected = {
            date_key_rented: formatDateKey(src.rental_date),
            date_key_returned: src.return_date ? formatDateKey(src.return_date) : null,
            film_key: src.inventory.film.film_id + 10000,
            store_key: src.inventory.store_id + 1,
            customer_key: src.customer.customer_id + 34000,
            staff_id: src.staff.staff_id,
            rental_duration_days: src.return_date ? Math.ceil((src.return_date.getTime() - src.rental_date.getTime()) / (1000 * 3600 * 24)) : 0
        };

        for (const key of Object.keys(expected)) {
            if (tgt[key] !== expected[key]) {
                discrepancies.push(`Mismatch rental_id=${src.rental_id}, field=${key}, target=${tgt[key]}, source=${expected[key]}`);
            }
        }
    }

    const success = discrepancies.length === 0;
    return {success, details: success ? "All FactRental rows match" : discrepancies.join("\n")};
}

async function validateFactPayment() {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const targetRows = await SQLiteTarget.getRepository(FactPayment)
        .find({where: {date_key_paid: MoreThan(formatDateKey(last30Days))}});
    const sourceRows = await MySQLSource.getRepository(Payment)
        .find({where: {payment_date: MoreThan(last30Days)}, relations: ["customer", "staff"]});

    const targetMap = new Map<number, FactPayment>();
    targetRows.forEach(p => targetMap.set(p.payment_id, p));

    const discrepancies: string[] = [];

    for (const src of sourceRows) {
        const tgt = targetMap.get(src.payment_id);
        if (!tgt) {
            discrepancies.push(`Missing in target: payment_id=${src.payment_id}`);
            continue;
        }

        const expected = {
            date_key_paid: formatDateKey(src.payment_date),
            customer_key: src.customer.customer_id + 34000,
            store_key: src.staff.store_id + 1,
            staff_id: src.staff.staff_id,
            amount: src.amount
        };

        for (const key of Object.keys(expected)) {
            if (tgt[key] !== expected[key]) {
                discrepancies.push(`Mismatch payment_id=${src.payment_id}, field=${key}, target=${tgt[key]}, source=${expected[key]}`);
            }
        }
    }

    const success = discrepancies.length === 0;
    return {success, details: success ? "All FactPayment rows match" : discrepancies.join("\n")};
}


export async function optimizeAndValidate(): Promise<{ success: boolean; message: string }> {
    await SQLiteTarget.initialize();
    await MySQLSource.initialize();

    try {
        await createIndexes(SQLiteTarget);
        const rentalValidation = await validateFactRental();
        const paymentValidation = await validateFactPayment();

        const success = rentalValidation.success && paymentValidation.success;
        const message = [rentalValidation.details, paymentValidation.details].join("\n");

        console.log("Validation completed:");
        console.log(message);

        return {success, message};
    } catch (err) {
        console.error("Error during performance optimization or validation:", err);
        return {
            success: false,
            message: (err as Error).message
        };
    } finally {
        await safeDestroy();
    }
}
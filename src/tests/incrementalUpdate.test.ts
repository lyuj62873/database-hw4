import {MySQLSource} from "../data-sources/MySQLSource";
import {SQLiteTarget} from "../data-sources/SQLiteTarget";
import {Customer} from "../entities/source/Customer";
import {runIncrementalETL} from "../commands/etl/incrementalETL";

describe("Incremental Command (Updates)", () => {

    it("should update changed records in SQLite when source data changes", async () => {

        if (!MySQLSource.isInitialized) await MySQLSource.initialize();
        if (!SQLiteTarget.isInitialized) await SQLiteTarget.initialize();

        const customerRepo = MySQLSource.getRepository(Customer);
        const customer = await customerRepo.findOneBy({customer_id: 1});
        if (!customer) throw new Error("Customer 1 not found");

        const oldName = customer.first_name;

        customer.first_name = "UPDATED_NAME";
        await customerRepo.save(customer);

        if (MySQLSource.isInitialized) await MySQLSource.destroy();
        if (SQLiteTarget.isInitialized) await SQLiteTarget.destroy();

        await runIncrementalETL();

        if (!MySQLSource.isInitialized) await MySQLSource.initialize();
        if (!SQLiteTarget.isInitialized) await SQLiteTarget.initialize();

        const sqliteKey = customer.customer_id + 34000;

        const updated = await SQLiteTarget.manager.query(
            `SELECT first_name
             FROM dim_customer
             WHERE customer_key = ?`,
            [sqliteKey]
        );

        expect(updated[0].first_name).toBe("UPDATED_NAME");

        customer.first_name = oldName;
        await customerRepo.save(customer);

        if (MySQLSource.isInitialized) await MySQLSource.destroy();
        if (SQLiteTarget.isInitialized) await SQLiteTarget.destroy();

    }, 30000);
});

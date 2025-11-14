import { MySQLSource } from "../../../data-sources/MySQLSource";
import { Customer } from "../../../entities/source/Customer";
import { DimCustomer } from "../../../entities/target/DimCustomer";
import { EntityManager } from "typeorm";

export async function loadDimCustomer(manager?: EntityManager) {
    const customerRepo = MySQLSource.getRepository(Customer);

    const dimCustomerRepo = manager
        ? manager.getRepository(DimCustomer)
        : (await import("../../../data-sources/SQLiteTarget")).SQLiteTarget.getRepository(DimCustomer);

    const customers = await customerRepo.find({
        relations: ["address", "address.city", "address.city.country"]
    });

    const offset = 10000;

    const dimCustomers = customers.map(customer =>
        dimCustomerRepo.create({
            customer_key: customer.customer_id + offset,
            customer_id: customer.customer_id,
            first_name: customer.first_name,
            last_name: customer.last_name,
            active: customer.active,
            city: customer.address.city.city,
            country: customer.address.city.country.country,
            last_update: customer.last_update ? customer.last_update.toISOString() : new Date().toISOString()
        })
    );

    await dimCustomerRepo.save(dimCustomers);

    console.log(`Loaded ${dimCustomers.length} customers into dim_customer.`);
}

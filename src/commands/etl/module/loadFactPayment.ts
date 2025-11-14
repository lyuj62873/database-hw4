import { MySQLSource } from "../../../data-sources/MySQLSource";
import { SQLiteTarget } from "../../../data-sources/SQLiteTarget";
import { Payment } from "../../../entities/source/Payment";
import { FactPayment } from "../../../entities/target/FactPayment";
import { EntityManager } from "typeorm";

function getDateKey(date: Date): number {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return parseInt(`${year}${month}${day}`);
}

export async function loadFactPayment(manager?: EntityManager) {
    const paymentRepo = MySQLSource.getRepository(Payment);
    const factPaymentRepo = manager
        ? manager.getRepository(FactPayment)
        : SQLiteTarget.getRepository(FactPayment);

    const payments = await paymentRepo.find({
        relations: ["customer", "staff", "rental", "rental.inventory", "rental.inventory.store"]
    });

    const factPayments = payments.map(payment => {
        const dateKeyPaid = getDateKey(payment.payment_date);

        return factPaymentRepo.create({
            payment_id: payment.payment_id,
            date_key_paid: dateKeyPaid,
            customer_key: payment.customer.customer_id + 34000,
            store_key: payment.rental ? payment.rental.inventory.store.store_id + 1000 : 0,
            staff_id: payment.staff.staff_id,
            amount: payment.amount
        });
    });

    await factPaymentRepo.save(factPayments);
    console.log(`Loaded ${factPayments.length} rows into fact_payment.`);
}

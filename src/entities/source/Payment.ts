import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn} from "typeorm";
import {Customer} from "./Customer";
import {Staff} from "./Staff";
import {Rental} from "./Rental";

@Entity({name: "payment"})
export class Payment {
    @PrimaryGeneratedColumn({type: "smallint", unsigned: true})
    payment_id!: number;

    @Column({type: "smallint", unsigned: true})
    customer_id!: number;

    @Column({type: "tinyint", unsigned: true})
    staff_id!: number;

    @Column({type: "int", nullable: true})
    rental_id!: number | null;

    @Column({type: "decimal", precision: 5, scale: 2})
    amount!: string;

    @Column({type: "datetime"})
    payment_date!: Date;

    @Column({type: "timestamp", nullable: true, default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP"})
    last_update?: Date;


    @ManyToOne(() => Customer, (customer) => customer.payments)
    @JoinColumn({name: "customer_id"})
    customer!: Customer;

    @ManyToOne(() => Staff, (staff) => staff.payments)
    @JoinColumn({name: "staff_id"})
    staff!: Staff;

    @ManyToOne(() => Rental, (rental) => rental.payments, {nullable: true})
    @JoinColumn({name: "rental_id"})
    rental!: Rental | null;
}

import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique, OneToMany} from "typeorm";
import {Inventory} from "./Inventory";
import {Customer} from "./Customer";
import {Staff} from "./Staff";
import {Payment} from "./Payment";

@Entity({name: "rental"})
@Unique(["rental_date", "inventory_id", "customer_id"])
export class Rental {
    @PrimaryGeneratedColumn({type: "int"})
    rental_id!: number;

    @Column({type: "datetime"})
    rental_date!: Date;

    @Column({type: "mediumint", unsigned: true})
    inventory_id!: number;

    @Column({type: "smallint", unsigned: true})
    customer_id!: number;

    @Column({type: "datetime", nullable: true})
    return_date?: Date;

    @Column({type: "tinyint", unsigned: true})
    staff_id!: number;

    @Column({type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP"})
    last_update!: Date;


    @ManyToOne(() => Inventory, (inventory) => inventory.rentals)
    @JoinColumn({name: "inventory_id"})
    inventory!: Inventory;

    @ManyToOne(() => Customer, (customer) => customer.rentals)
    @JoinColumn({name: "customer_id"})
    customer!: Customer;

    @ManyToOne(() => Staff, (staff) => staff.rentals)
    @JoinColumn({name: "staff_id"})
    staff!: Staff;

    @OneToMany(() => Payment, (payment) => payment.rental)
    payments!: Payment[];

}

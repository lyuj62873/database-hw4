import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany} from "typeorm";
import {Store} from "./Store";
import {Address} from "./Address";
import {Rental} from "./Rental";
import {Payment} from "./Payment";

@Entity({name: "customer"})
export class Customer {
    @PrimaryGeneratedColumn({type: "smallint", unsigned: true})
    customer_id!: number;

    @Column({type: "tinyint", unsigned: true})
    store_id!: number;

    @Column({type: "varchar", length: 45})
    first_name!: string;

    @Column({type: "varchar", length: 45})
    last_name!: string;

    @Column({type: "varchar", length: 50, nullable: true})
    email?: string;

    @Column({type: "smallint", unsigned: true})
    address_id!: number;

    @Column({type: "tinyint", width: 1, default: 1})
    active!: number;

    @Column({type: "datetime"})
    create_date!: Date;

    @Column({type: "timestamp", nullable: true, default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP"})
    last_update?: Date;

    @Column({type: "decimal", precision: 10, scale: 2, default: 0})
    mtd_spent!: string;

    @ManyToOne(() => Store, (store) => store.customers)
    @JoinColumn({name: "store_id"})
    store!: Store;

    @ManyToOne(() => Address, (address) => address.customers)
    @JoinColumn({name: "address_id"})
    address!: Address;

    @OneToMany(() => Rental, (rental) => rental.customer)
    rentals!: Rental[];

    @OneToMany(() => Payment, (payment) => payment.customer)
    payments!: Payment[];

}

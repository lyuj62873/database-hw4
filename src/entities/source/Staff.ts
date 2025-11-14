import {Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {Address} from "./Address";
import {Store} from "./Store";
import {Rental} from "./Rental";
import {Payment} from "./Payment";

@Entity({name: "staff"})
export class Staff {
    @PrimaryGeneratedColumn({type: "tinyint", unsigned: true})
    staff_id!: number;

    @Column({type: "varchar", length: 45})
    first_name!: string;

    @Column({type: "varchar", length: 45})
    last_name!: string;

    @Column({type: "smallint", unsigned: true})
    address_id!: number;

    @Column({type: "blob", nullable: true})
    picture?: Buffer;

    @Column({type: "varchar", length: 50, nullable: true})
    email?: string;

    @Column({type: "tinyint", unsigned: true})
    store_id!: number;

    @Column({type: "tinyint", width: 1, default: 1})
    active!: number;

    @Column({type: "varchar", length: 16})
    username!: string;

    @Column({type: "varchar", length: 40, charset: "utf8mb4", collation: "utf8mb4_bin", nullable: true})
    password?: string;

    @Column({type: "timestamp", default: "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP"})
    last_update!: Date;


    @ManyToOne(() => Address)
    @JoinColumn({name: "address_id"})
    address!: Address;

    @ManyToOne(() => Store, (store) => store.staff_list)
    @JoinColumn({name: "store_id"})
    store!: Store;

    @OneToOne(() => Store, (store) => store.manager)
    managed_store?: Store;

    @OneToMany(() => Rental, (rental) => rental.staff)
    rentals!: Rental[];

    @OneToMany(() => Payment, (payment) => payment.staff)
    payments!: Payment[];


}

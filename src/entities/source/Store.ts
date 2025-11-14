import {Column, Entity, JoinColumn, ManyToOne, OneToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {Address} from "./Address";
import {Staff} from "./Staff";
import {Inventory} from "./Inventory";
import {Customer} from "./Customer";

@Entity({name: "store"})
export class Store {
    @PrimaryGeneratedColumn({type: "tinyint", unsigned: true})
    store_id!: number;

    @Column({type: "tinyint", unsigned: true})
    manager_staff_id!: number;

    @Column({type: "smallint", unsigned: true})
    address_id!: number;

    @Column({type: "timestamp", default: "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP"})
    last_update!: Date;


    @OneToOne(() => Staff, (staff) => staff.managed_store)
    @JoinColumn({name: "manager_staff_id"})
    manager!: Staff;

    @ManyToOne(() => Address)
    @JoinColumn({name: "address_id"})
    address!: Address;

    @OneToMany(() => Staff, (staff) => staff.store)
    staff_list!: Staff[];

    @OneToMany(() => Inventory, (inventory) => inventory.store)
    inventories!: Inventory[];

    @OneToMany(() => Customer, (customer) => customer.store)
    customers!: Customer[];

}

import {Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {City} from "./City";
import {Staff} from "./Staff";
import {Store} from "./Store";
import {Customer} from "./Customer";


@Entity({name: "address"})
export class Address {
    @PrimaryGeneratedColumn({type: "smallint", unsigned: true})
    address_id!: number;
    @Column({type: "varchar", length: 50})
    address!: string;
    @Column({type: "varchar", length: 50, nullable: true})
    address2?: string;
    @Column({type: "varchar", length: 20})
    district!: string;
    @Column({type: "smallint", unsigned: true})
    city_id!: number;
    @Column({type: "varchar", length: 10, nullable: true})
    postal_code?: string;
    @Column({type: "varchar", length: 20})
    phone!: string;
    @Column({type: "text"})
    location!: string;
    @Column({type: "timestamp", default: "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP"})
    last_update!: Date;

    @ManyToOne(() => City, (city) => city.addresses)
    @JoinColumn({name: "city_id"})
    city!: City;

    @OneToMany(() => Staff, (staff) => staff.address)
    staff_list!: Staff[];

    @OneToMany(() => Store, (store) => store.address)
    stores!: Store[];

    @OneToMany(() => Customer, (customer) => customer.address)
    customers!: Customer[];

}
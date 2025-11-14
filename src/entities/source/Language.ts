import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity({name: "language"})
export class Language {
    @PrimaryGeneratedColumn({type: "tinyint", unsigned: true})
    language_id!: number;

    @Column({type: "char", length: 20})
    name!: string;

    @Column({type: "timestamp", default: "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP"})
    last_update!: Date;
}
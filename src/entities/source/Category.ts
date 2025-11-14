import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from "typeorm";
import {FilmCategory} from "./FilmCategory";

@Entity({name: "category"})
export class Category {
    @PrimaryGeneratedColumn({type: "tinyint", unsigned: true})
    category_id!: number;
    @Column({type: "varchar", length: 25})
    name!: string;
    @Column({type: "timestamp", default: "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP"})
    last_update!: Date;

    @OneToMany(() => FilmCategory, (fc) => fc.category)
    filmCategories!: FilmCategory[];
}
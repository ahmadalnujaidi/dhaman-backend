import { Warranty } from "src/warranties/entities/warranty.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true})
    email: string;

    @Column()
    password: string;

    @Column({ default: 0 })
    item_count: number;

    @Column({ default: false })
    premium: boolean;

    @OneToMany(() => Warranty, (warranty) => warranty.user)
    warranties: Warranty[];

}

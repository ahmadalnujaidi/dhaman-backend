import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
@Entity('warranties')
export class Warranty {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    item_name: string;

    @Column()
    purchase_date: Date;

    @Column()
    duration: number;

    @Column({ nullable: true })
    notes: string;

    @Column( {nullable: true,default: null })
    item_image: string;

    @Column( {nullable: true, default: null})
    receipt: string;

    @ManyToOne(() => User, (user) => user.warranties)
    @JoinColumn({name: 'user_id'})
    user: User;

    @Column()
    user_id: string;

}

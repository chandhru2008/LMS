import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
} from "typeorm";
import { LeaveRequest } from "../leave-requests/leave-request-entity";
import { LeaveBalance } from "../leave-balances/leave-balance-entity";

@Entity()
export class Employee {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    name!: string;

    @Column({ unique: true })
    email!: string;

    @Column()
    password!: string;

    @Column({
        type: 'enum',
        enum: ['male', 'female']
    })
    gender!: 'male' | 'female'

    @Column({
        type: "enum",
        enum: [ "employee", "manager", "hr", "hr_manager", "director"],
        default: "employee",
    })
    role!: "employee" | "manager" | "hr" | "hr_manager" | "director";

    @Column({ type: 'enum', enum: ['single', 'married'], nullable: true })
    maritalStatus?: 'single' | 'married';

    @ManyToOne(() => Employee, { nullable: true })
    @JoinColumn({ name: "intern_id" })
    intern?: Employee;
    
    // For employee role
    @ManyToOne(() => Employee, { nullable: true })
    @JoinColumn({ name: "manager_id" })
    manager?: Employee;

    // For manager role
    @ManyToOne(() => Employee, { nullable: true })
    @JoinColumn({ name: "hr_id" })
    hr?: Employee;

    // For HR role
    @ManyToOne(() => Employee, { nullable: true })
    @JoinColumn({ name: "hr_manager_id" })
    hrManager?: Employee;

    // For HR Manager role
    @ManyToOne(() => Employee, { nullable: true })
    @JoinColumn({ name: "director_id" })
    director?: Employee;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    @OneToMany(() => LeaveRequest, (leaveRequest) => leaveRequest.employee)
    leaveRequests!: LeaveRequest[];

    @OneToMany(() => LeaveBalance, (leaveBalance) => leaveBalance.employee)
    leaveBalances!: LeaveBalance[];
}

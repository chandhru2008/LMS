import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { LeaveRequest } from "../leave-requests/leave-request-model";
import { LeaveBalance } from "../leave-balances/leave-balance-model";

@Entity()
export class Employee {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @Column({unique:true})
    email: string;

    @Column()
    password: string;


    @Column({ type: 'enum', enum: ['Employee', 'Manager', 'HR', 'Director'], default: 'Employee' })
    role: 'Employee' | 'Manager' | 'HR' | 'Director';


    @ManyToOne(() => Employee)
    @JoinColumn({ name: "manager_id" })
    manager?: Employee;


    @ManyToOne(() => Employee)
    @JoinColumn({ name: "Hr_id" })
    HR?: Employee;

    @ManyToOne(() => Employee)
    @JoinColumn({ name: "director_id" })
    director?: Employee;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @OneToMany(()=>LeaveRequest, leaveRequest=> leaveRequest.employee)
    leaveRequests : LeaveRequest[];

    @OneToMany(()=> LeaveBalance , leaveBalance => leaveBalance.employee)
    leaveBalances : LeaveBalance[];


}
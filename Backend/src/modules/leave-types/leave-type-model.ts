import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { LeaveRequest } from "../leave-requests/leave-request-model";
import { LeaveBalance } from "../leave-balances/leave-balance-model";

@Entity()
export class LeaveType{
    @PrimaryGeneratedColumn()
    id! : number;

    @Column()
    name! : string;

    @OneToMany(() => LeaveRequest, leaveRequest => leaveRequest.leaveType)
    leaveRequests!: LeaveRequest[];

    @OneToMany(()=> LeaveBalance, leaveBalance => leaveBalance.leaveType)
    leaveBalances! : LeaveBalance[];

    @Column()
    max_allowed_days! : number;
}
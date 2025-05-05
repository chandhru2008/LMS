import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { LeaveRequest } from "./Leave-request";
import { LeaveBalance } from "./LeaveBalance";

@Entity()
export class LeaveType{
    @PrimaryGeneratedColumn()
    id : number;

    @Column()
    name : String;

    @OneToMany(() => LeaveRequest, leaveRequest => leaveRequest.leaveType)
    leaveRequests: LeaveRequest[];

    @OneToMany(()=> LeaveBalance, leaveBalance => leaveBalance.leaveType)
    leaveBalances : LeaveBalance[];

    @Column()
    max_allowed_days : number;
}
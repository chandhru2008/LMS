import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { LeaveRequest } from "../leave-requests/leave-request-model";
import { LeaveBalance } from "../leave-balances/leave-balance-model";
import { DefaultLeaveEntitlement } from "../default-leave-entitlement/default-leave-entitlement-entity";

@Entity()
export class LeaveType {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @OneToMany(() => LeaveRequest, leaveRequest => leaveRequest.leaveType)
    leaveRequests!: LeaveRequest[];

    @OneToMany(() => LeaveBalance, leaveBalance => leaveBalance.leaveType)
    leaveBalances!: LeaveBalance[];

    @OneToMany(() => DefaultLeaveEntitlement, (entitlement) => entitlement.leaveType)
    defaultEntitlements: DefaultLeaveEntitlement[] | undefined;
}
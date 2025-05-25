import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  OneToMany,
} from "typeorm";
import { LeaveType } from "../leave-types/leave-type-model";
import { Employee } from "../empolyee/employee-entity";
import { LeaveApproval } from "../leave-approval/leave-approval-model";

export type ApprovalStatus = "Pending" | "Approved" | "Rejected" | "Cancelled";

@Entity()
export class LeaveRequest {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => LeaveType, leaveType => leaveType.leaveRequests)
  @JoinColumn({ name: "leave_type_id" })
  leaveType!: LeaveType;

  @ManyToOne(() => Employee, employee => employee.leaveRequests)
  @JoinColumn({ name: "employee_id" })
  employee!: Employee;

  @Column()
  description!: string;

  @Column({
    type: "enum",
    enum: ["Pending", "Approved", "Rejected", "Cancelled"],
    default: "Pending",
  })
  status!: ApprovalStatus;

  
  @Column({ type: "date" })
  start_date!: string;

  @Column({ type: "date" })
  end_date!: string;

  @CreateDateColumn()
  created_at!: Date;

  @OneToMany(() => LeaveApproval, approval => approval.leaveRequest, {
    cascade: true,
  })
  approvals!: LeaveApproval[];
}

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Employee } from "../empolyee/employee-entity";
import { LeaveType } from "../leave-types/leave-type-model";

@Entity()
export class LeaveBalance {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Employee, employee => employee.leaveBalances)
  @JoinColumn({ name: "employee_id" })
  employee!: Employee;

  @ManyToOne(() => LeaveType, leaveType => leaveType.leaveBalances)
  @JoinColumn({ name: "leave_type_id" })
  leaveType!: LeaveType;

  @Column({ type: "int", default: 0 })
  used_leaves!: number;

  @Column({ type: "int", default: 0 })
  remaining_leaves!: number;

  @Column({type : 'int', default : 0})
  total! : number
  leaveBalance: import("c:/Users/ChandhruSoundarajan/Documents/My-projects/LMS/Backend/src/types").RegisterEmployeePayload;
}

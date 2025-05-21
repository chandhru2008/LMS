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
import { LeaveRequest } from "../leave-requests/leave-request-model";
import { LeaveBalance } from "../leave-balances/leave-balance-model";

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
    type: "enum",
    enum: ["employee", "manager", "HR", "hr_manager", "director"],
    default: "employee",
  })
  role!: "employee" | "manager" | "HR" | "hr_manager" | "director";

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

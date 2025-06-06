import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { LeaveRequest } from '../leave-requests/leave-request-entity';
import { Employee } from '../empolyee/employee-entity';

@Entity('leave_approvals')
export class LeaveApproval {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => LeaveRequest, (leaveRequest) => leaveRequest.approvals)
  @JoinColumn({ name: 'leave_request_id' }) // optional but good to specify
  leaveRequest!: LeaveRequest;

  @Column()
  level!: number;

  @Column()
  approverRole!: string;

  @ManyToOne(() => Employee, (employee) => employee.approvalsGiven, { nullable: true })
  @JoinColumn({ name: 'employee_id' }) // foreign key column
  approver!: Employee;

  @Column({ default: 'Pending' })
  status!: 'Pending' | 'Approved' | 'Rejected';

  @Column({ type: 'text', nullable: true })
  remarks!: string;

  @CreateDateColumn({ nullable: true })
  approvedAt!: Date;
}

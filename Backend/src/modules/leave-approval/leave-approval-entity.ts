import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  OneToMany
} from 'typeorm';
import { LeaveRequest } from '../leave-requests/leave-request-entity';
import { Employee } from '../empolyee/employee-entity';

@Entity('leave_approvals')
export class LeaveApproval {
  @PrimaryGeneratedColumn()
  id!: string;

  @ManyToOne(() => LeaveRequest, (leaveRequest: { approvals: any; }) => leaveRequest.approvals)
  leaveRequest!: LeaveRequest;

  @Column()
  level!: number;

  @Column()
  approverRole!: string;


  @ManyToOne(() => Employee, { nullable: true })
  approver!: Employee;

  @Column({ default: 'Pending' })
  status!: 'Pending' | 'Approved' | 'Rejected' ;

  @Column({ type: 'text', nullable: true })
  remarks!: string;

  @CreateDateColumn({ nullable: true })
  approvedAt!: Date;

  @OneToMany(() => LeaveApproval, approval => approval.approver)
  approvalsToReview!: LeaveApproval[];
}

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { LeaveType } from '../leave-types/leave-type-model';

@Entity('default_leave_entitlements')
export class DefaultLeaveEntitlement {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  role!: string; 

  @ManyToOne(() => LeaveType, (leaveType) => leaveType.defaultEntitlements)
  @JoinColumn({ name: 'leave_type_id' })
  leaveType!: LeaveType;

  @Column('int')
  defaultDays!: number;

}

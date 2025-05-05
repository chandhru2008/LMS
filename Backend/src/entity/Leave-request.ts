import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { LeaveType } from "./LeaveType";
import { Employee } from "./Employee";

@Entity()
export class LeaveRequest{
    @PrimaryGeneratedColumn("uuid")
    id : string;

    @ManyToOne(()=>LeaveType, leaveType => leaveType.leaveRequests)
    @JoinColumn({name : "leave_type_id"})
    leaveType : LeaveType;

    @ManyToOne(()=>Employee, employee => employee.leaveRequests)
    @JoinColumn({name : "employee_id"})
    employee : Employee

    @Column()
    description : String

    @Column({ type: 'enum', enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'], default: 'Pending' })
    status :  'Pending' | 'Approved'| 'Rejected' | 'Cancelled'

    @Column({type : 'enum', enum : ['Pending', 'Approved', 'Rejected'], default: 'Pending' })
    manager_approval : 'Pending' | 'Approved'| 'Rejected' 

    @Column({type : 'enum', enum : ['Pending', 'Approved', 'Rejected'], default: 'Pending' })
    HR_approval : 'Pending' | 'Approved'| 'Rejected' 

    @Column({type : 'enum', enum : ['Pending', 'Approved', 'Rejected'], default: 'Pending' })
    director_approval : 'Pending' | 'Approved'| 'Rejected' 

    @Column({type : 'date'})
    start_date : string;

    @Column({type : 'date'})
    end_date : string

}
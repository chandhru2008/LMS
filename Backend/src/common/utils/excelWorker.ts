import ExcelJS from 'exceljs';
import { Employee } from '../../types';
import { redisClient } from '../../worker/worker';

function normalizeCellValue(cell: any): string {
  if (cell == null) return '';
  if (typeof cell === 'object' && 'text' in cell) return cell.text.trim();
  return String(cell).trim();
}

export async function parseExcel(buffer: Buffer): Promise<Employee[]> {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const worksheet = workbook.worksheets[0];
    const employees: Employee[] = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      const values = row.values as Array<any>;
      
      const employee: Partial<Employee> = {
        name: normalizeCellValue(values[1]),
        email: normalizeCellValue(values[2]).toLowerCase(),
        password: normalizeCellValue(values[3]),
        role: normalizeCellValue(values[4]) as Employee['role'],
        managerEmail: normalizeCellValue(values[5])?.toLowerCase(),
        hrManagerEmail: normalizeCellValue(values[6])?.toLowerCase(),
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Validate required fields
      if (!employee.name || !employee.email || !employee.password || !employee.role) {
        console.warn(`⚠️ Skipping row ${rowNumber} - Missing required fields`);
        return;
      }

      employees.push(employee as Employee);
    });

    console.log(`✅ Successfully parsed ${employees.length} employees`);
    return employees;
  } catch (error) {
    console.error('❌ Excel parsing failed:', error);
    throw error;
  }
}

export async function pushEmployeesToQueue(employees: Employee[]): Promise<void> {
  if (!employees.length) {
    console.log('ℹ️ No employees to process');
    return;
  }

  try {
    if (!redisClient.isOpen) {
      console.log('ℹ️ Redis not connected, attempting to connect...');
      await redisClient.connect();
    }

    console.log(`📤 Pushing ${employees.length} employees to queue`);
    
    // Using pipeline for batch operations
    const pipeline = redisClient.multi();
    employees.forEach(emp => {
      pipeline.rPush('employee_queue', JSON.stringify(emp));
    });

    const results = await pipeline.exec();
    
    // Verify all commands succeeded
    const failedCommands = results.filter(result => result[0]);
    if (failedCommands.length > 0) {
      console.error('❌ Some Redis commands failed:', failedCommands);
      throw new Error('Partial failure in Redis operations');
    }

    console.log(`✅ Successfully pushed ${employees.length} employees to queue`);
  } catch (error) {
    console.error('❌ Failed to push employees to queue:', error);
    throw error;
  }
}
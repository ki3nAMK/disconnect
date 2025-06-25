// excel.service.ts
import * as ExcelJS from 'exceljs';
import { Readable } from 'stream';

export class ExcelService {
	async readExcel(file: Readable): Promise<any[]> {
		const workbook = new ExcelJS.Workbook();
		await workbook.xlsx.read(file);

		const worksheet = workbook.worksheets[0];
		const data = [];

		worksheet.eachRow({ includeEmpty: false }, (row) => {
			const rowData = [];
			row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
				rowData[colNumber - 1] = cell.value;
			});
			data.push(rowData);
		});

		return data;
	}

	convertDataFromFileExcelToArrayObject(dataFromFileExcel, headers) {
		// Convert array of arrays to array of objects
		return dataFromFileExcel.map((row) => {
			const obj = {};
			headers.forEach((header, index) => {
				obj[header] = this.extractPlainText(row[index]);
			});
			return obj;
		});
	}

	// New method to extract plain text from richText
	extractPlainText(value): string {
		if (value?.richText) {
			return value.richText.map((item) => item.text).join('');
		}

		return value;
	}
}

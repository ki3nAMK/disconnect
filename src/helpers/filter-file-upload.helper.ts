import { extname, basename } from 'path';
import * as truncate from 'truncate-utf8-bytes';
import { BadRequestException } from '@nestjs/common';
import * as fs from 'fs';

export const FilterFileUpload = (req, file, callback) => {
	if (!file.originalname.match(/\.(jpg|jpeg|png|xlsx)$/)) {
		return callback(new Error('Only image files are allowed!'), false);
	}

	callback(null, true);
};

export const FilterFileExcelUpload = (req, file, callback) => {
	if (!file.originalname.match(/\.(xlsx)$/)) {
		return callback(
			new BadRequestException('ACCOUNT_MESSAGES.IMPORT_FILE_FORMAT_INVALID'),
			false,
		);
	}

	callback(null, true);
};

export const trimfilenametobytes = (filename, maxbytes = 255) => {
	const ext = extname(filename);
	const base = basename(filename, ext);

	// Calculate the length of the file extension in bytes
	const extLength = Buffer.from(ext).length;

	// Calculate the maximum length for the base filename
	const maxBaseLength = Math.max(0, maxbytes - extLength);

	// Truncate the base filename
	const truncatedBase = truncate(base, maxBaseLength);

	// Concatenate the truncated base filename with the file extension
	const truncatedFilename = truncatedBase + ext;

	// Ensure the final filename length is within the specified limit
	return truncate(truncatedFilename, maxbytes);
};

export const _checkFileExists = (filePath: string) => {
	if (!fs.existsSync(filePath)) {
		throw new BadRequestException('files.the file does not exist');
	}
	return true;
};

export const _checkImageCanDelete = (filePath: string): boolean => {
	if (fs.existsSync(filePath)) {
		if (
			filePath.startsWith('assets\\defaults') ||
			filePath.startsWith('assets/defaults')
		) {
			return false; // because this is a default image.
		}
		return true;
	}
	return false;
};

export const deleteFile = (filePath: string): void => {
	try {
		if (!_checkImageCanDelete(filePath)) {
			return;
		}
		fs.unlinkSync(filePath);
	} catch (error) {
		throw new Error('Failed to delete file');
	}
};

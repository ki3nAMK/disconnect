import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NextFunction, Request, Response } from 'express';
import * as moment from 'moment';

const api_documentation_credentials = {
	name: process.env.API_DOCS_USERNAME,
	pass: process.env.API_DOCS_PASSWORD,
};

export function configSwagger(app: INestApplication) {
	const config = new DocumentBuilder()
		.setTitle('GeTON project')
		.setDescription(`## GeTON API - Last build: ${moment()}`)
		.setVersion('1.0')
		.addSecurity('token', { type: 'http', scheme: 'bearer' })
		.build();
	const document = SwaggerModule.createDocument(app, config);

	const http_adapter = app.getHttpAdapter();

	const allowedCompanyIPs = process.env.API_DOCS_ALLOWED_COMPANY_IPS
		? process.env.API_DOCS_ALLOWED_COMPANY_IPS.split(',')
		: [];

	// Add localhost IPs to the allowed list
	allowedCompanyIPs.push('127.0.0.1', '::1');

	http_adapter.use(
		'/api-docs',
		(req: Request, res: Response, next: NextFunction) => {
			function parseAuthHeader(input: string): { name: string; pass: string } {
				const [, encodedPart] = input.split(' ');

				const buff = Buffer.from(encodedPart, 'base64');
				const text = buff.toString('ascii');
				const [name, pass] = text.split(':');

				return { name, pass };
			}

			function unauthorizedResponse(): void {
				if (http_adapter.getType() === 'fastify') {
					res.statusCode = 401;
					res.setHeader('WWW-Authenticate', 'Basic');
				} else {
					res.status(401);
					res.set('WWW-Authenticate', 'Basic');
				}

				next();
			}

			const clientIp = getClientIp(req);

			// Check if the request IP is in the allowed company IPs
			if (allowedCompanyIPs.includes(clientIp)) {
				return next(); // Skip credentials check for company IPs
			}

			if (!req.headers.authorization) {
				return unauthorizedResponse();
			}

			const credentials = parseAuthHeader(req.headers.authorization);

			if (
				credentials?.name !== api_documentation_credentials.name ||
				credentials?.pass !== api_documentation_credentials.pass
			) {
				return unauthorizedResponse();
			}

			next();
		},
	);
	SwaggerModule.setup('api-docs', app, document, {
		swaggerOptions: { persistAuthorization: true, docExpansion: 'none' },
		customJs: '/swagger-custom.js',
		customSiteTitle: 'GeTON Documentation',
		customfavIcon: '/swagger.svg',
	});
}

function getClientIp(req: Request): string {
	// Check the X-Forwarded-For header for the real client IP
	const forwarded = req.headers['x-forwarded-for'];
	if (typeof forwarded === 'string') {
		return forwarded.split(',')[0].trim(); // Get the first IP in the list
	}
	// Fallback to req.ip
	return req.ip.startsWith('::ffff:') ? req.ip.substring(7) : req.ip;
}

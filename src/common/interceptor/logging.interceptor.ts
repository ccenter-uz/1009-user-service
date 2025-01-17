import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
// import { PrismaService } from './prisma.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(/*private readonly prisma: PrismaService*/) {}

  /*async saveLog(data: any) {
    // Save the log to the database
    await this.prisma.apiLogs.create({
      data: {
        userId: data.userId || null,
        orgId: data.orgId || null,
        method: data.method,
        url: data.url,
        request: JSON.stringify(data.request),
        response: JSON.stringify(data.response),
        headers: JSON.stringify(data.headers),
        status: data.status,
        duration: data.duration,
        timestamp: data.timestamp,
      },
    });
  }*/

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    // const { method, url, body, headers, user } = req;

    console.log(req, 'REQ');

    // const logData = {
    //   userId: user?.id, // Assuming user ID is attached to the request
    //   orgId: body?.orgId, // Assuming orgId is part of the request body
    //   method,
    //   url,
    //   request: body,
    //   headers,
    //   timestamp: new Date(),
    // };

    // const startTime = Date.now();

    // return next.handle().pipe(
    //   map((response) => {
    //     const duration = Date.now() - startTime;
    //     logData.response = response;
    //     logData.status = context.switchToHttp().getResponse().statusCode;
    //     logData.duration = duration;

    //     // Save the log asynchronously
    //     this.saveLog(logData).catch((error) => {
    //       console.error('Error saving log:', error);
    //     });

    //     return response; // Ensure the original response is returned to the client
    //   })
    // );

    return next.handle().pipe();
  }
}

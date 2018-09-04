import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';

import { Observable } from 'rxjs';


@Injectable({   providedIn: 'root' })
export class HeaderInterceptor implements HttpInterceptor {

    intercept(req: HttpRequest<any>, next: HttpHandler):
        Observable<HttpEvent<any>> {

        if (!req.url.includes("upload")) {
            req = req.clone({ headers: req.headers.set('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8') });
        }
        req = req.clone({ withCredentials: true});
        return next.handle(req);
    }
}
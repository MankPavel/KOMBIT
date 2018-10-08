import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { catchError } from 'rxjs/operators';
import { Config } from '../config/config';

@Injectable()
export class ApiServiceProvider {
  private url: string;

  constructor(private http: HttpClient) {
    this.url = Config.API_URL;
  }

  getUrl() {
    return window['IonicDevServer'] ? 'api' : this.url;
  }

  get(endpoint: string, httpOptions?: any) {
    const options = this.createRequestHeader(httpOptions ? httpOptions : {});
    return this.http.get(this.getUrl() + endpoint, options).pipe(catchError(this.handleError));
  }

  download(endpoint: string, httpOptions?: any) {
    const options = this.createRequestHeader(httpOptions ? httpOptions : {});
    return this.http.get(endpoint, options).pipe(catchError(this.handleError));
  }

  post(endpoint: string, body: any, httpOptions?: any) {
    const options = this.createRequestHeader(httpOptions ? httpOptions : {});
    return this.http.post(this.getUrl() + endpoint, body, options).pipe(catchError(this.handleError));
  }

  private createRequestHeader(options?: any): any {
    const headers = options.hasOwnProperty('headers') ? options.headers : {};
    headers['Content-Type'] = 'application/json';
    headers['Access-Control-Allow-Origin'] = '*';
    options.headers = headers;
    return options;
  }

  private handleError(error: HttpErrorResponse) {
    if (error.hasOwnProperty('error')) {
      if (error.error instanceof ErrorEvent) console.error('An error occurred:', error.error.message);
      else if (error.error && error.error.hasOwnProperty('Message')) return new ErrorObservable(error.error.Message);
      // return new ErrorObservable(error.error.ExceptionMessage);
      else if (error.error && error.error.hasOwnProperty('errorMessage')) {
        if (error.error.errorMessage instanceof Array) return new ErrorObservable(error.error.errorMessage.join('\n'));
        else return new ErrorObservable(error.error.errorMessage);
      } else console.error(`error message`, error.message);
      return new ErrorObservable(`An error occured.`);
    }
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Router } from "@angular/router";
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { RtcRole, RtcTokenBuilder } from "../agora-token";

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  static API_BASED_URL = 'https://apitest.toobibs.org/v1/';
  WEB_BASED_URL = 'https://api.toobibs.com/public/';

  private snapshotChangesSubscription: any;
  constructor(
    private http: HttpClient,
    private router: Router,
    public afs: AngularFirestore,
    private toastr: ToastrService
  ) { }

  performPostRequest(path, body) {
    return new Promise((resolve, reject) => {
      this.http.post(ApiService.API_BASED_URL + path, body,
        {
          headers: new HttpHeaders({
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          })
        })
        .subscribe(response => {
          resolve(response)
        }, error => {
          reject(error)
        })
    })
  }


  performGetRequest(path) {
    return new Promise((resolve, reject) => {
      this.http.get(ApiService.API_BASED_URL + path,
        {
          headers: new HttpHeaders({
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          })
        })
        .subscribe(response => {
          resolve(response)
        }, error => {
          reject(error)
        })
    })
  }

  

  /**
   * Call GET endpoint
   * Path params should be sent directly on the path
   * @param path
   * @param queryParams
   * @param addToken
   */
  performRemoteGETCall(path): Observable<any> {
    return this.http.get(path)
  }

  performRemoteGETCallNonJson(path): Observable<any> {
    return this.http.get(path, { responseType: 'text' })
  }


  performRemotePOSTTextCall(path, params): Observable<any> {
    return this.http.post(path, params, { responseType: 'text' });//, this.optionRequete)
  }

  performRemotePOSTCall2(path, bodyParams): Observable<any> {
    return this.http.post(path, bodyParams);
  }

  performPostPromise(url, params) {
    return new Promise<any>((resolve, reject) => {
      this.performRemotePOSTCall2(url, params).subscribe(result => {
        resolve(result);
      }, err => {
        reject(err);
      });
    });
  }

  performPostPromiseText(url, params) {
    return new Promise<any>((resolve, reject) => {
      this.performRemotePOSTTextCall(url, params).subscribe(result => {
        resolve(result);
      }, err => {
        reject(err);
      });
    });
  }

  /**
   * Call GET endpoint
   * Path params should be sent directly on the path
   * @param path
   * @param queryParams
   * @param addToken
   */
  performGETCall(path, queryParams, addToken = false, token = null): Observable<any> {
    let t = "Bearer " + (token == null ? localStorage.getItem('token') : token);
    let headerDict: any = {
      'Content-type': 'application/json'
    };
    if (addToken) {
      headerDict["Authorization"] = t;
    }
    let params = '';
    if (queryParams != null) {
      params = '?' + this.serialize(queryParams);
    }
    params = this.replaceAll(params, "%3A", ":");
    params = this.replaceAll(params, "%3B", ";");
    //params = params.replace("%3A", ":").replace("%3B", ";");
    //console.log(params);
    return this.http.get(ApiService.API_BASED_URL + path + params, { headers: new HttpHeaders(headerDict) })
  }

  /**
   * Call POST endpoint
   * Path params should be sent directly on the path
   * @param path
   * @param bodyParams
   * @param addMultipart
   * @param addToken
   */
  performPOSTCall(path, bodyParams, addMultipart = false, addToken = false): Observable<any> {
    let headerDict: any = {};
    if (addToken) {
      headerDict["Authorization"] = 'Bearer ' + localStorage.getItem('token');
    }
    if (!addMultipart) {
      headerDict["Content-type"] = 'application/json';
    }
    let params = '';
    return this.http.post(ApiService.API_BASED_URL + path, bodyParams, { headers: new HttpHeaders(headerDict) })
  }

  /**
   * Call POST endpoint
   * Path params should be sent directly on the path
   * @param path
   * @param bodyParams
   * @param addMultipart
   * @param addToken
   */
  performRemotePOSTCall(path, bodyParams): Observable<any> {
    return this.http.post(path, bodyParams)
  }

  /**
   * Call PUT endpoint
   * Path params should be sent directly on the path
   * @param path
   * @param bodyParams
   * @param addMultipart
   * @param addToken
   */
  performPUTCall(path, bodyParams, addMultipart = false, addToken = false): Observable<any> {
    let headerDict: any = {};
    if (addToken) {
      headerDict["Authorization"] = 'Bearer ' + localStorage.getItem('token');
    }
    if (!addMultipart) {
      headerDict["Content-type"] = 'application/json';
    }
    let params = '';
    return this.http.put(ApiService.API_BASED_URL + path, bodyParams, { headers: new HttpHeaders(headerDict) })
  }

  /**
   * Call PATCH endpoint
   * Path params should be sent directly on the path
   * @param path
   * @param bodyParams
   * @param addMultipart
   * @param addToken
   */
  performPATCHCall(path, bodyParams, addMultipart = false, addToken = false): Observable<any> {
    let headerDict: any = {};
    if (addToken) {
      headerDict["Authorization"] = 'Bearer ' + localStorage.getItem('token');
    }
    if (!addMultipart) {
      headerDict["Content-type"] = 'application/json';
    }
    let params = '';
    return this.http.patch(ApiService.API_BASED_URL + path, bodyParams, { headers: new HttpHeaders(headerDict) })
  }

  /**
   * Call DELETE endpoint
   * Path params should be sent directly on the path
   * @param path
   * @param addToken
   */
  performDELETECall(path, addToken = false): Observable<any> {
    let headerDict: any = {
      'Content-type': 'application/json'
    };
    if (addToken) {
      headerDict["Authorization"] = 'Bearer ' + localStorage.getItem('token');
    }
    let params = '';
    return this.http.delete(ApiService.API_BASED_URL + path, { headers: new HttpHeaders(headerDict) })
  }


  serialize(obj) {
    var str: any[] = [];
    for (var p in obj) {
      if (obj.hasOwnProperty(p)) {
        str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
      }
    }
    return str.join("&");
  }

  handleErrors(res) {
    this.toastr.error(res, "Une erreur est survenue");
    if (res == "An Exception occurred when trying to authenticate the User.") {
      localStorage.removeItem("token");
      localStorage.removeItem("token_data");
      localStorage.removeItem("user");
      localStorage.removeItem("rates");
      localStorage.removeItem("expires");
      localStorage.removeItem("call");
      this.router.navigate(["/login"]);
    }
  }

  displayMessage(title, res) {
    this.toastr.success(res, title);
  }

  displayMessageError(title,res){
    this.toastr.error(res,title)
  }

  generatePassword() {
    return Array(8).fill("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz").map(function (x) {
      return x[Math.floor(Math.random() * x.length)]
    }).join('');
  }

  generateNumericCode() {
    return Array(5).fill("0123456789").map(function (x) {
      return x[Math.floor(Math.random() * x.length)]
    }).join('');
  }

  isValidEmail(email) {
    let regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    return regexp.test(email);
  }

  static getUser() {
    return localStorage.getItem("user") == null ? null : JSON.parse(localStorage.getItem("user") || '');
  }

  static addZeroToNumber(number) {
    return parseInt(number) < 10 ? "0" + number : number;
  }

  addZeroToNumber(number) {
    return parseInt(number) < 10 ? "0" + number : number;
  }

  static formatDateFromString(date) {
    let date_ = date.split("-");
    const day = ApiService.addZeroToNumber(parseInt(date_[2]));
    const month = ApiService.addZeroToNumber(parseInt(date_[1]));
    return date_[0] + "-" + month + "-" + day;
  }

  formatDateFromString(date) {
    let date_ = date.split("-");
    const day = ApiService.addZeroToNumber(parseInt(date_[2]));
    const month = ApiService.addZeroToNumber(parseInt(date_[1]));
    return date_[0] + "-" + month + "-" + day;
  }

  static converStringToDate(date) {
    let date_ = date.split("-");
    const day = parseInt(date_[2]);
    const month = parseInt(date_[1]);
    return new Date(parseInt(date_[0]), month - 1, day);
  }

  converStringToDate(date) {
    let date_ = date.split("-");
    const day = parseInt(date_[2]);
    const month = parseInt(date_[1]);
    return new Date(parseInt(date_[0]), month - 1, day);
  }

  static formatTimeFromString(time) {
    const time_ = time.split(":");
    const hour = time_[0].length == 2 ? time_[0] : ApiService.addZeroToNumber(time_[0]);
    const minute = time_[1].length == 2 ? time_[1] : ApiService.addZeroToNumber(time_[1]);
    return hour + ":" + minute;
  }

  formatTimeFromString(time) {
    const time_ = time.split(":");
    const hour = time_[0].length == 2 ? time_[0] : ApiService.addZeroToNumber(time_[0]);
    const minute = time_[1].length == 2 ? time_[1] : ApiService.addZeroToNumber(time_[1]);
    return hour + ":" + minute;
  }

  replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
  }

  addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes * 60000);
  }

  /**
   * Adds time to a date. Modelled after MySQL DATE_ADD function.
   * Example: dateAdd(new Date(), 'minute', 30)  //returns 30 minutes from now.
   * https://stackoverflow.com/a/1214753/18511
   *
   * @param date  Date to start with
   * @param interval  One of: year, quarter, month, week, day, hour, minute, second
   * @param units  Number of units of the given interval to add.
   */
  dateAdd(date, interval, units) {
    if (!(date instanceof Date))
      return undefined;
    let ret: Date|undefined = new Date(date); //don't change original date
    let checkRollover = function () {
      if (ret?.getDate() != date.getDate()) ret?.setDate(0);
    };
    switch (String(interval).toLowerCase()) {
      case 'year':
        ret.setFullYear(ret.getFullYear() + units);
        checkRollover();
        break;
      case 'quarter':
        ret.setMonth(ret.getMonth() + 3 * units);
        checkRollover();
        break;
      case 'month':
        ret.setMonth(ret.getMonth() + units);
        checkRollover();
        break;
      case 'week':
        ret.setDate(ret.getDate() + 7 * units);
        break;
      case 'day':
        ret.setDate(ret.getDate() + units);
        break;
      case 'hour':
        ret.setTime(ret.getTime() + units * 3600000);
        break;
      case 'minute':
        ret.setTime(ret.getTime() + units * 60000);
        break;
      case 'second':
        ret.setTime(ret.getTime() + units * 1000);
        break;
      default:
        ret = undefined;
        break;
    }
    return ret;
  }

  /**
   * Removes time to a date. Modelled after MySQL DATE_ADD function.
   * Example: dateAdd(new Date(), 'minute', 30)  //returns 30 minutes from now.
   * https://stackoverflow.com/a/1214753/18511
   *
   * @param date  Date to start with
   * @param interval  One of: year, quarter, month, week, day, hour, minute, second
   * @param units  Number of units of the given interval to add.
   */
  dateSubtract(date, interval, units) {
    if (!(date instanceof Date))
      return undefined;
    let ret: Date|undefined = new Date(date); //don't change original date
    let checkRollover = function () {
      if (ret?.getDate() != date.getDate()) ret?.setDate(0);
    };
    switch (String(interval).toLowerCase()) {
      case 'year':
        ret.setFullYear(ret.getFullYear() + units);
        checkRollover();
        break;
      case 'quarter':
        ret.setMonth(ret.getMonth() - 3 * units);
        checkRollover();
        break;
      case 'month':
        ret.setMonth(ret.getMonth() - units);
        checkRollover();
        break;
      case 'week':
        ret.setDate(ret.getDate() - 7 * units);
        break;
      case 'day':
        ret.setDate(ret.getDate() - units);
        break;
      case 'hour':
        ret.setTime(ret.getTime() - units * 3600000);
        break;
      case 'minute':
        ret.setTime(ret.getTime() - units * 60000);
        break;
      case 'second':
        ret.setTime(ret.getTime() - units * 1000);
        break;
      default:
        ret = undefined;
        break;
    }
    return ret;
  }

  /**
   * generate groups of 4 random characters
   * @example getUniqueId(1) : 607f
   * @example getUniqueId(2) : 95ca-361a-f8a1-1e73
   */
  getUniqueId(parts: number): string {
    const stringArr: any[] = [];
    for (let i = 0; i < parts; i++) {
      // tslint:disable-next-line:no-bitwise
      const S4 = (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
      stringArr.push(S4);
    }
    return stringArr.join('-');
  }

  getFormData(object) {
    const formData = new FormData();
    Object.keys(object).forEach(key => formData.append(key, object[key]));
    return formData;
  }



  getAlldata(table) {
    return new Promise<any>((resolve, reject) => {
      this.snapshotChangesSubscription = this.afs.collection(table).valueChanges({ idField: 'dataId' })
        .subscribe(snapshots => {
          resolve(snapshots);
        }, err => {
          reject(err);
        });
    });
  }

  generateToken(channelName, uid , role) {
    const appID = '3835febde3994afba559b3c60728709f';
    const appCertificate = '62b80f7868cc4ba1800b4fdb86678bd3';
    //const uid = 2882341273;
    //const account = "2882341273";

    const expirationTimeInSeconds = 3600;

    const currentTimestamp = Math.floor(Date.now() / 1000);

    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    const token_expire = 600;

    // IMPORTANT! Build token with either the uid or with the user account. Comment out the option you do not want to use below.

    // Build token with uid
    return RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, channelName, uid, role, token_expire, privilegeExpiredTs);
    // return 0;
  }


  searchData(q) {
    const towns = [
      "Abidjan",
      "Bouaké",
      "Daloa",
      "Yamoussoukro",
      "San-Pédro",
      "Divo",
      "Korhogo",
      "Abengourou",
      "Man",
      "Gagnoa",
      "Soubré",
      "Agboville",
      "Dabou",
      "Grand-Bassam",
      "Bouaflé",
      "Issia",
      "Sinfra",
      "Katiola",
      "Bingerville",
      "Adzopé",
      "Séguéla",
      "Bondoukou",
      "Oumé",
      "Ferkessédougou",
      "Dimbokro",
      "Odienné",
      "Duékoué",
      "Danané",
      "Tingréla",
      "Guiglo",
      "Boundiali",
      "Agnibilékrou",
      "Daoukro",
      "Vavoua",
      "Zuénoula",
      "Tiassalé",
      "Toumodi",
      "Akoupé",
      "Lakota",
      "Marcory",
      "Port-Bouët",
      "Koumassi",
      "Cocody",
      "Treichville",
      "Attécoubé",
      "Adjamé",
      "Abobo",
      "Le Plateau",
      "Yopougon",

      "Abuja",
      "Accra",
      "Addis-Abeba",
      "Alger",
      "Antananarivo",
      "Asmara",
      "Bamako",
      "Bangui",
      "Banjul",
      "Bissau",
      "Bloemfontein",
      "Brazzaville",
      "Bujumbura",
      "Conakry",
      "Le Caire",
      "Le Cap",
      "Cotonou",
      "Dakar",
      "Djibouti",
      "Djouba",
      "Dodoma",
      "Yaoundé",
      "Freetown",
      "Gaborone",
      "Gitega",
      "Harare",
      "Kampala",
      "Khartoum",
      "Kigali",
      "Kinshasa",
      "Libreville",
      "Lilongwe",
      "Lomé",
      "Luanda",
      "Lusaka",
      "Malabo",
      "Maputo",
      "Maseru",
      "Mbabane",
      "Mogadiscio",
      "Monrovia",
      "Moroni",
      "Nairobi",
      "Ndjamena",
      "Niamey",
      "Nouakchott",
      "Ouagadougou",
      "Port-Louis",
      "Porto-Novo",
      "Praia",
      "Pretoria ",
      "Rabat",
      "São Tomé",
      "Tripoli",
      "Tunis",
      "Victoria",
      "Windhoek",
      "Douala"
    ];
    const result: any[] = [];
    towns.forEach(t => {
      if (t.toLowerCase().includes(q.toLowerCase())) {
        result.push(t);
      }
    });
    return result;
  }

}

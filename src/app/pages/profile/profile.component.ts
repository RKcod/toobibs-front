import { Component, OnInit } from '@angular/core';
import {NgbCalendar, NgbDate} from "@ng-bootstrap/ng-bootstrap";
import {ApiService} from "../../api/api.service";
import {ActivatedRoute, Router} from "@angular/router";
import {NgxSpinnerService} from "ngx-spinner";
import localeFr from "@angular/common/locales/fr";
import {registerLocaleData} from "@angular/common";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  lat: number;
  lng: number;
  zoom: number;

  fromDate: NgbDate;
  toDate: NgbDate | null = null;

  hoveredDate: NgbDate | null = null;

  draggable = true;
  my_marker_icon = {
    url: 'https://demo.toobibs.com/marker_blue.png',
    scaledSize: {
      width: 50,
      height: 50
    }
  };
  their_marker_icon = {
    url: 'https://demo.toobibs.com/marker_light.png',
    scaledSize: {
      width: 45,
      height: 45
    }
  };

  firstDay: any = null;
  lastDay: any = null;

  id: any = null;
  doctor: any = null;

  user: any = ApiService.getUser();

  groupedList: any[] = [];

  localesF = localeFr;
  viewDate: Date = ApiService.converStringToDate(new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate());

  positions: any[] = [];
  usermetas: any = [];
  events: any[] = [];

  constructor(calendar: NgbCalendar, public api: ApiService, public activedRoute: ActivatedRoute, public router: Router, private spinner: NgxSpinnerService) {
    registerLocaleData(localeFr);
    this.fromDate = calendar.getToday();
    var curr = new Date;
    this.firstDay = new Date(curr.setDate((curr.getDate() - curr.getDay())));
    this.lastDay = new Date(curr.setDate(curr.getDate() - curr.getDay()+8));
    this.toDate = calendar.getNext(calendar.getToday(), 'd', 10);
    this.activedRoute.params.subscribe((params: any) => {
      this.id = params.id;
      //console.log(this.id);
      this.getDoctor();
    });
  }

  ngOnInit(): void {
    this.setCurrentLocation();

  }

  setPositions(){
    //this.results.forEach(r=> {
      if(this.doctor.center != null ){
        this.positions.push({lat: this.doctor.center.data.lat, lng : this.doctor.center.data.lng, label: this.doctor.center.data.name, doctor: this.doctor.first_name +" "+ this.doctor.last_name, phone: this.doctor.phone});
      }
    //});
  }

  checkIn(arr: any[], val){
    // let r = false;
    // arr.forEach((a: any) => {
    //   if(a == val){
    //     r = true;
    //     return r;
    //   }
    // });
    // return r;
    return arr.includes(val);
  }

  groupAvailabilties(){
    const uniqueDates: any[] = [];
    const results: any[] = [];
    this.doctor?.availabilities.data.forEach((a: any) => {
      if(!this.checkIn(uniqueDates, a.date)){
        uniqueDates.push(a.date);
      }
    });
    uniqueDates.forEach(d=> {
      let av: any[] = [];
      this.doctor?.availabilities.data.forEach((a: any) => {
        if(a.date == d){
          av.push(a);
        }
      });
      results.push({date : d, availability: av});
    });
    this.groupedList = results;
    //console.log(results);
    return results;
  }

  getDoctor(){
    this.spinner.show();
    this.api.performGETCall("users/"+this.id, {include: "availabilities"}, true).subscribe(res => {
      //console.log(res);
      this.spinner.hide();
      this.doctor = res.data;
      this.events = this.getEvents2(this.doctor.availabilities.data, this.doctor.id);
      this.groupAvailabilties();
      this.setPositions();
      this.loadUserMetas();
    }, err => {
      this.spinner.hide();
      //console.log(err.error);
      this.api.handleErrors(err.error.message);

    });
  }
  getEvents2(res, id) {
    let mvp: any[] = [];
    res.forEach((d: any) => {
      if (d.status == 0) {
        let d_ = ApiService.converStringToDate(d.date);
        let first_d = ApiService.converStringToDate(new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate());
        ////console.log("d",d);
        ////console.log("dd",first_d);
        let is_in_range = d_ >= first_d;// && d <= this.lastDay;
        if (is_in_range) {
          let split = ApiService.formatTimeFromString(d.start_time).split(":");
          let end_time = "";
          if (split[1] == "00") {
            end_time = split[0] + ":30";
          } else {
            end_time = ApiService.addZeroToNumber((parseInt(split[0]) + 1)) + ":00";
          }
          ////console.log(d.start_time + "  " + end_time);
          mvp.push({
            title: ApiService.formatTimeFromString(d.start_time),
            doctor_id: id,
            date_av: d.date,
            time_av: d.real_id,
            allDay: false,
            start: new Date(ApiService.formatDateFromString(d.date) + ' ' + ApiService.formatTimeFromString(d.start_time)) ,
            end: new Date(ApiService.formatDateFromString(d.date) + ' ' + end_time)

          });
        }
      }
    });
    return mvp;
  }



  nextWeek(){
    ////console.log(id);
    this.viewDate = this.api.dateAdd( this.viewDate, "week", 1) || new Date();
  }

  prevWeek(){
    ////console.log(id);
    this.viewDate = this.api.dateSubtract( this.viewDate, "week", 1) || new Date();
  }

  filterMeta(type){
    const res: any[] = [];
    this.usermetas.forEach(meta => {
      if(meta.type == type)
        res.push(meta);
    });
    return res;
  }

  eventClick2(arg) {
    //arg.description
    //console.log("args", arg);
    ////console.log("clicked", arg.event._def.extendedProps);
    this.router.navigate(["/book-appointment/" + arg.event.doctor_id], {
      queryParams: {
        date: arg.event.date_av,
        time: arg.event.time_av
      }
    });
    //this.open(arg.event._def.extendedProps.id_appointment);
  }

  loadUserMetas(){
    //this.spinner.show();
    this.api.performGETCall("usermetas", {search: "doctor_id:"+this.doctor.real_id}, true).subscribe(res=> {
      //console.log("user metas : ",res);
      //this.spinner.hide();
      this.usermetas = res.data;
    }, err => {
      //this.spinner.hide();
      this.api.handleErrors(err.error.message);
    });
  }
  private setCurrentLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        //console.log(position);
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
        this.zoom = 15;
      });
    }
  }

  onDateSelection(date: NgbDate) {
    /*if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date.after(this.fromDate)) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }*/
    return false;
  }

  isInside(date: NgbDate, dates) {
    let res = false;
    for(let d of this.doctor?.availabilities.data){
      let splitted = d.date.split("-");
      let ngD = new NgbDate(splitted[0], splitted[1], splitted[2]);
      if(splitted[0] == date.year && splitted[1] == date.month && splitted[2] == date.day){
        res = true;
        break;
      }
    }
    return res;
  }
/*
  isRange(date: NgbDate) {
    return date.equals(this.fromDate) || (this.toDate && date.equals(this.toDate)) || this.isInside(date) || this.isHovered(date);
  }

  isHovered(date: NgbDate) {
    return this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
  }
  */

  checkDate(date: any) {
    let d = ApiService.converStringToDate(date);
    return d >= this.firstDay && d <= this.lastDay;
  }

  getDate(date){
    let date_ = ApiService.converStringToDate(date);
    return date_.toLocaleDateString("fr-FR", { weekday: 'long' });
  }

  openRdv(id, date, time) {

    let d_ = ApiService.converStringToDate(date);
    let first_d = ApiService.converStringToDate(new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate());
    ////console.log("d",d);
    ////console.log("dd",first_d);
    let is_in_range = d_ >= first_d;// && d <= this.lastDay;
    if (is_in_range) {
      this.router.navigate(["/book-appointment/" + id], {
        queryParams: {
          date: date,
          time: time
        }
      });
    }
    else {
      this.api.handleErrors("Vous ne pouvez pas prendre rendez-vous pour des jours passés!");
    }
  }
}

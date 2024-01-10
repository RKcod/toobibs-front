import {Component, OnInit} from '@angular/core';
import {NgbCalendar, NgbDate} from "@ng-bootstrap/ng-bootstrap";
import {ApiService} from "../../api/api.service";
import {ActivatedRoute, Router} from "@angular/router";
import {NgxSpinnerService} from "ngx-spinner";
// import frLocale from "@fullcalendar/core/locales/fr";
// import {CalendarOptions} from "@fullcalendar/common";
import localeFr from '@angular/common/locales/fr';
import { registerLocaleData } from '@angular/common';
import {CalendarDateFormatter} from "angular-calendar";
import {CustomDateFormatter} from "../../api/CustomDateFormatter";


@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss'],
  providers: [
    {
      provide: CalendarDateFormatter,
      useClass: CustomDateFormatter,
    },
  ]
})
export class SearchResultsComponent implements OnInit {
  lat: number;
  lng: number;
  zoom: number;


  propositions: any[] = [];
  location = "";
  proposing = false;
  is_proposing = false;

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

  positions: any[] = [];
  adresses: any[] = [];

  data = {
    query: "",
    location: ""
  };

  results: any[] = [];
  meta: any = {
    pagination: {
      total: 0,
      per_page: 10
    }
  };
  pageEvent: void;

  localesF = localeFr;
  filter = "all";
  viewDate = ApiService.converStringToDate(new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate());

  constructor(calendar: NgbCalendar, public api: ApiService, public activedRoute: ActivatedRoute, public router: Router, private spinner: NgxSpinnerService) {
    registerLocaleData(localeFr);
    this.fromDate = calendar.getToday();
    this.toDate = calendar.getNext(calendar.getToday(), 'd', 10);
    this.activedRoute.queryParams.subscribe((params: any) => {
      this.data.query = params.query;
      this.data.location = params.location;
      if(this.data.query.trim().length > 0 || this.data.location.trim().length > 0)
        this.searchDoctor(1, "all");
    });
  }

  ngOnInit(): void {
    this.setCurrentLocation();

  }


  searchDoctor($event, filter) {
    //console.log($event);
    if (filter != null)
      this.filter = filter;
    if (!isNaN($event)) {
      this.spinner.show();
      const f: any = {
        pageIndex: $event,
        include: "availabilities",
        queries: this.data.query,
        location: this.data.location
      };
      if (this.filter == "do_teleconsult") {
        f.do_teleconsult = 1;
      }
      if (this.filter == "availability") {
        f.availability = 1;
      }
      this.api.performGETCall("searchusers", f).subscribe(res => {
        //console.log(res);
        this.spinner.hide();
        const dr: any[] = [];
        res.data.forEach(d => {
          //d.calendar_options = this.getConf(d.availabilities.data, d.id);
          if(d.av.length > 0){
            d.viewDate = ApiService.converStringToDate(d.av[0].date);
          }
          else {
            d.viewDate = ApiService.converStringToDate(new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate());
          }
          d.events = this.getEvents2(d.availabilities.data, d.id);
        });
        this.results = res.data;
        this.meta = res.meta.custom;
        this.setPositions();
      }, err => {
        this.spinner.hide();
        //console.log(err.error);
        this.api.handleErrors(err.error.message);

      });
    }

  }

  nextWeek(id){
    //console.log(id);
    this.results[id].viewDate = this.api.dateAdd(this.results[id].viewDate, "week", 1);
  }

  prevWeek(id){
    //console.log(id);
    this.results[id].viewDate = this.api.dateSubtract(this.results[id].viewDate, "week", 1);
  }

  getEvents(res, id) {
    let mvp: any[] = [];
    res.forEach(d => {
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
          //console.log(d.start_time + "  " + end_time);
          mvp.push({
            title: ApiService.formatTimeFromString(d.start_time),
            doctor_id: id,
            date_av: d.date,
            time_av: d.real_id,
            start: ApiService.formatDateFromString(d.date) + ' ' + ApiService.formatTimeFromString(d.start_time),
            end: ApiService.formatDateFromString(d.date) + ' ' + end_time
          });
        }
      }
    });
    return mvp;
  }

  getEvents2(res, id) {
    let mvp: any[] = [];
    res.forEach(d => {
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

  getConf(data: any, id: any) {
    return {
      headerToolbar: {
        left: 'title',
        center: '',
        right: 'prev,next'
      },
      allDaySlot: false,
      slotMinTime: "08:00:00",
      slotMaxTime: "19:00:00",
      expandRows: true,
      height: 350,
      events: this.getEvents(data, id),
      eventClick: this.eventClick.bind(this),
      locale: 'fr',
      // locales: [frLocale],
      initialView: 'timeGridWeek',
    };
  }

  eventClick(arg) {
    //arg.description
    //console.log("args", arg);
    //console.log("clicked", arg.event._def.extendedProps);
    this.router.navigate(["/book-appointment/" + arg.event._def.extendedProps.doctor_id], {
      queryParams: {
        date: arg.event._def.extendedProps.date_av,
        time: arg.event._def.extendedProps.time_av
      }
    });
    //this.open(arg.event._def.extendedProps.id_appointment);
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


  setPositions() {
    this.positions = [];
    this.results.forEach((r: any) => {
      if (r.center != null) {
        this.positions.push({
          lat: r.center.data.lat,
          lng: r.center.data.lng,
          label: r.center.data.name,
          doctor: r.first_name + " " + r.last_name,
          phone: r.phone
        });
      }
    });
  }

  private setCurrentLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position: any) => {
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

  isInside(date: NgbDate, dates: any) {
    let res = false;
    for (let d of dates) {
      let splitted: any = d.date.split("-");
      let ngD = new NgbDate(splitted[0], splitted[1], splitted[2]);
      if (splitted[0] == date.year && splitted[1] == date.month && splitted[2] == date.day) {
        res = true;
        break;
      }
    }
    return res;
  }

  isRange(date: NgbDate, dates) {
    ////console.log(date);
    let res = false;
    for (let d of dates) {
      let splitted = d.date.split("-");
      let ngD = new NgbDate(splitted[0], splitted[1], splitted[2]);
      res = date.equals(ngD);
      if (res)
        break;
      //return date.equals(ngD);
    }
    return res;//date.equals(this.fromDate) || (this.toDate && date.equals(this.toDate)) || this.isInside(date) || this.isHovered(date);
  }

  isHovered(date: NgbDate) {
    return this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
  }

  closeOpenMonthViewDay() {

  }

  searchLocation(e: any){
    console.log(e);
    const f: any = {
      limit: 0,
      queries: "",
      location: this.data.location+""+e.key
    };
    this.is_proposing = true;
    this.proposing = true;


    this.proposing = false;
    const dr: any[] = [];
    this.propositions = [];
    this.propositions = this.api.searchData(this.data.location);
    /*this.api.performGETCall("searchusers", f).subscribe(res => {
      //console.log(res);
      this.proposing = false;
      const dr: any[] = [];
      this.propositions = [];
      res.data.forEach(d=> {
        if(!this.propositions.includes(d.address))
          this.propositions.push(d.address);
      });
      console.log("address", this.propositions);

    }, err => {
      this.spinner.hide();
      //console.log(err.error);
      this.api.handleErrors(err.error.message);

    });*/
  }

  setAddress(a: any) {
    this.data.location = a;
    this.closeProposition();
  }

  closeProposition(){
    this.is_proposing = false;
  }
}

import { Component, OnInit, ViewChild } from '@angular/core';
import { CalendarOptions } from "@fullcalendar/core";
import frLocale from "@fullcalendar/core/locales/fr";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { EventDetailsComponent } from "./event-details/event-details.component";
import { ApiService } from "../../api/api.service";
import { Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { FullCalendarComponent } from "@fullcalendar/angular";
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {

  //@ViewChild(content)
  @ViewChild("mvp") mvp!: FullCalendarComponent;

  calendarOptions: CalendarOptions = {
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    eventClick: this.eventClick.bind(this),
    locale: "fr",
    // allDaySlot: false,
    locales: [frLocale],
    initialView: 'dayGridMonth',
    slotMinTime: "08:00:00",
    slotMaxTime: "19:00:00",
    plugins: [
      dayGridPlugin,
      timeGridPlugin,
      listPlugin,
      interactionPlugin
    ]
  };
  user = ApiService.getUser();


  constructor(private modalService: NgbModal, public api: ApiService, public router: Router, private spinner: NgxSpinnerService) {
  }

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    this.spinner.show();
    let params = {};
    if (this.user.user_type == "DOCTOR") {
      params = { search: "doctor_id:" + this.user.real_id, limit: 0 }
    }
    else {
      params = { search: "users_id:" + this.user.real_id, limit: 0, include: 'doctor' }
    }
    this.api.performGETCall("appointments", params, true).subscribe(res => {
      this.spinner.hide();
      console.log('data', res);
      const ev: any[] = [];
      this.mvp.getApi().removeAllEvents();
      res.data.forEach(d => {
        let title = "";
        if (this.user.user_type == "DOCTOR") {
          title = 'Rdv avec' + d.first_name + ' ' + d.last_name;
        }
        else {
          title = 'Rdv avec \n' + d?.doctor?.data?.first_name + ' ' + d?.doctor?.data?.last_name;
        }
        /*console.log({
          title: title,
          id_appointment: d.id,
          start: ApiService.formatDateFromString(d.date) +' '+ ApiService.formatTimeFromString(d.time),
          //textColor: this.checkDatePassed(d.date) ? (d.status == 2 ? "#FF0000" : "#008000") : '#FF0000',
          backgroundColor: this.checkDatePassed(d.date) ? (d.status == 2 ? "#FF0000" : "#008000") : '#FF0000',
          //textColor: this.checkDatePassed(d.date) ? (d.status == 2 ? "red" : "#008000") : 'red',

        });*/
        this.mvp.getApi().addEvent({
          title: title,
          id_appointment: d.id,
          start: ApiService.formatDateFromString(d.date) + ' ' + ApiService.formatTimeFromString(d.time),
          //textColor: this.checkDatePassed(d.date) ? (d.status == 2 ? "#FF0000" : "#008000") : '#FF0000',
          backgroundColor: this.checkDatePassed(d.date) ? (d.status == 2 ? "#FF0000" : d.status == 3 ? "#FFA500" : "#008000") : '#FF0000',
          //textColor: this.checkDatePassed(d.date) ? (d.status == 2 ? "red" : "#008000") : 'red',

        });
      });
      this.mvp.getApi().render();
    }, err => {
      this.spinner.hide();
      //console.log(err.error);
      this.api.handleErrors(err.error.message);
    });
  }


  checkDatePassed(date) {
    let d = this.api.converStringToDate(date);
    const firstDay = new Date();
    let today = ApiService.converStringToDate(firstDay.getFullYear() + "-" + (firstDay.getMonth() + 1) + "-" + firstDay.getDate());

    ////console.log("test : ", (+d >= +today));
    return +d >= +today;
  }
    eventClick(arg) {
    //arg.description
    //console.log("args", arg);
    //console.log("clicked", arg.event._def.extendedProps.id_appointment);
    this.open(arg.event._def.extendedProps.id_appointment);
  }

  open(id) {
    const $this = this;
    const modalRef = this.modalService.open(EventDetailsComponent, {
      ariaLabelledBy: 'modal-basic-title', windowClass: 'event',
      backdrop: 'static',
      keyboard: false
    });
    modalRef.componentInstance.event_id = id;
    modalRef.result.then((result) => {
      //this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      //console.log(reason);
      if (reason != "none")
        $this.getData();

    });
    // modalRef
  }

}

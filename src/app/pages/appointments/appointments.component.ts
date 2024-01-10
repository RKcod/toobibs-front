import {Component, OnInit, ViewChild} from '@angular/core';
import { FullCalendarComponent} from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import frLocale from '@fullcalendar/core/locales/fr';
import { ApiService } from "../../api/api.service";
import { Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.scss']
})
export class AppointmentsComponent implements OnInit {

  calendarOptions: CalendarOptions = {
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },
    locale: "fr",
    locales: [ frLocale ],
    initialView: 'timeGridWeek',
    events: [
      { title: 'event 1', date: '2020-08-17' },
      { title: 'event 2', date: '2020-08-18' }
    ],
    plugins: [
      dayGridPlugin,
      timeGridPlugin,
      listPlugin,
      interactionPlugin
    ]
  };

  @ViewChild("mvp") mvp!:FullCalendarComponent;

  user = ApiService.getUser();

  constructor(public api: ApiService, public router: Router, private spinner: NgxSpinnerService) { }


  ngOnInit(): void {
    this.getData();
  }

  getData(){
    this.spinner.show();
    this.api.performGETCall("availabilities", {search: "users_id:"+this.user.real_id}, true).subscribe(res => {
      this.spinner.hide();
      //console.log(res);
      const ev: any[] = [];
      this.mvp.getApi().removeAllEvents();
      res.data.forEach(d=> {
        this.mvp.getApi().addEvent({
          title: 'Disponible', start: ApiService.formatDateFromString(d.date) +' '+ ApiService.formatTimeFromString(d.start_time), end:  ApiService.formatDateFromString(d.date) +' '+ ApiService.formatTimeFromString(d.end_time)

        });
      });
      this.mvp.getApi().render();
    }, err => {
      this.spinner.hide();
      //console.log(err.error);
      this.api.handleErrors(err.error.message);
    });
  }

}

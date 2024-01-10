import { Component, OnInit, ViewChild } from '@angular/core';
import { CalendarOptions } from "@fullcalendar/core";
import frLocale from "@fullcalendar/core/locales/fr";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { AddAvailabilityComponent } from "./add-availability/add-availability.component";
import { ApiService } from "../../api/api.service";
import { Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { FullCalendarComponent } from "@fullcalendar/angular";
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';

@Component({
  selector: 'app-set-calendar',
  templateUrl: './set-calendar.component.html',
  styleUrls: ['./set-calendar.component.scss']
})
export class SetCalendarComponent implements OnInit {

  @ViewChild("mvp") mvp!: FullCalendarComponent;

  calendarOptions: CalendarOptions = {
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    locale: "fr",
    // allDaySlot: false,
    locales: [frLocale],
    initialView: 'timeGridWeek',
    slotMinTime: "08:00:00",
    slotMaxTime: "19:00:00",
    events: [], // Liste des événements
    eventClick: (calEvent) => {
      this.handleEventClick(calEvent);
    },
    plugins: [
      dayGridPlugin,
      timeGridPlugin,
      listPlugin,
      interactionPlugin
    ]
  };
  startDate: any;

  user: any = ApiService.getUser();

  constructor(private modalService: NgbModal, public api: ApiService, public router: Router, private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.getData();
  }


  handleEventClick(event: any) {
    const availabilityId = event.event._def.extendedProps.availabilityId;
    if (confirm('Êtes-vous sûr de vouloir supprimer cet événement?')) {
      this.onDelete(availabilityId)
    }
  }

  onDelete(id) {
    this.api.performDELETECall("availabilities/" + id, true).subscribe(res => {
      this.api.displayMessage("Succès", "Address supprimée avec succès");
      this.ngOnInit();
    }, err => {
      this.api.handleErrors(err.error.message);
    });
  }

  getData() {
    this.spinner.show();
    this.api.performGETCall("availabilities", { search: "users_id:" + this.user.real_id, limit: 0 }, true).subscribe(res => {
      this.spinner.hide();
      //console.log(res);
      const ev: any[] = [];
      this.mvp.getApi().removeAllEvents();
      res.data.forEach(d => {
        this.mvp.getApi().addEvent({
          title: this.checkDatePassed(d.date) ? (d.status == 0 ? "Disponible" : "Occupé") : 'Passé', start: ApiService.formatDateFromString(d.date) + ' ' + ApiService.formatTimeFromString(d.start_time),
          availabilityId: d.id,
          backgroundColor: this.checkDatePassed(d.date) ? (d.status == 0 ? "#FFA500" : "#008000") : '#FF0000',
        });

      });
      this.mvp.getApi().render();
      let blockAvai = document.getElementsByClassName('fc-event-main-frame');
      var closeButton = document.createElement("span");
      closeButton.innerHTML = "X";
      closeButton.classList.add("close-button");
      for (let i = 0; i < blockAvai.length; i++) {
        blockAvai[i].addEventListener('mouseover', function () {
          blockAvai[i].classList.add('icon-remove');
          blockAvai[i].appendChild(closeButton);
          blockAvai[i].appendChild(closeButton.cloneNode(true));
        });
        blockAvai[i].addEventListener('mouseleave', function () {
          blockAvai[i].classList.remove('icon-remove');
        });
      }
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
  open() {
    const $this = this;
    this.modalService.open(AddAvailabilityComponent, { ariaLabelledBy: 'modal-basic-title', windowClass: 'availability' }).result.then((result) => {
      //this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      $this.getData();

    });
  }

}

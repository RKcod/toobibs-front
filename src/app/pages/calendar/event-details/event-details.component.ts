import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ApiService } from "../../../api/api.service";
import { Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { CallWindowComponent } from "../../call-window/call-window.component";
import { AngularFirestore } from "@angular/fire/compat/firestore";

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.scss']
})
export class EventDetailsComponent implements OnInit {
  @Input() public event_id: any;

  user: any = ApiService.getUser();
  event: any = null;
  prescription: any = null;
  action = "none";
  constructor(public afs: AngularFirestore,
    public activeModal: NgbActiveModal,
    private modalService: NgbModal,
    public api: ApiService,
    public router: Router,
    private spinner: NgxSpinnerService) {}

  ngOnInit(): void {
    this.spinner.show();
    let params: any = null;
    if (this.user.user_type == "PATIENT") {
      params = { include: 'doctor' }
    } else {
      params = { include: 'user' }
    }
    this.api.performGETCall("appointments/" + this.event_id, params, true).subscribe(res => {
      this.spinner.hide();
      this.event = res.data;
      if (this.event.real_id) {
        this.api.performGetRequest("prescriptions-appointment?appointment_id=" + this.event.real_id).then(res => {
          this.prescription = res;
        }).catch(err => {
          // Gérer les erreurs de la deuxième requête
          console.error(err);
        });
      }
    }, err => {
      this.spinner.hide();
      //console.log(err.error);
      this.api.handleErrors(err.error.message);
    });
  }

  makePrescription(appointment) {
    this.close();
    this.router.navigate(['make-prescription'], { state: appointment });
  }

  listPrescription(prescription) {
    this.close();
    this.router.navigate(['list-prescription'], { state: prescription });
  }

  updateEvent(status) {
    this.spinner.show();
    this.api.performPATCHCall("appointments/" + this.event_id, { status: status }, false, true).subscribe(res => {
      this.spinner.hide();
      this.event = res.data;
      this.action = "event-update";
      this.api.displayMessage("Succès", "Votre décision a bien été enregistré");
      //console.log(res);
    }, err => {
      this.spinner.hide();
      //console.log(err.error);
      this.api.handleErrors(err.error.message);
    });
  }

  cancelEvent(status) {
    this.spinner.show();
    this.api.performPATCHCall("appointments/" + this.event_id, { status: status, cancel: true, initiated_by: this.user.user_type }, false, true).subscribe(res => {
      this.spinner.hide();
      this.action = "event-cancel";
      this.event = res.data;
      this.api.displayMessage("Succès", "Le rendez-vous a bien été annulé");
      //console.log(res);
    }, err => {
      this.spinner.hide();
      //console.log(err.error);
      this.api.handleErrors(err.error.message);
    });
  }

  checkDatePassed() {
    let d = this.api.converStringToDate(this.event.date);
    const firstDay = new Date();
    let today = ApiService.converStringToDate(firstDay.getFullYear() + "-" + (firstDay.getMonth() + 1) + "-" + firstDay.getDate());

    ////console.log("test : ", (+d >= +today));
    return +d >= +today;
  }

  checkDatePassed2() {
    let d = this.api.converStringToDate(this.event.date);
    const firstDay = new Date();
    let today = ApiService.converStringToDate(firstDay.getFullYear() + "-" + (firstDay.getMonth() + 1) + "-" + firstDay.getDate());

    ////console.log("test : ", (+d >= +today));
    return +d < +today;
  }

  launchCall() {
    const $this = this;
    //this.spinner.show();
    const d = {
      'user_from_id': $this.user.real_id,
      'user_to_id': $this.event.users_id,
      'rdv_id': $this.event.real_id,
      'long_id': $this.api.getUniqueId(3),
      'duration': "0:00",
      'has_missed': 0,
      first_name: this.event.first_name,
      last_name: this.event.last_name,
      phone: this.event.phone,

      dr_first_name: this.user.first_name,
      dr_last_name: this.user.last_name,
      dr_phone: this.user.phone
    };
    this.afs.collection('calls').add(d)
      .then(
        result => {
          //console.log(result);
          localStorage.setItem("call", JSON.stringify(d));
          this.spinner.hide();
          const modalRef = this.modalService.open(CallWindowComponent, {
            ariaLabelledBy: 'modal-basic-title',
            size: 'lg',
            backdrop: 'static',
            keyboard: false
          });
          modalRef.componentInstance.event_id = d.long_id;
          modalRef.componentInstance.user_id = this.event.users_id;
          modalRef.componentInstance.first_name = this.event.first_name;
          modalRef.componentInstance.phone = this.event.phone;
          modalRef.componentInstance.last_name = this.event.last_name;
          modalRef.componentInstance.direction = "caller";
          modalRef.result.then((result) => {
            //this.closeResult = `Closed with: ${result}`;
          }, (reason) => {
            localStorage.removeItem("call");
            //$this.getData();

          });
        },
        err => {

        }
      );


    /*this.api.performPOSTCall("calls", {
      'user_from_id': $this.user.real_id,
      'user_to_id': $this.event.users_id,
      'rdv_id': $this.event.real_id,
      'duration': "0:00",
      'has_missed': 0
    }, false, true).subscribe(res => {


    }, err => {
      this.spinner.hide();
      //console.log(err.error);
      this.api.handleErrors(err.error.message);

    });*/

  }

  close() {
    this.activeModal.dismiss(this.action);
  }
}

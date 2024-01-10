import {Component, OnInit, ViewChild, OnChanges} from '@angular/core';
import {ApiService} from "./api/api.service";
import {Router} from "@angular/router";
import {NgxSpinnerService} from "ngx-spinner";
import {NgbModal, NgbModalRef} from "@ng-bootstrap/ng-bootstrap";

import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';
import { AngularFirestore } from "@angular/fire/compat/firestore";
import { CallWindowPatientComponent } from "./pages/call-window-patient/call-window-patient.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Toobibs';

  user: any = ApiService.getUser();
  pee: any = null;
  private mypeerid: any;


  idleState = 'Not started.';
  timedOut = false;
  lastPing: Date|null = null;

  public modalRef: NgbModalRef;
  @ViewChild('childModal', { static: false }) childModal: any;

  constructor(private idle: Idle,
    private keepalive: Keepalive,
    public afs: AngularFirestore,
    private modalService: NgbModal,
    public api: ApiService,
    public router: Router,
    private spinner: NgxSpinnerService){

    setTimeout(()=> {
      this.user = ApiService.getUser();
      //console.log(this.user);
    }, 3000);
  }

  ngOnChanges(){
  }

  ngOnInit(): void {
    if(this.user != null){
      let date = new Date();
      if(date.getTime() >= parseInt(localStorage.getItem("expires") || '')){
        //console.log("logging out");
        //this.logout();
      }
      else {
        //console.log("session ok");
      }
    }

  }

  reset() {
    //this.modalRef.dismiss("hey");
    this.idle.watch();
    //xthis.idleState = 'Started.';
    this.timedOut = false;
  }

  hideChildModal(): void {
    //this.childModal.hide();
    //this.modalRef.dismiss("hey");
  }

  stay() {
    //this.childModal.hide();
    //this.modalRef.dismiss("hey");
    this.reset();
  }

  checkCalls(){
    this.afs.collection("calls", ref => ref.where("has_missed", '==', 0).where(this.user.user_type == "DOCTOR" ? "user_from_id" : "user_to_id", "==", this.user.real_id)).valueChanges({idField: 'dataId'})
      .subscribe((res : any) => {
        //console.log(res);
        if(res.length > 0){
          localStorage.setItem("call", JSON.stringify(res[0]));
          const modalRef = this.modalService.open(CallWindowPatientComponent, {ariaLabelledBy: 'modal-basic-title', size: 'lg',
            backdrop : 'static',
            keyboard : false});
          modalRef.componentInstance.user_id = this.user.user_type == "DOCTOR" ? res[0].user_to_id : res[0].user_from_id;
          modalRef.componentInstance.first_name = this.user.user_type == "DOCTOR" ?  res[0].first_name : res[0].dr_first_name;
          modalRef.componentInstance.last_name = this.user.user_type == "DOCTOR" ?  res[0].last_name : res[0].dr_last_name;
          modalRef.componentInstance.phone = this.user.user_type == "DOCTOR" ?  res[0].phone : res[0].dr_phone;
          modalRef.componentInstance.direction = "receiver";
          modalRef.result.then((result) => {
            //this.closeResult = `Closed with: ${result}`;
          }, (reason) => {
            localStorage.removeItem("call");
            //$this.getData();

          });
        }
      }, err => {

    });


    /*this.api.performGETCall("calls", {include: this.user.user_type == "DOCTOR" ? "user" : "doctor", user_field: this.user.user_type == "DOCTOR" ? "user_from_id" : "user_to_id", user_value: this.user.real_id, has_missed: 0}, true).subscribe(res=> {
        localStorage.setItem("call", JSON.stringify(res.data[0]));
        const modalRef = this.modalService.open(CallWindowComponent, {ariaLabelledBy: 'modal-basic-title', size: 'lg'});
        modalRef.componentInstance.user_id = this.user.user_type == "DOCTOR" ? res.data[0].users_id : res.data[0].doctor_id;
        modalRef.componentInstance.first_name = this.user.user_type == "DOCTOR" ?  res.data[0].user.data.first_name : res.data[0].doctor.data.first_name;
        modalRef.componentInstance.last_name = this.user.user_type == "DOCTOR" ?  res.data[0].user.data.last_name : res.data[0].doctor.data.last_name;
        modalRef.componentInstance.phone = this.user.user_type == "DOCTOR" ?  res.data[0].user.data.phone : res.data[0].doctor.data.phone;
        modalRef.componentInstance.direction = "receiver";
        modalRef.result.then((result) => {
          //this.closeResult = `Closed with: ${result}`;
        }, (reason) => {
          localStorage.removeItem("call");
          //$this.getData();

        });


    });*/
  }

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("token_data");
    localStorage.removeItem("user");
    localStorage.removeItem("rates");
    localStorage.removeItem("expires");
    this.router.navigate(["/login"]);
  }

  executeFunc() {

    this.user = ApiService.getUser();
    //console.log(this.user);
    if(this.user != null){
      // sets an idle timeout of 5 seconds, for testing purposes.
      this.idle.setIdle(15*60);
      // sets a timeout period of 5 seconds. after 10 seconds of inactivity, the user will be considered timed out.
      this.idle.setTimeout(15);
      // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
      this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

      this.idle.onIdleEnd.subscribe(() => {
        this.idleState = 'Plus inactif.'
        ////console.log(this.idleState);
        this.reset();
      });

      this.idle.onTimeout.subscribe(() => {
        //this.childModal.hide();
        //this.modalRef.dismiss("hey");
        this.idleState = 'Timed out!';
        this.timedOut = true;
        ////console.log(this.idleState);
        this.logout();
      });

      this.idle.onIdleStart.subscribe(() => {
        this.idleState = 'Vous avez été inactif!';
        ////console.log(this.idleState);
        //this.modalRef = this.modalService.open(this.childModal, {ariaLabelledBy: 'modal-basic-title'});
        //this.childModal.show();
      });

      this.idle.onTimeoutWarning.subscribe((countdown) => {
        this.idleState = 'Vous serrez déconnecter dans ' + countdown + ' secondes!';
        ////console.log(this.idleState);
      });

      // sets the ping interval to 15 seconds
      this.keepalive.interval(15);

      this.keepalive.onPing.subscribe(() => this.lastPing = new Date());

      this.idle.watch();
      this.timedOut = false;

    }
    if(this.user != null && this.user.user_type == "PATIENT") {
      this.checkCalls();
    }

  }
}

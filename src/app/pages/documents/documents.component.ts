import {Component, Input, OnInit} from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {ApiService} from "../../api/api.service";
import {Router} from "@angular/router";
import {NgxSpinnerService} from "ngx-spinner";

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss']
})
export class DocumentsComponent implements OnInit {
  @Input() public type: any;
  @Input() public id: any;
  data = {
    type: "",
    start_year: "",
    end_year: "",
    title: "",
    at: "",
    description: "",
    doctor_id: 0,
  };

  metas: any = null;

  constructor(public activeModal: NgbActiveModal, public api: ApiService, public router: Router, private spinner: NgxSpinnerService) { }

  ngOnInit(): void {

    this.data.type = this.type;
    if(this.id != 0){
      this.spinner.show();
      this.api.performGETCall("usermetas/" + this.id, null, true).subscribe(res => {
        this.spinner.hide();
        this.metas = res.data;
        this.data = {
          type: res.data.type,
          start_year: res.data.start_year,
          end_year: res.data.end_year,
          title: res.data.title,
          at: res.data.at,
          description: res.data.description,
          doctor_id: res.data.doctor_id,
        };
        //console.log(res);
      }, err => {
        this.spinner.hide();
        //console.log(err.error);
        this.api.handleErrors(err.error.message);
      });
    }

  }

  save() {
    //console.log(this.data);
    if (this.data.start_year.toString().length == 4 && this.data.end_year.toString().length == 4 && this.data.at.toString().length > 0 && this.data.title.toString().length > 0 && this.data.description.toString().length > 0) {

      this.data.doctor_id = ApiService.getUser().real_id;
      this.spinner.show();

      if(this.id == 0){
        this.api.performPOSTCall("usermetas", this.data, false, true).subscribe(u => {
          this.spinner.hide();
          //console.log(u);
          this.api.displayMessage("Succès", "Enregistrement éffectué avec succès");
          this.activeModal.dismiss('saved');


        }, err => {
          this.spinner.hide();
          //console.log(err.error);
          this.api.handleErrors(err.error.message);
        });
      }
      else {
        this.api.performPATCHCall("usermetas/"+this.id, this.data, false, true).subscribe(u => {
          this.spinner.hide();
          //console.log(u);
          this.api.displayMessage("Succès", "Mise à jour éffectué avec succès");
          this.activeModal.dismiss('saved');

        }, err => {
          this.spinner.hide();
          //console.log(err.error);
          this.api.handleErrors(err.error.message);
        });
      }

    } else {
      this.api.handleErrors("Veuillez remplir tous les champs!!");
    }
  }
}

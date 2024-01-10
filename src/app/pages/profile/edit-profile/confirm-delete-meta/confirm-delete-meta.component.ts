import {Component, Input, OnInit} from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {ApiService} from "../../../../api/api.service";
import {Router} from "@angular/router";
import {NgxSpinnerService} from "ngx-spinner";

@Component({
  selector: 'app-confirm-delete-meta',
  templateUrl: './confirm-delete-meta.component.html',
  styleUrls: ['./confirm-delete-meta.component.scss']
})
export class ConfirmDeleteMetaComponent implements OnInit {

  @Input() public id;

  constructor(public activeModal: NgbActiveModal, public api: ApiService, public router: Router, private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
  }

  deleteMeta() {
    if(this.id != null){
      this.spinner.show();
      this.api.performDELETECall("user_metas/"+this.id, true).subscribe(res=> {
        this.spinner.hide();
        this.api.displayMessage("Succès", "Données supprimées avec succès");
        this.activeModal.dismiss('deleted');
      }, err=>{
        this.api.handleErrors(err.error.message);
      });
    }
  }
}

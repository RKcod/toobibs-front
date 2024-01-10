import { Component, OnInit } from '@angular/core';
import { ApiService } from "../../api/api.service";
import { Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { AngularFirestore } from "@angular/fire/compat/firestore";

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss']
})
export class HelpComponent implements OnInit {

  faqs: any[] = [];

  constructor(public api: ApiService, public router: Router, public afs: AngularFirestore, private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.getFaqs();
  }

  getFaqs() {
    this.afs.collection('faqs').valueChanges({idField: 'dataId'}).subscribe(res => {
      this.faqs = res;
      console.log(this.faqs);
      console.log(res);
    }, err => {
      //console.log(err);
      //this.spinner.hide();
      this.api.handleErrors('Une erreur sest produite');
    });
  }
}

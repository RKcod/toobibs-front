import {Component, OnInit, inject} from '@angular/core';
import {ApiService} from "../../api/api.service";
import {Router} from "@angular/router";
import {NgxSpinnerService} from "ngx-spinner";
import * as firebase from 'firebase/app';
import { AngularFirestore } from "@angular/fire/compat/firestore";


@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  specialities: any[] = [];
  contact = {
    location: '',
    email: '',
    phone: '',
    cgu_pdf: '',
    cgv_pdf: ''
  };


  faqs: any[] = [];

  constructor(public api: ApiService, public router: Router, public afs: AngularFirestore, private spinner: NgxSpinnerService) {
    //console.log(this.contact)
  }

  ngOnInit(): void {
    this.getSpecialities();
    this.getContact();
  }

  getSpecialities() {
    this.api.performGETCall("specialities", {limit: 4}).subscribe(res => {
      //console.log(res);
      this.specialities = res.data;
    }, err => {
      //console.log(err.error);
      this.api.handleErrors(err.error.message);
    });
  }

  getContact() {
    this.afs.collection('contact').doc('contact').get().subscribe((doc: any) => {
      this.contact = {
        location: doc.data()?.location,
        email: doc.data()?.email,
        phone: doc.data()?.phone,
        cgu_pdf: doc.data()?.cgu_pdf,
        cgv_pdf: doc.data()?.cgv_pdf,
      }
    });
  }
}

